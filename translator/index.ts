import type { PluginContext, SandboxedPlugin, SandboxedRouteContext } from "emdash/plugin";
// 构建时内联的翻译质量标准（Vite ?raw），修改 .md 即改质量规范，无需改代码
import translationStandards from "./translation-standards.md?raw";

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

export const SOURCE_LOCALE = "en";

/** 支持并存的目标语种：key=route 名，value=语种元信息 */
export const TRANSLATION_TARGETS = {
	translate: { locale: "es", language: "Spanish", htmlLang: "(es)", name: "Spanish" },
	translateArabic: { locale: "ar", language: "Arabic", htmlLang: "(ar)", name: "Arabic" },
} as const;

export type TranslationTargetKey = keyof typeof TRANSLATION_TARGETS;

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
		// 纯 key->value 字符串映射翻译
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
	/** portableText 字段的原始块数组，翻译后按 id 回填文本 */
	portableText: Record<string, unknown[]>;
}

/** portableText 数组：每一项都是带 `_type` 的对象块 */
function isPortableTextValue(v: unknown): v is unknown[] {
	if (!Array.isArray(v) || v.length === 0) return false;
	return v.every((block) => isPlainObject(block) && typeof block._type === "string");
}

/**
 * portableText 中允许翻译的文本键。
 * `_type` / `_key` / `marks` / `markDefs` / `href` / `style` / `code` 等结构键
 * 一律不采集，避免表格（table/tableRow/tableCell）与富文本结构被 LLM 改写。
 */
const PORTABLE_TEXT_TEXT_KEYS = new Set(["text", "alt", "caption", "title", "label"]);

/** 富文本文本片段在 payload 中的临时容器键（下划线前缀，避免与真实字段撞名） */
const PORTABLE_TEXT_PAYLOAD_KEY = "__portableText";

interface PortableTextSegment {
	id: string;
	text: string;
}

/**
 * 按固定顺序（数组索引 + 对象键顺序）抽取待翻译文本，编号 `字段名#pt0`、`字段名#pt1`…
 * 采集与回填使用同一遍历规则与同一前缀，保证 id 一一对应。
 */
function collectPortableTextSegments(
	value: unknown,
	fieldKey: string,
	segments: PortableTextSegment[],
): void {
	if (Array.isArray(value)) {
		for (const item of value) collectPortableTextSegments(item, fieldKey, segments);
		return;
	}
	if (!isPlainObject(value)) return;
	for (const [key, child] of Object.entries(value)) {
		if (PORTABLE_TEXT_TEXT_KEYS.has(key) && typeof child === "string") {
			if (child.trim()) segments.push({ id: `${fieldKey}#pt${segments.length}`, text: child });
			continue;
		}
		collectPortableTextSegments(child, fieldKey, segments);
	}
}

/** 把 LLM 回传的 `{ "字段名#pt0": "译文" }` 按 id 回填进原始块结构，缺失项保留原文 */
function applyPortableTextTranslations(
	value: unknown,
	fieldKey: string,
	translations: Map<string, string>,
	counter: { value: number },
): unknown {
	if (Array.isArray(value)) {
		return value.map((item) => applyPortableTextTranslations(item, fieldKey, translations, counter));
	}
	if (!isPlainObject(value)) return value;
	const out: Record<string, unknown> = {};
	for (const [key, child] of Object.entries(value)) {
		if (PORTABLE_TEXT_TEXT_KEYS.has(key) && typeof child === "string") {
			if (child.trim()) {
				const id = `${fieldKey}#pt${counter.value++}`;
				out[key] = translations.get(id) ?? child;
			} else {
				out[key] = child;
			}
			continue;
		}
		out[key] = applyPortableTextTranslations(child, fieldKey, translations, counter);
	}
	return out;
}

/** LLM 返回值转成 id → 译文映射；非对象或空值一律忽略，交给原文兜底 */
function toPortableTextTranslationMap(raw: unknown): Map<string, string> {
	const map = new Map<string, string>();
	if (!isPlainObject(raw)) return map;
	for (const [id, text] of Object.entries(raw)) {
		if (typeof text === "string" && text.trim()) map.set(id, text);
	}
	return map;
}

