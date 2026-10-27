import { getEmDashCollection, getEmDashEntry, getTaxonomyTerms, getTerm } from "emdash";

export interface ShopProduct {
	id: string;
	name: string;
	price: number;
	originalPrice?: number;
	image: string;
	rating: number;
	reviews: number;
	badge?: string;
	inStock: boolean;
	category?: string;
}

export interface ShopCategory {
	slug: string;
	name: string;
	icon: string;
	description: string;
	banner: string;
	totalProducts: number;
}

const fallbackProducts: ShopProduct[] = [
	{ id: "1", name: "Premium Portland Cement - 50kg Bag", price: 12.99, originalPrice: 15.99, image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&h=500&fit=crop", rating: 4.8, reviews: 234, badge: "Best Seller", inStock: true },
	{ id: "2", name: "Steel Reinforcement Bars (Rebar) - Grade 60", price: 45.5, image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=500&h=500&fit=crop", rating: 4.9, reviews: 189, inStock: true },
	{ id: "3", name: "Premium Pine Lumber 2x4x8", price: 8.99, originalPrice: 11.99, image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&h=500&fit=crop", rating: 4.7, reviews: 456, badge: "Sale", inStock: true },
	{ id: "4", name: "Professional Power Drill Set", price: 129.99, originalPrice: 179.99, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop", rating: 4.9, reviews: 678, badge: "Hot Deal", inStock: true },
	{ id: "5", name: "Copper Electrical Wire - 100ft Roll", price: 89.99, image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500&h=500&fit=crop", rating: 4.6, reviews: 123, inStock: true },
	{ id: "6", name: "PVC Plumbing Pipe Kit", price: 34.99, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop", rating: 4.5, reviews: 234, inStock: false },
	{ id: "7", name: "Exterior Paint - Premium Weather Shield", price: 54.99, originalPrice: 69.99, image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&h=500&fit=crop", rating: 4.8, reviews: 345, inStock: true },
	{ id: "8", name: "Asphalt Roofing Shingles - Bundle", price: 39.99, image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=500&h=500&fit=crop", rating: 4.7, reviews: 167, inStock: true },
];

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
	if (typeof value === "object") {
		const rec = value as Record<string, unknown>;
		if (typeof rec.slug === "string") return rec.slug.split("/").pop() || undefined;
		if (typeof rec.id === "string") return rec.id.split("/").pop() || undefined;
	}
	return undefined;
}

function toProduct(entry: Record<string, unknown>): ShopProduct {
	const d = (entry.data && typeof entry.data === "object" ? entry.data : {}) as Record<string, unknown>;
	return {
		id: (entry.slug as string) ?? (entry.id as string) ?? "",
		name: typeof d.name === "string" ? d.name : "",
		price: Number(d.price) || 0,
		originalPrice: d.originalPrice != null ? Number(d.originalPrice) || undefined : undefined,
		image: mediaUrl(d.image),
		rating: Number(d.rating) || 5,
		reviews: Number(d.reviews) || 0,
		badge: typeof d.badge === "string" ? d.badge : undefined,
		inStock: d.inStock !== false,
		category: referenceSlug((d.terms as Record<string, unknown> | undefined)?.collection),
	};
}

export async function getProducts(): Promise<ShopProduct[]> {
	const result = (await getEmDashCollection("products" as never)) as {
		entries?: unknown[] | undefined;
		error?: unknown;
	};
	if (result.error || !Array.isArray(result.entries) || result.entries.length === 0) {
		return fallbackProducts;
	}
	return result.entries
		.map((entry) => toProduct(entry as Record<string, unknown>))
		.filter((p) => p.name !== "");
}

export async function getProductBySlug(slug: string): Promise<ShopProduct | undefined> {
	const result = (await getEmDashEntry("products" as never, slug)) as {
		entry?: unknown;
		error?: unknown;
	};
	if (result.error || !result.entry) {
		return fallbackProducts.find((p) => p.id === slug);
	}
	return toProduct(result.entry as Record<string, unknown>);
}

export interface ShopProductDetail extends ShopProduct {
	images: string[];
	sku: string;
	category: string;
	brand: string;
	description: string;
	features: string[];
	specifications: Record<string, string>;
}

const fallbackDetail: ShopProductDetail = {
	id: "1",
	name: "Premium Portland Cement - 50kg Bag",
	price: 12.99,
	originalPrice: 15.99,
	image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop",
	rating: 4.8,
	reviews: 234,
	inStock: true,
	images: [
		"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=800&fit=crop",
		"https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&h=800&fit=crop",
		"https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=800&fit=crop",
	],
	sku: "CEM-PORT-50",
	category: "Cement & Concrete",
	brand: "BuildPro",
	description:
		"High-quality Portland cement perfect for all construction projects. Provides excellent strength and durability for foundations, walls, and structural applications.",
	features: [
		"Premium grade Portland cement",
		"High compressive strength",
		"Consistent quality and performance",
		"Suitable for all weather conditions",
		"Meets ASTM C150 standards",
		"Fast setting time",
	],
	specifications: {
		Weight: "50 kg (110 lbs)",
		Type: "Portland Cement Type I",
		"Compressive Strength": "4000+ PSI",
		"Setting Time": "45-60 minutes",
		Color: "Gray",
		Storage: "Keep dry and covered",
	},
};

export async function getProductDetail(slug: string): Promise<ShopProductDetail> {
	const result = (await getEmDashEntry("products" as never, slug)) as {
		entry?: unknown;
		error?: unknown;
	};
	const entry = result.entry as Record<string, unknown> | undefined;
	if (!entry || result.error) return fallbackDetail;

	const d = (entry.data && typeof entry.data === "object" ? entry.data : {}) as Record<string, unknown>;
	const p = toProduct(entry);

	const resolveImages = (): string[] => {
		const imgs = d.images;
		if (Array.isArray(imgs)) {
			const mapped = imgs.map((x) => mediaUrl(x)).filter(Boolean);
			if (mapped.length) return mapped;
		}
		return p.image ? [p.image, ...fallbackDetail.images.slice(1)] : fallbackDetail.images;
	};

	return {
		...fallbackDetail,
		...p,
		images: resolveImages(),
		sku: typeof d.sku === "string" ? d.sku : fallbackDetail.sku,
		category: referenceSlug((d.terms as Record<string, unknown> | undefined)?.collection) ?? fallbackDetail.category,
		brand: typeof d.brand === "string" ? d.brand : fallbackDetail.brand,
		description: typeof d.description === "string" ? d.description : fallbackDetail.description,
		features:
			Array.isArray(d.features) && d.features.every((f) => typeof f === "string")
				? (d.features as string[])
				: fallbackDetail.features,
		specifications:
			d.specifications && typeof d.specifications === "object" && !Array.isArray(d.specifications)
				? (d.specifications as Record<string, string>)
				: fallbackDetail.specifications,
	};
}

export async function getCategories(): Promise<ShopCategory[]> {
	const terms = await getTaxonomyTerms("collection", { includeCounts: true });
	return terms.map((term) => ({
		slug: term.slug,
		name: term.label,
		icon: "",
		description: term.description ?? "",
		banner: "",
		totalProducts: term.count ?? 0,
	}));
}

export async function getCategoryBySlug(slug: string): Promise<ShopCategory | null> {
	const term = await getTerm("collection", slug);
	if (!term) return null;
	return {
		slug: term.slug,
		name: term.label,
		icon: "",
		description: term.description ?? "",
		banner: "",
		totalProducts: term.count ?? 0,
	};
}

export async function getProductsByCategory(slug: string): Promise<ShopProduct[]> {
	const result = (await getEmDashCollection("products", {
		where: { collection: slug },
	})) as {
		entries?: unknown[] | undefined;
		error?: unknown;
	};
	if (result.error || !Array.isArray(result.entries) || result.entries.length === 0) {
		return [];
	}
	return result.entries
		.map((entry) => toProduct(entry as Record<string, unknown>))
		.filter((p) => p.name !== "");
}

export interface CategoryMeta {
	name: string;
	banner: string;
	seoTitle: string;
	seoDescription: string;
	longDescription: string;
	totalProducts: number;
}

// Extract plain text from an EmDash portableText block array so categories can
// render their rich-text long description without additional dependencies.
function ptToText(node: unknown): string {
	let out = "";
	const walk = (value: unknown): void => {
		if (Array.isArray(value)) {
			for (const item of value) walk(item);
		} else if (value && typeof value === "object") {
			const rec = value as Record<string, unknown>;
			if (typeof rec.text === "string") out += rec.text;
			if (rec.children) walk(rec.children);
		}
	};
	walk(node);
	return out;
}

// Merge the lightweight taxonomy term (name/count) with the rich `categories`
// content-type entry (banner image, long description, SEO) keyed by slug.
export async function getCategoryPageData(slug: string): Promise<CategoryMeta | null> {
	const term = await getTerm("collection", slug);
	const catResult = (await getEmDashEntry("categories" as never, slug)) as {
		entry?: unknown;
		error?: unknown;
	};
	const entry = catResult?.entry as Record<string, unknown> | undefined;
	const d =
		entry && entry.data && typeof entry.data === "object"
			? (entry.data as Record<string, unknown>)
			: {};
	if (!term && !entry) return null;

	const seo = (d.seo && typeof d.seo === "object" ? d.seo : {}) as Record<string, unknown>;
	const longtext = Array.isArray(d.longtext) ? d.longtext : null;

	return {
		name:
			typeof d.name === "string" && d.name.trim()
				? d.name.trim()
				: (term?.label ?? ""),
		banner: mediaUrl(d.categoryimage),
		seoTitle: typeof seo.seoTitle === "string" ? seo.seoTitle : "",
		seoDescription: typeof seo.seoDescription === "string" ? seo.seoDescription : "",
		longDescription: longtext ? ptToText(longtext) : "",
		totalProducts: term?.count ?? 0,
	};
}