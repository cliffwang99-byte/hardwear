import type { APIRoute } from "astro";
import { parseSearchType, searchContent } from "../../lib/search";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  // 边缘缓存 60 秒，降低重复查询压力
  "cache-control": "public, max-age=60, s-maxage=60",
};

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get("q") || "";
  const locale = url.searchParams.get("locale") || "en";
  const type = parseSearchType(url.searchParams.get("type"));

  let payload: Awaited<ReturnType<typeof searchContent>>;
  try {
    payload = await searchContent(query, type, locale);
  } catch (error) {
    console.error("[search] query failed:", error);
    payload = { results: [], total: 0, query: query.trim(), type };
  }

  return new Response(JSON.stringify(payload), { headers: jsonHeaders });
};