/**
 * 从 entry.data 拆出「待翻译」与「原样复制」两部分。
 * 敏感字段（数值/媒体/代码/slug/URL 等）不送 LLM，降低出错与 token 成本。
 */
function splitFields(data: Record<string, unknown>): GatherResult {
	const payload: Record<string, unknown> = {};
	const passThrough: Record<string, unknown> = {};
	const portableText: Record<string, unknown[]> = {};

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

		// portableText：只抽文本片段送翻译，块结构（_type/_key/marks/表格行列）原样保留
		if (isPortableTextValue(value)) {
			const segments: PortableTextSegment[] = [];
			collectPortableTextSegments(value, key, segments);
			if (segments.length > 0) portableText[key] = value;
			else passThrough[key] = value;
			continue;
		}

		if (isTranslatableValue(value)) {
			payload[key] = value;
		} else {
			passThrough[key] = value;
		}
	}

	return { payload, passThrough, portableText };
}

/** 组装发送给 DeepSeek 的翻译请求体 */
function buildPrompt(
	source: Record<string, unknown>,
	language: string,
	locale: string,
	hasPortableText: boolean,
): string {
	const json = JSON.stringify(source, null, 2);
	const lines = [
		`Translate the following JSON from English (${SOURCE_LOCALE}) to ${language} (${locale}).`,
		"Complete the three tasks in order:",
		"1. Apply the mandatory quality standards from the <standards> block in your system message — especially the glossary, keep-as-is list, HTML rules, specifications handling and SEO constraints.",
		"2. Translate the JSON below.",
		"3. Run the §10 self-check from the standards before outputting.",
		"",
		"Source JSON:",
		"```json",
		json,
		"```",
	];
	if (hasPortableText) {
		lines.push(
			"",
			"The `__portableText` object holds plain text fragments extracted from rich-text blocks. Rules for it:",
			"- Its keys (e.g. `specifications#pt3`) are internal IDs: NEVER translate, renumber, add or remove them.",
			"- Translate only the string VALUES.",
			"- Values are plain text only: no HTML, no markup, keep numbers/units/standard codes as-is.",
			"- Return exactly the same `__portableText` key set you received.",
		);
	}
	return lines.join("\n");
}

interface DeepSeekResponse {
	choices?: Array<{ message?: { content?: string } }>;
}

/** 一次 DeepSeek 调用拿回全部翻译（减少往返与 token） */
async function translateWithDeepSeek(
	ctx: PluginContext,
	source: Record<string, unknown>,
	language: string,
	locale: string,
	hasPortableText: boolean,
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
					content: [
						"You are a senior localization specialist for a bathroom & sanitary hardware B2B e-commerce site. Your translations are published on the live website.",
						`Current target: English → ${language} (${locale}).`,
						"The following is the OFFICIAL quality standard. It is MANDATORY and takes precedence over the user message. Follow it completely.",
						"",
						"<standards>",
						translationStandards,
						"</standards>",
						"",
						"Output ONLY valid JSON matching the source structure. No markdown fences, no commentary.",
					].join("\n"),
				},
				{ role: "user", content: buildPrompt(source, language, locale, hasPortableText) },
			],
			temperature: 0.1,
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

