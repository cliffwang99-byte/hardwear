import type { PluginContext, SandboxedPlugin, SandboxedRouteContext } from "emdash/plugin";

/**
 * 翻译插件（standard 格式，就地定义，不发布）。
 *
 * 在 admin 内容编辑器工具栏提供一个「生成西语草稿」按钮，点击后：
 *  1. 读取当前英文 entry 的 data（优先用前端传来的草稿）
 *  2. 敏感字段（sku/price/images/slug 等）原样复制
 *  3. 文本字段调 DeepSeek 翻译为西语（HTML/五金术语保护）
 *  4. 写入 es 草稿（translationOf 关联英文行）
 *
 * 全程手动触发、无 cron、无沙箱、无 Workers Paid。
 */

export const TARGET_LOCALE = "es";
export const SOURCE_LOCALE = "en";

/** 明确原样复制、不进 LLM 的字段（数值/媒体/代码/slug） */
const PASS_THROUGH_FIELDS = new Set([
	"slug",
	"sku",
	"price",
	"compare_at_price",
	"original_price",
	"originalPrice",
	"images",
	"image",
	"media",
	"gallery",
	"video",
	"barcode",
	"weight",
	"dimensions",
	"stock",
	"quantity",
	"inStock",
	"featured",
	"visible",
	"status",
	"tags",
	"meta",
	"seo",
	"category",
	"collection",
	"categories",
	"created",
	"sort_order",
	"sortOrder",
	"order",
	"uid",
	"id",
	"unique",
	"code",
	"icon",
	"graphic",
	"attachment",
	"file",
	"document",
	"download",
	"map",
	"location",
	"coordinates",
	"link",
	"href",
	"url",
	"externalUrl",
]);

function isPlainObject(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** 判断该字段值是否需要送 LLM（对象型富文本也返回 true） */
function isTranslatableValue(v: unknown): boolean {
	if (typeof v === "string") return v.trim().length > 0;
	if (Array.isArray(v)) {
		// 纯字符串数组（如 features）翻译；含对象的数组做递归
		const allStrings = v.every((x): x is string => typeof x === "string");
		if (allStrings) return v.some((x) => x.trim().length > 0);
		return v.some((x) => isTranslatableValue(x));
	}
	if (isPlainObject(v)) {
		// 纯 key->value 字符串映射（如 specifications）翻译
		const entries = Object.entries(v);
		const allStrings = entries.length > 0 && entries.every(([, val]) => typeof val === "string");
		if (allStrings) {
			for (const [, val] of entries) {
				if (typeof val === "string" && val.trim().length > 0) return true;
			}
			return false;
		}
		return Object.values(v).some((x) => isTranslatableValue(x));
	}
	return false;
}

interface GatherResult {
	/** 待翻译字段（保留结构） */
	payload: Record<string, unknown>;
	/** 原样复制的敏感字段 */
	passThrough: Record<string, unknown>;
}

/**
 * 从 entry.data 拆出「待翻译」与「原样复制」两部分。
 * 敏感字段（数值/媒体/代码/slug/URL 等）不送 LLM，降低出错与 token 成本。
 */
function splitFields(data: Record<string, unknown>): GatherResult {
	const payload: Record<string, unknown> = {};
	const passThrough: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(data)) {
		// SEO 对象：取 title/description 翻译，其余原样
		if (key === "seo" && isPlainObject(value)) {
			const seoPayload: Record<string, unknown> = {};
			const seoPass: Record<string, unknown> = {};
			for (const [k, v] of Object.entries(value)) {
				if ((k === "title" || k === "description") && typeof v === "string" && v.trim()) {
					seoPayload[k] = v;
				} else if (v !== undefined && v !== null) {
					seoPass[k] = v;
				}
			}
			if (Object.keys(seoPayload).length) payload.seo = seoPayload;
			if (Object.keys(seoPass).length) passThrough.seo = seoPass;
			continue;
		}

		// 数值/布尔/null：原样复制
		if (value === null || value === undefined) {
			passThrough[key] = value;
			continue;
		}
		if (typeof value !== "string" && typeof value !== "object") {
			passThrough[key] = value;
			continue;
		}

		// 明确原样：数值/媒体类，或白名单中但值是媒体/数字
		if (PASS_THROUGH_FIELDS.has(key)) {
			passThrough[key] = value;
			continue;
		}

		if (isTranslatableValue(value)) {
			payload[key] = value;
		} else {
			passThrough[key] = value;
		}
	}

	return { payload, passThrough };
}

