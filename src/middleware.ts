import { defineMiddleware } from "astro:middleware";
import { parseHTML } from "linkedom";
import TurndownService from "turndown";
// @ts-ignore -- turndown-plugin-gfm 无类型声明
import { gfm } from "turndown-plugin-gfm";

// 全局初始化转换器，利用 Workers 实例复用降低单次请求开销
const turndown = new TurndownService({
	headingStyle: "atx",
	codeBlockStyle: "fenced",
	bulletListMarker: "-",
	emDelimiter: "*",
});
turndown.use(gfm);

// ===== 常量 =====
const CACHE_PREFIX = "md:v1:";
const KV_TTL_SECONDS = 86400; // KV TTL：24 小时
const MAX_HTML_BYTES = 6 * 1024 * 1024; // 对齐官方 6 MiB 转换上限

// Markdown for Agents 仅服务英语版本（en 无前缀）；es/ar 多语种网站页面不转换
const LOCALES = ["en"] as const;

// Astro v6 已移除 locals.runtime.*；通过 cloudflare:workers 虚拟模块懒加载 env
async function getMarkdownKv(): Promise<KVNamespace | undefined> {
	try {
		const { env } = await import("cloudflare:workers");
		return env.MARKDOWN_CACHE;
	} catch {
		return undefined;
	}
}

// 系统级排除路径（不做 Markdown 转换）
const EXCLUDED_PREFIXES = [
	"/_emdash",
	"/_astro",
	"/api",
	"/assets",
	"/favicon",
	"/robots.txt",
	"/sitemap",
	"/llms.txt",
];

// 无前缀单页白名单（对齐 src/pages 实际静态页；排除 cart/wishlist/search 等工具页）
const ROOT_PAGE_ALLOWLIST = new Set([
	"products",
	"blog",
	"about-us",
	"contact",
	"faq",
	"help",
	"privacy",
	"terms",
	"cookies",
	"support",
	"oem-odm",
	"markets-solutions",
	"shipping-info-combined",
	"how-to-order",
]);

