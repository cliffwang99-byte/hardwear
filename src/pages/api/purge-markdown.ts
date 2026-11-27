import type { APIRoute } from "astro";

const CACHE_PREFIX = "md:v1:";

// Astro v6：locals.runtime 已废弃，通过 cloudflare:workers 虚拟模块懒加载 env
async function getMarkdownEnv(): Promise<{ MARKDOWN_CACHE?: KVNamespace; MARKDOWN_PURGE_TOKEN?: string }> {
	try {
		const { env } = await import("cloudflare:workers");
		return env as { MARKDOWN_CACHE?: KVNamespace; MARKDOWN_PURGE_TOKEN?: string };
	} catch {
		return {};
	}
}

export const GET: APIRoute = async ({ url }) => {
	const env = await getMarkdownEnv();
	const kv = env.MARKDOWN_CACHE;
	const token = url.searchParams.get("token");

	if (!kv) return new Response("MARKDOWN_CACHE not bound", { status: 500 });
	if (!env.MARKDOWN_PURGE_TOKEN || token !== env.MARKDOWN_PURGE_TOKEN) {
		return new Response("Forbidden", { status: 403 });
	}

	// 单个存量失效：?path=/product/123（或含语种前缀 /es/product/123）
	const path = (url.searchParams.get("path") ?? "").replace(/\/+$/, "");
	if (path) {
		const key = `${CACHE_PREFIX}${path}`;
		await kv.delete(key);
		return new Response(`purged ${key}`, { status: 200 });
	}

	// 全站失效：遍历删除
	let count = 0;
	let cursor: string | undefined;
	do {
		const page = await kv.list({
			prefix: CACHE_PREFIX,
			cursor: cursor as unknown as string,
			limit: 1000,
		});
		await Promise.all(page.keys.map((k) => kv.delete(k.name)));
		count += page.keys.length;
		cursor = page.list_complete ? undefined : page.cursor;
	} while (cursor);

	return new Response(`purged ${count} keys`, { status: 200 });
};