/** 组装发送给 DeepSeek 的翻译请求体 */
function buildPrompt(source: Record<string, unknown>): string {
	const json = JSON.stringify(source, null, 2);
	return [
		"You are a professional translator for a bathroom & sanitary hardware e-commerce site.",
		`Translate the following JSON from English (en) to Spanish (es).`,
		"Rules:",
		"- Translate only human-readable text values (product names, descriptions, feature lists, specification values, SEO title/description).",
		"- Do NOT translate brand names, model numbers, measurements, technical codes, URLs, slugs, or proper nouns.",
		"- Preserve any HTML tags inside string values exactly (e.g. <strong>, <br>, <p>).",
		"- Keep object keys unchanged. Only translate string VALUES.",
		"- Keep keys in specifications keys translated too (translate both key and value into Spanish).",
		"- Keep array order and structure identical.",
		"- Do not invent fields. Do not omit fields. Keep every key present in the source.",
		"- Output ONLY valid JSON. No markdown fences. No commentary.",
		"",
		"Source JSON:",
		"```json",
		json,
		"```",
	].join("\n");
}

interface DeepSeekResponse {
	choices?: Array<{ message?: { content?: string } }>;
}

/** 一次 DeepSeek 调用拿回全部翻译（减少往返与 token） */
async function translateWithDeepSeek(
	ctx: PluginContext,
	source: Record<string, unknown>,
): Promise<Record<string, unknown>> {
	const apiKey = await ctx.settings.get<string>("deepseekApiKey");
	if (!apiKey) throw new Error("Missing DeepSeek API key. Set it in the plugin settings.");

	const res = await ctx.http!.fetch("https://api.deepseek.com/chat/completions", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: "deepseek-chat",
			messages: [
				{
					role: "system",
					content:
						"You translate JSON content faithfully between English and Spanish for a bathroom hardware store. Return only valid JSON.",
				},
				{ role: "user", content: buildPrompt(source) },
			],
			temperature: 0.2,
			response_format: { type: "json_object" },
		}),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`DeepSeek error ${res.status}: ${text.slice(0, 500)}`);
	}

	const data = (await res.json()) as DeepSeekResponse;
	const content = data.choices?.[0]?.message?.content;
	if (!content) throw new Error("DeepSeek returned empty content");
	return JSON.parse(content) as Record<string, unknown>;
}

// 翻译路由 handler（被 editorAction 引用）；standard 插件使用两参形式 (routeCtx, pluginCtx)
async function handleTranslate(
	routeCtx: SandboxedRouteContext,
	ctx: PluginContext,
) {
	const input = (routeCtx.input ?? {}) as {
		collection?: string;
		id?: string;
		draft?: { fields?: Record<string, unknown>; entryId?: string };
	};
	const collection = input.collection ?? routeCtx.ui?.entry?.collection;
	const entryId = input.id ?? routeCtx.ui?.entry?.id ?? input.draft?.entryId;
	if (!collection || typeof collection !== "string" || !entryId) {
		return { toast: { message: "Missing collection or entry id", type: "error" } };
	}

	// 1. 读取当前英文数据：优先用后端已存 entry，保证字段完整、结构权威
	let sourceData: Record<string, unknown> = {};
	const item = ctx.content ? await ctx.content.get(collection, entryId) : null;
	if (!item) {
		// 条目可能未保存（全新草稿），退回前端 draft.fields
		sourceData = input.draft?.fields ?? {};
	} else {
		sourceData = item.data ?? input.draft?.fields ?? {};
	}

	// 2. 拆分为「待翻译」+「原样复制」
	const { payload, passThrough } = splitFields(sourceData);

	if (Object.keys(payload).length === 0) {
		return { toast: { message: "This entry has no translatable text fields.", type: "error" } };
	}

	// 3. DeepSeek 翻译
	let translated: Record<string, unknown>;
	try {
		translated = await translateWithDeepSeek(ctx, payload);
	} catch (e) {
		return {
			toast: {
				message: e instanceof Error ? e.message : "Translation failed",
				type: "error",
			},
		};
	}

	// 4. 合并：翻译字段 + 敏感字段原样
	const data = { ...translated, ...passThrough };

	// 5. 写入 es 草稿（关联英文行的 translationGroup）
	if (!ctx.content || !("create" in ctx.content) || !ctx.content.create) {
		return { toast: { message: "Plugin lacks content:write access", type: "error" } };
	}
	const created = await ctx.content.create(collection, data, {
		locale: TARGET_LOCALE,
		translationOf: entryId,
	});

	// 6. 在英文条目上写一个可见标记字段，便于后台识别翻译状态（不阻断草稿生成）
	try {
		const updateData =
			Object.keys(sourceData).length > 0
				? { ...sourceData, es_status: "draft" }
				: { es_status: "draft" };
		await ctx.content.update(collection, entryId, updateData);
	} catch (e) {
		ctx.log?.debug?.(`[translator] failed to mark es_status: ${String(e)}`);
	}
// 7. 成功提示；return refresh 让 admin 翻译面板刷新显示新草稿
	return {
		toast: {
			message: `Spanish draft created: ${created.id ?? ""}`,
			type: "success",
		},
		refresh: true,
	};
}