// 详情/分类/系列/专题：/blog/[slug] /product/[id] /categories/[category]
//                    /topics/[topic] /series/[slug] /wholesale-oem/[slug]
const DETAIL_ROUTE_REGEX =
	/^\/(blog|product|categories|topics|series|wholesale-oem)\/[^/?#]+$/;

// ===== 工具函数 =====

// 剥离 i18n 语种前缀：en 无前缀；es/ar 以 /es /ar 开头
function stripLocale(pathname: string): { path: string; locale: string } {
	const m = pathname.match(/^\/(es|ar)(?:\/(.*))?$/);
	const clean = (p: string) => p.replace(/\/+$/, "") || "/";
	if (m) {
		return { path: clean(`/${m[2] ?? ""}`), locale: m[1] };
	}
	return { path: clean(pathname), locale: "en" };
}

function isSupportedMarkdownRoute(pathname: string): boolean {
	if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return false;
	// 带文件扩展名的静态资源（.png/.js/.css/.xml 等）
	if (/\.[a-zA-Z0-9]+$/.test(pathname)) return false;

	const { path, locale } = stripLocale(pathname);
	if (!(LOCALES as readonly string[]).includes(locale)) return false;

	if (path === "/") return false; // 根路径（首页）默认不转换，按需放开

	if (DETAIL_ROUTE_REGEX.test(path)) return true;

	// 白名单单页，如 /about-us /privacy /products /blog
	const single = path.match(/^\/([^/]+)$/);
	if (single && ROOT_PAGE_ALLOWLIST.has(single[1])) return true;

	return false;
}

// 统一构建 Markdown 响应头：保留 origin 安全头，替换 body 相关头（对齐官方行为）
function buildMarkdownHeaders(
	markdown: string,
	cacheStatus: "HIT" | "MISS" | "BYPASS",
	baseHeaders: Headers
): Headers {
	const headers = new Headers(baseHeaders);
	const originSignal = headers.get("content-signal");

	for (const name of [
		"etag",
		"last-modified",
		"content-encoding",
		"content-length",
		"content-range",
		"transfer-encoding",
		"content-type",
		"vary",
		"cache-control",
		"content-signal",
	]) {
		headers.delete(name);
	}

	headers.set("Content-Type", "text/markdown; charset=utf-8");
	headers.set("Vary", "Accept");
	headers.set("Cache-Control", "public, max-age=3600");
	// origin 已声明 Content-Signal 则保留（官方：origin 策略优先），否则用默认值
	headers.set(
		"Content-Signal",
		originSignal || "ai-train=yes, search=yes, ai-input=yes"
	);
	headers.set("x-markdown-cache", cacheStatus);
	headers.set("x-markdown-tokens", String(Math.floor(markdown.length / 4)));
	return headers;
}

// ===== 中间件 =====
export const onRequest = defineMiddleware(async (context, next) => {
	const method = context.request.method;
	const accept = context.request.headers.get("accept") ?? "";
	const pathname = context.url.pathname;

	// 仅处理 GET/HEAD 且明确请求 text/markdown 的支持路由
	if (
		(method !== "GET" && method !== "HEAD") ||
		!accept.includes("text/markdown") ||
		!isSupportedMarkdownRoute(pathname)
	) {
		return next();
	}

	// 缓存 Key 保留语种前缀，如 md:v1:/es/topics/best-sellers
	const cacheKey = `${CACHE_PREFIX}${pathname.replace(/\/+$/, "")}`;
	// Astro v6：locals.runtime 已废弃，改用 cloudflare:workers 的 env
	const kv = await getMarkdownKv();

	// 1) KV 缓存命中：直接返回，0ms CPU 转换开销
	if (kv) {
		try {
			const cached = await kv.get(cacheKey, "text");
			if (cached) {
				return new Response(cached, {
					status: 200,
					headers: buildMarkdownHeaders(cached, "HIT", new Headers()),
				});
			}
		} catch (err) {
			console.error("[markdown] KV read failed, fallback to live render:", err);
		}
	}

	// 2) 放行 Astro 渲染
	const response = await next();
	if (
		response.status !== 200 ||
		!(response.headers.get("content-type") ?? "").includes("text/html")
	) {
		return response;
	}

	// 注意：Response body 只能消费一次，提前取出供 try/catch 复用
	const html = await response.text();

	try {
		// 3) 超限保护：防止超大页面拖爆免费版 10ms CPU
		if (html.length > MAX_HTML_BYTES) {
			return new Response(html, { status: 200, headers: response.headers });
		}

		const { document } = parseHTML(html);

		// 4) 提取核心内容区域
		const targetNode =
			document.querySelector("[data-ai-content]") ||
			document.querySelector("article") ||
			document.querySelector("main") ||
			document.body;

		// 5) 保留 JSON-LD（官方规则：唯一保留的 script），追加到文末 json fenced 块
		const jsonLdBlocks: string[] = [];
		document
			.querySelectorAll('script[type="application/ld+json"]')
			.forEach((el) => {
				const text = el.textContent?.trim();
				if (text) jsonLdBlocks.push(text);
			});

		// 6) 移除脚本、样式及显式标记忽略的节点
		targetNode
			.querySelectorAll("script, style, noscript, iframe, [data-ai-ignore]")
			.forEach((el) => el.remove());

		// 7) Frontmatter：meta[name]→og→<title> 同级兜底，仅输出有值的字段
		const q = (sel: string) =>
			document
				.querySelector<HTMLMetaElement>(sel)
				?.getAttribute("content")
				?.trim() ?? "";
		const esc = (s: string) => s.replace(/"/g, '\\"');

		const pageTitle = q('meta[name="title"]') || q('meta[property="og:title"]');
		const metaDesc =
			q('meta[name="description"]') || q('meta[property="og:description"]');
		const ogImage = q('meta[property="og:image"]');
		const contentTypeTag = targetNode.getAttribute("data-ai-type") ?? "page";

		const fm: string[] = ["---"];
		if (pageTitle) fm.push(`title: "${esc(pageTitle)}"`);
		if (metaDesc) fm.push(`description: "${esc(metaDesc)}"`);
		if (ogImage) fm.push(`image: ${ogImage}`);
		fm.push(`type: ${contentTypeTag}`, `url: ${context.url.href}`, "---", "");

		// 8) 转换为 Markdown 并组装
		const bodyMarkdown = turndown.turndown(targetNode.innerHTML);
		const jsonLdBlock = jsonLdBlocks.length
			? ["", "```json", jsonLdBlocks.join("\n"), "```", ""].join("\n")
			: "";
		const fullMarkdown =
			`${fm.join("\n")}\n${bodyMarkdown}\n${jsonLdBlock}`.trim() + "\n";

		// 9) 异步写 KV（waitUntil 不阻塞响应返回）
		if (kv) {
			const write = kv.put(cacheKey, fullMarkdown, {
				expirationTtl: KV_TTL_SECONDS,
			});
			// Astro v6：ctx 从 locals.cfContext 获取
			const cfContext = context.locals.cfContext;
			if (cfContext?.waitUntil) cfContext.waitUntil(write);
			else await write;
		}

		return new Response(fullMarkdown, {
			status: 200,
			headers: buildMarkdownHeaders(
				fullMarkdown,
				kv ? "MISS" : "BYPASS",
				new Headers(response.headers)
			),
		});
	} catch (err) {
		// 兜底保护：解析/转换异常时降级返回原始 HTML（复用已读取的 html，不再二次消费 body）
		console.error("[markdown] conversion failed:", err);
		return new Response(html, {
			status: response.status,
			headers: response.headers,
		});
	}
});