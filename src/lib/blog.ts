import { getEmDashCollection, getEmDashEntry } from "emdash";

export interface BlogPost {
	id: string;
	entryId: string;
	title: string;
	excerpt: string;
	content: unknown;
	image: string;
	category?: string;
	date: string;
	seoTitle?: string;
	seoDescription?: string;
	seoImage?: string;
	seoCanonical?: string;
	seoNoIndex?: boolean;
}

function mediaUrl(value: unknown): string {
	if (typeof value === "string") return value;
	if (Array.isArray(value)) {
		if (value.length === 0) return "";
		return mediaUrl(value[0]);
	}
	if (value && typeof value === "object") {
		const rec = value as Record<string, unknown>;
		if (typeof rec.url === "string" && rec.url) return rec.url;
		if (typeof rec.src === "string" && rec.src) return rec.src;
		let mediaKey = typeof rec.storageKey === "string" ? rec.storageKey : "";
		if (rec.meta && typeof rec.meta === "object") {
			const meta = rec.meta as Record<string, unknown>;
			if (!mediaKey && typeof meta.storageKey === "string") mediaKey = meta.storageKey;
			if (!mediaKey && typeof meta.key === "string") mediaKey = meta.key;
		}
		if (mediaKey && !/^(https?:)?\/\//i.test(mediaKey)) mediaKey = "/_emdash/api/media/file/" + mediaKey;
		return mediaKey;
	}
	return "";
}

function referenceSlug(value: unknown): string | undefined {
	if (value == null) return undefined;
	if (Array.isArray(value)) {
		if (value.length === 0) return undefined;
		const first = value[0] as Record<string, unknown>;
		return typeof first?.slug === "string" ? first.slug : referenceSlug(first);
	}
	if (typeof value === "string") return value.split("/").pop() || undefined;
	if (value && typeof value === "object") {
		const rec = value as Record<string, unknown>;
		if (typeof rec.slug === "string") return rec.slug.split("/").pop() || undefined;
		if (typeof rec.id === "string") return rec.id.split("/").pop() || undefined;
	}
	return undefined;
}

export function toPost(entry: Record<string, unknown>): BlogPost {
	const d = (entry.data && typeof entry.data === "object" ? entry.data : {}) as Record<string, unknown>;
	const seo = d.seo && typeof d.seo === "object"
		? (d.seo as Record<string, unknown>)
		: {};
	const terms = d.terms as Record<string, unknown> | undefined;
	const catTerms = (terms?.category as Array<Record<string, unknown>> | undefined) ?? [];
	const dateRaw =
		(entry.publishedAt as Date | undefined) ??
		(typeof entry.published_at === "string" ? new Date(entry.published_at) : undefined);
	return {
		id: typeof entry.slug === "string" ? entry.slug : String(entry.id ?? ""),
		entryId: typeof entry.id === "string" ? entry.id : "",
		title: typeof d.title === "string" ? d.title : "",
		excerpt: typeof d.excerpt === "string" ? d.excerpt : "",
		content: d.content ?? null,
		image: mediaUrl(d.featured_image),
		category: typeof catTerms?.[0]?.label === "string"
			? catTerms[0].label
			: referenceSlug(catTerms) || undefined,
		date: dateRaw ? new Date(dateRaw).toLocaleDateString("en-US", {
				year: "numeric", month: "short", day: "numeric",
		  }) : "",
		seoTitle: typeof seo.title === "string" ? seo.title : undefined,
		seoDescription: typeof seo.description === "string" ? seo.description : undefined,
		seoImage: mediaUrl(seo.image) || undefined,
		seoCanonical: typeof seo.canonical === "string" ? seo.canonical : undefined,
		seoNoIndex: seo.noIndex === true,
	};
}

// 已发布文章，最新在前
export async function getPosts(): Promise<BlogPost[]> {
	let result: { entries?: unknown[] | undefined; error?: unknown };
	try {
		result = (await getEmDashCollection("posts" as never)) as {
			entries?: unknown[] | undefined; error?: unknown;
		};
	} catch { return []; }
	if (result.error || !Array.isArray(result.entries)) return [];
	return result.entries
		.map((entry) => toPost(entry as Record<string, unknown>))
		.filter((p) => p.title !== "")
		.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
}

// 单篇文章
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
	let result: { entry?: unknown; error?: unknown };
	try {
		result = (await getEmDashEntry("posts" as never, slug)) as {
			entry?: unknown; error?: unknown;
		};
	} catch { return null; }
	if (result.error || !result.entry) return null;
	return toPost(result.entry as Record<string, unknown>);
}