// 供总览页遍历的候选集合（与 editor actions 保持一致，运行时按实际存在过滤）
const OVERVIEW_COLLECTIONS = [
	"products",
	"posts",
	"pages",
	"categories",
	"wholesales",
	"landing",
	"landings",
	"wholesale_oem",
	"wholesale_landing",
	"landing_page",
	"topicseo",
	"topicss",
	"topics",
	"topic_seo",
	"topic",
];

interface OverviewRow {
	collection: string;
	id: string;
	title: string;
	status: string;
	statusStyle: string;
	updated: string;
}

/** 分页拉取某个 collection 指定 locale 的全部条目 */
async function listAllByLocale(
	ctx: PluginContext,
	collection: string,
	locale: string,
): Promise<Array<{ id: string; slug: string | null; translationGroup: string | null; status: string; updatedAt: string; data: Record<string, unknown> }>> {
	const out: Array<{ id: string; slug: string | null; translationGroup: string | null; status: string; updatedAt: string; data: Record<string, unknown> }> = [];
	if (!ctx.content || !("list" in ctx.content) || !ctx.content.list) return out;
	let cursor: string | undefined;
	for (;;) {
		const res = await ctx.content.list(collection, {
			limit: 200,
			cursor,
			where: { locale },
		});
		for (const item of res.items) {
			out.push({
				id: item.id,
				slug: item.slug,
				translationGroup: item.translationGroup ?? null,
				status: item.status,
				updatedAt: item.updatedAt,
				data: item.data ?? {},
			});
		}
		if (!res.cursor || !res.hasMore) break;
		cursor = res.cursor;
	}
	return out;
}

/** 从条目数据里提取可读的标题，退化到 slug/id */
function overviewTitle(
	data: Record<string, unknown>,
	slug: string | null,
	id: string,
): string {
	for (const k of ["title", "name", "headline", "label", "seo.title"]) {
		const v = k.includes(".")
			? (data.seo as Record<string, unknown> | undefined)?.[k.split(".")[1]]
			: data[k];
		if (typeof v === "string" && v.trim()) return v.slice(0, 80);
	}
	return slug ?? id;
}

/**
 * admin 总览页 handler：一次性列出各集合英文条目 + 对应西语翻译状态。
 * 返回 Block Kit 结构（HeaderBlock + TableBlock 等），供 admin 侧边栏页面渲染。
 */
async function handleAdminStatus(
	_routeCtx: SandboxedRouteContext,
	ctx: PluginContext,
) {
	const rows: OverviewRow[] = [];
	const collections = [...new Set([...OVERVIEW_COLLECTIONS])];

	for (const collection of collections) {
		let en: Awaited<ReturnType<typeof listAllByLocale>>;
		let es: Awaited<ReturnType<typeof listAllByLocale>>;
		try {
			en = await listAllByLocale(ctx, collection, "en");
			es = await listAllByLocale(ctx, collection, "es");
		} catch {
			continue; // 该集合不存在或不可读，跳过
		}

		// 用 translationGroup 关联：es 行 → 其状态
		const esByGroup = new Map<string, string>();
		for (const e of es) {
			if (e.translationGroup) esByGroup.set(e.translationGroup, e.status);
		}

		for (const item of en) {
			const esStatus = item.translationGroup ? esByGroup.get(item.translationGroup) : undefined;
			let status: string;
			let statusStyle: string;
			if (!esStatus) {
				status = "Not translated";
				statusStyle = "danger";
			} else if (esStatus === "published") {
				status = "Published";
				statusStyle = "primary";
			} else {
				status = "Draft";
				statusStyle = "secondary";
			}
			rows.push({
				collection,
				id: item.id,
				title: overviewTitle(item.data, item.slug, item.id),
				status,
				statusStyle,
				updated: item.updatedAt,
			});
		}
	}

	// 每种状态入口固定 action_id，便于侧边栏快速定位对应条目
	const STATUS_ACTIONS: Record<string, string> = {
		"Not translated": "translation-open-not-translated",
		"Draft": "translation-open-draft",
		"Published": "translation-open-published",
	};

	return {
		blocks: [
			{
				type: "header",
				text: "Translation Status",
				block_id: "translation-status-header",
			},
			{
				type: "section",
				text: `English entries vs. their Spanish (es) translations. ${rows.length} English entry(s). Click an entry to open its editor.`,
				block_id: "translation-status-summary",
			},
			{
				type: "divider",
				block_id: "translation-status-divider",
			},
			{
				type: "table",
				block_id: "translation-status-table",
				page_action_id: "translation-status",
				empty_text:
					"No entries yet. Generate Spanish drafts from the content editor toolbar.",
				columns: [
					{ key: "collection", label: "Collection", format: "badge", sortable: false },
					{
						key: "entry",
						label: "Entry",
						format: "element",
						sortable: true,
					},
					{
						key: "status",
						label: "Spanish",
						format: "element",
						sortable: true,
					},
					{ key: "updated", label: "Updated", format: "relative_time", sortable: false },
				],
				rows: rows.map((r) => ({
					collection: r.collection,
					// 可点击跳转英文条目编辑页（admin content 页）
					entry: {
						type: "link",
						label: r.title,
						target: {
							kind: "content",
							collection: r.collection,
							id: r.id,
							locale: "en",
						},
						appearance: "primary",
					},
					// 不同状态用不同颜色按钮表达（danger=红, primary=蓝, secondary=灰）
					status: {
						type: "button",
						action_id: STATUS_ACTIONS[r.status] ?? "translation-open-entry",
						label: r.status,
						style: r.statusStyle as "primary" | "secondary" | "danger",
						value: { collection: r.collection, id: r.id },
					},
					updated: r.updated,
				})),
			},
		],
	};
}