// 翻译路由 handler 工厂（被 editorAction 引用）；standard 插件使用两参形式 (routeCtx, pluginCtx)
function makeTranslateHandler(targetKey: TranslationTargetKey) {
	const target = TRANSLATION_TARGETS[targetKey];
	return async function handleTranslate(
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

	// 2. 拆分为「待翻译」+「原样复制」+「portableText 原块」
	const { payload, passThrough, portableText } = splitFields(sourceData);

	// 3. 富文本字段：把文本片段按 id 并入 payload，随同一次请求送翻译
	//    每个字段单独编号（从 pt0 起），与回填时每字段独立计数器保持一致
	const portableSegments: PortableTextSegment[] = [];
	for (const [key, blocks] of Object.entries(portableText)) {
		const fieldSegments: PortableTextSegment[] = [];
		collectPortableTextSegments(blocks, key, fieldSegments);
		portableSegments.push(...fieldSegments);
	}
	if (portableSegments.length > 0) {
		payload[PORTABLE_TEXT_PAYLOAD_KEY] = Object.fromEntries(
			portableSegments.map((s) => [s.id, s.text]),
		);
	}

	if (Object.keys(payload).length === 0) {
		return { toast: { message: "This entry has no translatable text fields.", type: "error" } };
	}

	// 4. DeepSeek 翻译
	let translated: Record<string, unknown>;
	try {
		translated = await translateWithDeepSeek(
			ctx,
			payload,
			target.language,
			target.locale,
			portableSegments.length > 0,
		);
	} catch (e) {
		return {
			toast: {
				message: e instanceof Error ? e.message : "Translation failed",
				type: "error",
			},
		};
	}

	// 5. 富文本回填：用译文替换原始块中的文本，结构键（_type/_key/marks/表格行列）不变
	const ptTranslations = toPortableTextTranslationMap(translated[PORTABLE_TEXT_PAYLOAD_KEY]);
	delete translated[PORTABLE_TEXT_PAYLOAD_KEY];
	const restoredPortableText: Record<string, unknown> = {};
	for (const [key, blocks] of Object.entries(portableText)) {
		restoredPortableText[key] = applyPortableTextTranslations(blocks, key, ptTranslations, {
			value: 0,
		});
	}

	// 6. 合并：翻译字段 + 敏感字段原样 + 回填后的富文本
	//    注意 seo 需按对象深合并——passThrough.seo 只含非 title/description 字段，
	//    若整体覆盖会顶掉已翻译的 title/description，导致 SEO 不翻译。
	const data: Record<string, unknown> = {
		...translated,
		...passThrough,
		...restoredPortableText,
	};
	if (
		isPlainObject(data.seo) &&
		isPlainObject(passThrough.seo) &&
		isPlainObject(translated.seo)
	) {
		data.seo = { ...(translated.seo as Record<string, unknown>), ...passThrough.seo };
	}

	// 7. 写入目标语种草稿（关联英文行的 translationGroup）
	if (!ctx.content || !("create" in ctx.content) || !ctx.content.create) {
		return { toast: { message: "Plugin lacks content:write access", type: "error" } };
	}
	const created = await ctx.content.create(collection, data, {
		locale: target.locale,
		translationOf: entryId,
	});

	// 8. 在英文条目上写一个可见标记字段，便于后台识别翻译状态（不阻断草稿生成）
	const statusKey = `${target.locale}_status`;
	try {
		const updateData =
			Object.keys(sourceData).length > 0
				? { ...sourceData, [statusKey]: "draft" }
				: { [statusKey]: "draft" };
		await ctx.content.update(collection, entryId, updateData);
	} catch (e) {
		ctx.log?.debug?.(`[translator] failed to mark ${statusKey}: ${String(e)}`);
	}
	// 9. 成功提示；return refresh 让 admin 翻译面板刷新显示新草稿
	return {
		toast: {
			message: `${target.name} draft created: ${created.id ?? ""}`,
			type: "success",
		},
		refresh: true,
	};
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
	es: string;
	esStyle: string;
	ar: string;
	arStyle: string;
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
 * admin 总览页 handler：按内容类型分组展示英文条目 + ES/AR 翻译状态。
 * 每个分组独立一张表格，每页 50 条；分组底部通过 actions 翻页按钮切换页码，
 * 不使用原生 next_cursor「Load more」。
 * 翻页按钮 value 携带 { pages, group, page }：pages 为各分组当前页码快照，
 * 点击后 handler 据此更新目标分组页码并重绘整页，其余分组页码保持不变。
 */
const PAGE_SIZE = 50;

/** 内容类型分组：每组渲染一张独立的翻译状态表格 */
const OVERVIEW_GROUPS = [
	{ key: "products", label: "Products", collections: ["products"] },
	{ key: "posts", label: "Articles / Posts", collections: ["posts"] },
	{ key: "pages", label: "Pages", collections: ["pages"] },
	{ key: "categories", label: "Categories", collections: ["categories"] },
	{
		key: "landing",
		label: "Landing & Wholesale",
		collections: [
			"wholesales",
			"landing",
			"landings",
			"wholesale_oem",
			"wholesale_landing",
			"landing_page",
		],
	},
	{
		key: "topics",
		label: "Topics / SEO",
		collections: ["topicseo", "topicss", "topics", "topic_seo", "topic"],
	},
] as const;

async function handleAdminStatus(
	routeCtx: SandboxedRouteContext,
	ctx: PluginContext,
) {
	// EmDash admin 面板请求体是完整 interaction 对象：
	// { type: "page_load", page } 或 { type: "block_action", action_id, block_id, value, page }。
	// 按钮携带的翻页数据在 interaction.value 中，而非顶层。
	const interaction = (routeCtx.input ?? {}) as {
		type?: string;
		value?: {
			pages?: Record<string, number>;
			group?: string;
			page?: number;
		};
	};
	const input = (interaction.value ?? {}) as {
		pages?: Record<string, number>;
		group?: string;
		page?: number;
	};

	// 各分组当前页码：默认第 0 页；翻页按钮 value 携带全组页码快照避免其余组页码丢失
	const pages: Record<string, number> = {};
	for (const g of OVERVIEW_GROUPS) {
		const raw = input.pages?.[g.key];
		pages[g.key] =
			typeof raw === "number" && Number.isFinite(raw) && raw >= 0
				? Math.floor(raw)
				: 0;
	}
	if (
		input.group &&
		input.group in pages &&
		typeof input.page === "number" &&
		Number.isFinite(input.page) &&
		input.page >= 0
	) {
		pages[input.group] = Math.floor(input.page);
	}

	// 按内容类型分组收集各集合三种语种条目
	const grouped: Record<string, OverviewRow[]> = {};
	for (const g of OVERVIEW_GROUPS) grouped[g.key] = [];

	for (const collection of [...new Set(OVERVIEW_COLLECTIONS)]) {
		const slot = OVERVIEW_GROUPS.find((g) =>
			(g.collections as readonly string[]).includes(collection),
		);
		if (!slot) continue;
		let en: Awaited<ReturnType<typeof listAllByLocale>>;
		let es: Awaited<ReturnType<typeof listAllByLocale>>;
		let ar: Awaited<ReturnType<typeof listAllByLocale>>;
		try {
			en = await listAllByLocale(ctx, collection, "en");
			es = await listAllByLocale(ctx, collection, "es");
			ar = await listAllByLocale(ctx, collection, "ar");
		} catch {
			continue; // 该集合不存在或不可读，跳过
		}

		// 用 translationGroup 关联：目标语种行 → 其发布状态
		const byGroup = (list: typeof es) => {
			const m = new Map<string, string>();
			for (const e of list) if (e.translationGroup) m.set(e.translationGroup, e.status);
			return m;
		};
		const esByGroup = byGroup(es);
		const arByGroup = byGroup(ar);

		const badge = (status?: string): [string, string] => {
			if (!status) return ["Not translated", "danger"];
			if (status === "published") return ["Published", "primary"];
			return ["Draft", "secondary"];
		};

		for (const item of en) {
			const [esStatus, esStyle] = badge(
				item.translationGroup ? esByGroup.get(item.translationGroup) : undefined,
			);
			const [arStatus, arStyle] = badge(
				item.translationGroup ? arByGroup.get(item.translationGroup) : undefined,
			);
			grouped[slot.key].push({
				collection,
				id: item.id,
				title: overviewTitle(item.data, item.slug, item.id),
				es: esStatus,
				esStyle,
				ar: arStatus,
				arStyle,
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

	const columns = [
		{ key: "collection", label: "Collection", format: "badge", sortable: false },
		{ key: "entry", label: "Entry", format: "element", sortable: false },
		{ key: "es", label: "Spanish", format: "element", sortable: false },
		{ key: "ar", label: "Arabic", format: "element", sortable: false },
		{ key: "updated", label: "Updated", format: "relative_time", sortable: false },
	];

	const blocks: Array<Record<string, unknown>> = [];

	for (const g of OVERVIEW_GROUPS) {
		const rows = grouped[g.key];
		const total = rows.length;
		const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
		const page = Math.min(Math.max(0, pages[g.key]), totalPages - 1);
		const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

		blocks.push({
			type: "header",
			text: `${g.label} (${total} entries)`,
			block_id: `translation-status-header-${g.key}`,
		});

		blocks.push({
			type: "table",
			block_id: `translation-status-table-${g.key}`,
			page_action_id: "translation-status",
			// 不设置 next_cursor：避免渲染「Load more」，翻页由组底的 actions 按钮控制
			empty_text:
				"No entries yet. Generate Spanish or Arabic drafts from the content editor toolbar.",
			columns,
			rows: pageRows.map((r) => ({
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
				es: {
					type: "button",
					action_id: STATUS_ACTIONS[r.es] ?? "translation-open-entry",
					label: r.es,
					style: r.esStyle as "primary" | "secondary" | "danger",
					value: { collection: r.collection, id: r.id, locale: "es" },
				},
				ar: {
					type: "button",
					action_id: STATUS_ACTIONS[r.ar] ?? "translation-open-entry",
					label: r.ar,
					style: r.arStyle as "primary" | "secondary" | "danger",
					value: { collection: r.collection, id: r.id, locale: "ar" },
				},
				updated: r.updated,
			})),
		});

		// 翻页控件：仅当总页数 > 1 时渲染，按钮 value 携带页码快照
		if (totalPages > 1) {
			blocks.push({
				type: "section",
				text: `Page ${page + 1} of ${totalPages} · ${total} entries`,
				block_id: `translation-status-pager-info-${g.key}`,
			});
			const pagerValue = (target: number) => ({
				pages,
				group: g.key,
				page: target,
			});
			const elements: Array<Record<string, unknown>> = [];
			if (page > 0) {
				elements.push({
					type: "button",
					action_id: "translation-status",
					label: "‹ Prev",
					style: "secondary",
					value: pagerValue(page - 1),
				});
			}
			if (page < totalPages - 1) {
				elements.push({
					type: "button",
					action_id: "translation-status",
					label: "Next ›",
					style: "primary",
					value: pagerValue(page + 1),
				});
			}
			blocks.push({
				type: "actions",
				block_id: `translation-status-pager-${g.key}`,
				elements,
			});
		}
	}

	return { blocks };
}

// standard 插件默认导出：routes（hooks 本插件不需要）
export default {
	routes: {
		translate: {
			public: false,
			handler: makeTranslateHandler("translate"),
		},
		translateArabic: {
			public: false,
			handler: makeTranslateHandler("translateArabic"),
		},
		admin: {
			public: false,
			handler: handleAdminStatus,
		},
	},
} satisfies SandboxedPlugin;

// 编辑器 action 描述（由 descriptor 在 astro.config 中引用）
/** 编辑器 action 覆盖的集合（与总览页保持一致） */
export const ACTION_COLLECTIONS = [
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
] as const;

// 编辑器 action 描述（由 descriptor 在 astro.config 中引用）：西语 + 阿拉伯语并存
export const editorActions = [
	{
		id: "generate-spanish-draft",
		label: "Generate Spanish draft",
		collections: ACTION_COLLECTIONS,
		placement: "toolbar",
		confirm: {
			title: "Generate Spanish draft?",
			text: "Translates this entry into Spanish and saves it as a draft linked to the current English version. Text fields are translated via AI; prices/SKU/images are copied unchanged.",
			confirm: "Generate",
			deny: "Cancel",
		},
		route: "translate",
	},
	{
		id: "generate-arabic-draft",
		label: "Generate Arabic draft",
		collections: ACTION_COLLECTIONS,
		placement: "toolbar",
		confirm: {
			title: "Generate Arabic draft?",
			text: "Translates this entry into Arabic (RTL) and saves it as a draft linked to the current English version. Text fields are translated via AI; prices/SKU/images are copied unchanged.",
			confirm: "Generate",
			deny: "Cancel",
		},
		route: "translateArabic",
	},
] as const;

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
		editorActions: editorActions,
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