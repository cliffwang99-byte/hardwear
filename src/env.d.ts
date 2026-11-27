/// <reference types="astro/client" />

// Vite ?raw 内联导入：构建时把 .md 全文作为字符串打包进产物
declare module "*.md?raw" {
	const content: string;
	export default content;
}

// 精简的 Cloudflare 运行时类型（与 @emdash-cms/cloudflare/src/cloudflare.d.ts 同风格）
// 在 Cloudflare Workers 运行时，绑定通过 `cloudflare:workers` 虚拟模块获取。
declare module "cloudflare:workers" {
	export const env: {
		MARKDOWN_CACHE?: KVNamespace;
		MARKDOWN_PURGE_TOKEN?: string;
	};
}

// KV 命名空间的最小可用类型（仅中间件所需的方法）
interface KVNamespace {
	get(key: string, type: "text"): Promise<string | null>;
	put(
		key: string,
		value: string,
		options?: { expirationTtl?: number }
	): Promise<void>;
	delete(key: string): Promise<void>;
	list(options?: {
		prefix?: string;
		cursor?: string;
		limit?: number;
	}): Promise<{
		keys: { name: string }[];
		list_complete: boolean;
		cursor: string;
	}>;
}

// waitUntil 的最小可用类型
interface ExecutionContext {
	waitUntil(promise: Promise<unknown>): void;
}

declare namespace App {
	interface Locals {
		/** Cloudflare 运行时上下文（由 @astrojs/cloudflare 注入 locals.cfContext） */
		cfContext?: ExecutionContext;
	}
}