// standard 插件默认导出：routes（hooks 本插件不需要）
export default {
	routes: {
		translate: {
			public: false,
			handler: handleTranslate,
		},
		admin: {
			public: false,
			handler: handleAdminStatus,
		},
	},
} satisfies SandboxedPlugin;

// 编辑器 action 描述（由 descriptor 在 astro.config 中引用）
export const editorActions = {
	id: "generate-translation",
	label: "Generate Spanish draft",
	collections: [
		"products",
		"posts",
		"pages",
		"categories",
		// 落地页（wholesale-oem）：后端实际用 `wholesales`，其余为兼容变体
		"wholesales",
		"landing",
		"landings",
		"wholesale_oem",
		"wholesale_landing",
		"landing_page",
		// 主题落地页富门面集合
		"topicseo",
		"topicss",
		"topics",
		"topic_seo",
		"topic",
	],
	placement: "toolbar",
	confirm: {
		title: "Generate Spanish draft?",
		text: "Translates this entry into Spanish and saves it as a draft linked to the current English version. Text fields are translated via AI; prices/SKU/images are copied unchanged.",
		confirm: "Generate",
		deny: "Cancel",
	},
	route: "translate",
} as const;

// capabilities：content 读写 + 网络请求（DeepSeek）
export const capabilities = [
	"content:read",
	"content:write",
	"network:request",
] as const;

/** PLUGIN_CAPABILITIES 兼容的 canonical 能力名 */
const CANONICAL_CAPABILITIES = {
	contentRead: "content:read",
	contentWrite: "content:write",
	networkRequest: "network:request",
} as const;

// 插件 descriptor 工厂：注册到 astro.config 的 emdash({ plugins: [...] })
export interface TranslatorEditorAction {
	id: string;
	label: string;
	collections: readonly string[];
	placement: string;
	confirm: {
		title: string;
		text: string;
		confirm: string;
		deny: string;
	};
	route: string;
}

export interface TranslatorDescriptor {
	id: string;
	version: string;
	format: "standard";
	entrypoint: string;
	capabilities: readonly string[];
	allowedHosts: string[];
	editorActions: readonly TranslatorEditorAction[];
	adminPages: readonly {
		path: string;
		label: string;
		icon?: string;
		group?: string;
	}[];
	settingsSchema: Record<string, unknown>;
}

export function translatorDescriptor(): TranslatorDescriptor {
	return {
		id: "site-translator",
		version: "0.1.0",
		format: "standard",
		// 使用绝对路径，避免 Vite 在带 \0 前缀的虚拟模块里无法解析相对 import
		entrypoint: resolveEntrypoint(),
		capabilities: Object.values(CANONICAL_CAPABILITIES),
		// DeepSeek 出站请求白名单
		allowedHosts: ["api.deepseek.com"],
		editorActions: [editorActions],
		// 注册 admin 侧边栏总览页，路由必须为私有 POST JSON 路由
		adminPages: [
			{
				path: "/admin/translation-status",
				label: "Translation Status",
				icon: "translate",
			},
		],
		// 插件设置里暴露 DeepSeek API Key（secret 加密存储）
		settingsSchema: {
			deepseekApiKey: {
				label: "DeepSeek API Key",
				type: "secret",
				required: true,
			},
		},
	};
}

/** 解析本模块文件路径为 Vite 可 import 的绝对路径（以项目根为基准） */
function resolveEntrypoint(): string {
	// astro 命令运行目录 = 项目根
	const root = process.cwd();
	return `${root.replace(/\\/g, "/")}/translator/index.ts`;
}