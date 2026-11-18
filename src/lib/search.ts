import { getProducts } from "./shop";
import { getPosts } from "./blog";
import { localizePath } from "./i18n";

export interface SearchResultItem {
  id: string;
  type: "product" | "post";
  title: string;
  url: string;
  snippet: string;
  image?: string;
  meta?: string;
}

export type SearchType = "all" | "products" | "posts";

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  query: string;
  type: SearchType;
}

export function parseSearchType(value: string | null): SearchType {
  return value === "products" || value === "posts" ? value : "all";
}

// Portable Text 正文递归提取为纯文本（含嵌套 children），保证正文里的关键词也能被命中。
function extractPlainText(blocks: unknown): string {
  if (typeof blocks === "string") return blocks.trim();
  if (!Array.isArray(blocks)) return "";
  const parts: string[] = [];
  const walk = (node: unknown): void => {
    if (typeof node === "string") {
      parts.push(node);
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (node && typeof node === "object") {
      const rec = node as Record<string, unknown>;
      if (typeof rec.text === "string") parts.push(rec.text);
      if (Array.isArray(rec.children)) walk(rec.children);
    }
  };
  walk(blocks);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// 围绕关键词首次出现位置截取上下文：前 25 字符、后 65 字符。
function snippetAround(text: string, keywords: string[], fallback: string): string {
  if (fallback) return fallback;
  if (!text) return "";
  const lower = text.toLowerCase();
  const hit = keywords
    .map((kw) => lower.indexOf(kw))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0];
  if (hit === undefined) return text.slice(0, 90) + (text.length > 90 ? "…" : "");
  const start = Math.max(0, hit - 25);
  const end = Math.min(text.length, hit + 65);
  return (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
}

// 分字段权重：标题 10、型号 8、摘要 4、正文 1。
function scoreField(value: string, keywords: string[], weight: number): number {
  if (!value) return 0;
  const lower = value.toLowerCase();
  return keywords.some((kw) => lower.includes(kw)) ? weight : 0;
}

export async function searchContent(
  rawQuery: string,
  typeFilter: SearchType = "all",
  locale: string = "en",
): Promise<SearchResponse> {
  const query = rawQuery.trim();
  if (!query) return { results: [], total: 0, query: "", type: typeFilter };

  // 空格分词：多个关键词需同时命中
  const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (...fields: string[]): boolean => {
    const haystack = fields.join(" ").toLowerCase();
    return keywords.every((kw) => haystack.includes(kw));
  };

  const [products, posts] = await Promise.all([
    typeFilter === "posts" ? Promise.resolve([]) : getProducts(),
    typeFilter === "products" ? Promise.resolve([]) : getPosts(),
  ]);

  const scored: Array<{ item: SearchResultItem; score: number }> = [];

  if (typeFilter !== "posts") {
    for (const product of products) {
      const title = normalize(product.name);
      if (!title) continue;
      const sku = normalize(product.sku);
      const summary = normalize(product.description);
      if (!matches(title, sku, summary)) continue;

      scored.push({
        score:
          scoreField(title, keywords, 10) +
          scoreField(sku, keywords, 8) +
          scoreField(summary, keywords, 4),
        item: {
          id: product.id,
          type: "product",
          title,
          url: localizePath(`/product/${product.id}`, locale),
          snippet: snippetAround(summary, keywords, summary),
          image: product.image || undefined,
          meta: sku || undefined,
        },
      });
    }
  }

  if (typeFilter !== "products") {
    for (const post of posts) {
      const title = normalize(post.title);
      if (!title) continue;
      const excerpt = normalize(post.excerpt);
      const body = extractPlainText(post.content);
      if (!matches(title, excerpt, body)) continue;

      scored.push({
        score:
          scoreField(title, keywords, 10) +
          scoreField(excerpt, keywords, 4) +
          scoreField(body, keywords, 1),
        item: {
          id: post.id,
          type: "post",
          title,
          url: localizePath(`/blog/${post.id}`, locale),
          snippet: snippetAround(body, keywords, excerpt),
          image: post.image || undefined,
          meta: post.date || undefined,
        },
      });
    }
  }

  // 总分降序，标题命中的结果永远排在最前
  scored.sort((a, b) => b.score - a.score);
  const results = scored.map((entry) => entry.item);

  return { results, total: results.length, query, type: typeFilter };
}