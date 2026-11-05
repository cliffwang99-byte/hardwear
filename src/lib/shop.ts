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
	featured?: boolean;
	category?: string;
	topic?: string;
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
	{ id: "1", name: "Premium Portland Cement - 50kg Bag", price: 12.99, originalPrice: 15.99, image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&h=500&fit=crop", rating: 4.8, reviews: 234, badge: "Best Seller", inStock: true, featured: true },
	{ id: "2", name: "Steel Reinforcement Bars (Rebar) - Grade 60", price: 45.5, image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=500&h=500&fit=crop", rating: 4.9, reviews: 189, inStock: true, featured: true },
	{ id: "3", name: "Premium Pine Lumber 2x4x8", price: 8.99, originalPrice: 11.99, image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&h=500&fit=crop", rating: 4.7, reviews: 456, badge: "Sale", inStock: true, featured: true },
	{ id: "4", name: "Professional Power Drill Set", price: 129.99, originalPrice: 179.99, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&h=500&fit=crop", rating: 4.9, reviews: 678, badge: "Hot Deal", inStock: true, featured: true },
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

function referenceSlugs(value: unknown): string[] {
	if (value == null) return [];
	if (Array.isArray(value)) return value.flatMap((item) => referenceSlugs(item));
	if (typeof value === "string") {
		const slug = value.split("/").pop();
		return slug ? [slug] : [];
	}
	if (typeof value === "object") {
		const rec = value as Record<string, unknown>;
		if (typeof rec.slug === "string") {
			const slug = rec.slug.split("/").pop();
			return slug ? [slug] : [];
		}
		if (typeof rec.id === "string") {
			const slug = rec.id.split("/").pop();
			return slug ? [slug] : [];
		}
	}
	return [];
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
		featured:
			d.featured === true ||
			d.featured_products === true ||
			(typeof d.featured_products === "object" && d.featured_products !== null),
		category: referenceSlug((d.terms as Record<string, unknown> | undefined)?.collection),
		topic: referenceSlug((d.terms as Record<string, unknown> | undefined)?.topic),
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
	categorySlug: string;
	brand: string;
	topics: { slug: string; name: string }[];
	description: string;
	features: string[];
	descriptionRich?: unknown;
	featuresRich?: unknown;
	specifications: Record<string, string>;
	seoTitle: string;
	seoDescription: string;
	seoImage: string;
	seoCanonical: string;
	seoNoIndex: boolean;
	entryId: string;
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
	categorySlug: "cement-concrete",
	brand: "BuildPro",
	topics: [],
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
	seoTitle: "",
	seoDescription: "",
	seoImage: "",
	seoCanonical: "",
	seoNoIndex: false,
	entryId: "",
};

async function taxonomyLabelMap(taxonomy: string): Promise<Map<string, string>> {
	const terms = await getTaxonomyTerms(taxonomy, { includeCounts: false });
	const map = new Map<string, string>();
	const walk = (nodes: { slug: string; label?: string; children?: unknown[] }[]): void => {
		for (const node of nodes) {
			if (node.slug) map.set(node.slug, node.label ?? node.slug);
			if (Array.isArray(node.children)) {
				walk(node.children as { slug: string; label?: string; children?: unknown[] }[]);
			}
		}
	};
	walk(terms as { slug: string; label?: string; children?: unknown[] }[]);
	return map;
}

export async function getProductDetail(slug: string): Promise<ShopProductDetail> {
	const result = (await getEmDashEntry("products" as never, slug)) as {
		entry?: unknown;
		error?: unknown;
	};
	const entry = result.entry as Record<string, unknown> | undefined;
	if (!entry || result.error) return fallbackDetail;

	const d = (entry.data && typeof entry.data === "object" ? entry.data : {}) as Record<string, unknown>;
	const p = toProduct(entry);
	const seo = (d.seo && typeof d.seo === "object" ? d.seo : {}) as Record<string, unknown>;

	const resolveImages = (): string[] => {
		const imgs = d.images;
		if (Array.isArray(imgs)) {
			const mapped = imgs.map((x) => mediaUrl(x)).filter(Boolean);
			if (mapped.length) return mapped;
		}
		return p.image ? [p.image, ...fallbackDetail.images.slice(1)] : fallbackDetail.images;
	};

	const topicSlugs = referenceSlugs((d.terms as Record<string, unknown> | undefined)?.topic);
	let topics: { slug: string; name: string }[] = [];
	if (topicSlugs.length) {
		const labelBySlug = await taxonomyLabelMap("topic");
		topics = topicSlugs.map((slug) => ({ slug, name: labelBySlug.get(slug) ?? slug }));
	}

	const categorySlug = referenceSlug((d.terms as Record<string, unknown> | undefined)?.collection);
	let categoryName = categorySlug ?? fallbackDetail.category;
	if (categorySlug) {
		const labelBySlug = await taxonomyLabelMap("collection");
		categoryName = labelBySlug.get(categorySlug) ?? categorySlug;
	}

	return {
		...fallbackDetail,
		...p,
		images: resolveImages(),
		sku: typeof d.sku === "string" ? d.sku : fallbackDetail.sku,
		category: categoryName,
		categorySlug: categorySlug ?? fallbackDetail.category.toLowerCase(),
		brand: typeof d.brand === "string" ? d.brand : fallbackDetail.brand,
		topics,
		description: typeof d.description === "string" ? d.description : fallbackDetail.description,
		descriptionRich: Array.isArray(d.description) ? d.description : undefined,
		featuresRich: Array.isArray(d.features) ? d.features : undefined,
		features:
			Array.isArray(d.features) && d.features.every((f) => typeof f === "string")
				? (d.features as string[])
				: fallbackDetail.features,
		specifications:
			d.specifications && typeof d.specifications === "object" && !Array.isArray(d.specifications)
				? (d.specifications as Record<string, string>)
				: fallbackDetail.specifications,
		seoTitle: typeof seo.title === "string" ? seo.title : "",
		seoDescription: typeof seo.description === "string" ? seo.description : "",
		seoImage: mediaUrl(seo.image),
		seoCanonical: typeof seo.canonical === "string" ? seo.canonical : "",
		seoNoIndex: seo.noIndex === true,
		entryId: typeof entry.id === "string" ? entry.id : "",
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

// Product topics: taxonomy term `topic`, used to populate the sidebar Topics
// filter panel (same shape as categories for a uniform filter experience).
export async function getTopics(): Promise<ShopCategory[]> {
	const terms = await getTaxonomyTerms("topic", { includeCounts: true });
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

// Collect a taxonomy term slug together with every descendant term slug in its
// subtree. Used so a parent category page also surfaces products assigned to
// its child/grandchild terms.
function collectTermAndDescendants(term: { slug: string; children?: unknown[] }, out: string[] = []): string[] {
	out.push(term.slug);
	if (Array.isArray(term.children)) {
		for (const child of term.children) {
			collectTermAndDescendants(child as { slug: string; children?: unknown[] }, out);
		}
	}
	return out;
}

// Resolve the set of slugs in a taxonomy term subtree (self + descendants).
async function resolveTermSlugSet(taxonomy: string, slug: string): Promise<Set<string> | undefined> {
	const terms = await getTaxonomyTerms(taxonomy, { includeCounts: false });
	const stack: { slug: string; children?: unknown[] }[] = terms.map((term) => ({
		slug: term.slug,
		children: term.children,
	}));
	while (stack.length) {
		const node = stack.pop() as { slug: string; children?: unknown[] };
		if (node.slug === slug) return new Set(collectTermAndDescendants(node));
		if (Array.isArray(node.children)) {
			stack.push(...(node.children as { slug: string; children?: unknown[] }[]));
		}
	}
	return undefined;
}

export async function getProductsByCategory(slug: string): Promise<ShopProduct[]> {
	// Build the set of slugs that belong to this category subtree (self + all
	// descendants), so a level-1 page also returns products tagged with a
	// level-2 or level-3 term under it.
	const termSet = await resolveTermSlugSet("collection", slug);

	const result = (await getEmDashCollection("products" as never)) as {
		entries?: unknown[] | undefined;
		error?: unknown;
	};
	if (result.error || !Array.isArray(result.entries) || result.entries.length === 0) {
		return [];
	}
	const products = result.entries
		.map((entry) => toProduct(entry as Record<string, unknown>))
		.filter((p) => p.name !== "");

	// If the requested term was not found in the tree, fall back to an exact
	// slug match so the behaviour degrades gracefully.
	if (!termSet) return products.filter((p) => p.category === slug);
	return products.filter((p) => (p.category ? termSet.has(p.category) : false));
}

export async function getProductsByTopic(slug: string): Promise<ShopProduct[]> {
	const termSet = await resolveTermSlugSet("topic", slug);

	const result = (await getEmDashCollection("products" as never)) as {
		entries?: unknown[] | undefined;
		error?: unknown;
	};
	if (result.error || !Array.isArray(result.entries) || result.entries.length === 0) {
		return [];
	}
	const products = result.entries
		.map((entry) => toProduct(entry as Record<string, unknown>))
		.filter((p) => p.name !== "");

	if (!termSet) return products.filter((p) => p.topic === slug);
	return products.filter((p) => (p.topic ? termSet.has(p.topic) : false));
}

export interface CategoryMeta {
	name: string;
	banner: string;
	seoTitle: string;
	seoDescription: string;
	seoImage: string;
	seoCanonical: string;
	seoNoIndex: boolean;
	termDescription: string;
	longDescription: string;
	longDescriptionBlocks: unknown[];
	faqBlocks: unknown[];
	totalProducts: number;
	entryId: string;
	// Actual content-collection slug the entry was read from. Pages pass this to
	// `createPublicPageContext` so the SEO layer can resolve the entry — the slug
	// is typed at the CMS, so it is reported back instead of assumed.
	collection: string;
}

// Extract plain text from an EmDash portableText block array so categories can
// render their rich-text long description without additional dependencies.
// Each top-level block becomes one paragraph, joined by a blank line, so the
// consumer can split on /\n{2,}/ to recover the original paragraph structure.
function ptToText(node: unknown): string {
	const textOf = (value: unknown): string => {
		let out = "";
		const walk = (v: unknown): void => {
			if (Array.isArray(v)) {
				for (const item of v) walk(item);
			} else if (v && typeof v === "object") {
				const rec = v as Record<string, unknown>;
				if (typeof rec.text === "string") out += rec.text;
				if (rec.children) walk(rec.children);
			}
		};
		walk(value);
		return out.trim();
	};

	if (!Array.isArray(node)) return textOf(node);

	const paragraphs: string[] = [];
	for (const block of node) {
		const text = textOf(block);
		if (text) paragraphs.push(text);
	}
	return paragraphs.join("\n\n");
}

// Split a rich-text longDescription into an ordered list of mixed sections.
// The editor uses `h2`/`h3` headings as FAQ questions and the following
// block(s) as answers, but the same document may also contain ordinary rich
// text (paragraphs, lists, images…) that should render flat. To support both,
// we walk the blocks in order and emit either a `plain` run or an `faq` item.
// This lets category & topic pages keep their free-form rich text and still
// get an FAQ accordion for the heading-based sections.
export interface LongtextSection {
	type: "plain" | "faq";
	// `plain`: the raw blocks to render with PortableText.
	blocks?: unknown[];
	// `faq`: the heading text, plus the answer blocks rendered with PortableText.
	question?: string;
	answerBlocks?: unknown[];
}

export function splitLongtextSections(blocks: unknown[]): LongtextSection[] {
	if (!Array.isArray(blocks)) return [];

	const isHeading = (block: Record<string, unknown>): boolean => {
		const style = typeof block.style === "string" ? block.style : "";
		return style === "h2" || style === "h3" || style === "h4";
	};

	const sections: LongtextSection[] = [];
	const plainRun: unknown[] = [];
	let current: { question: string; answerBlocks: unknown[] } | null = null;

	const flushPlain = (): void => {
		if (plainRun.length > 0) {
			sections.push({ type: "plain", blocks: plainRun.splice(0) });
		}
	};
	const flushFaq = (): void => {
		if (current && current.answerBlocks.length > 0) {
			sections.push({
				type: "faq",
				question: current.question,
				answerBlocks: current.answerBlocks,
			});
		}
		current = null;
	};

	for (const raw of blocks) {
		if (!raw || typeof raw !== "object") continue;
		const block = raw as Record<string, unknown>;

		if (isHeading(block)) {
			const q = ptToText(block);
			// Close any pending run/item exactly where a new heading starts.
			flushFaq();
			flushPlain();
			if (q) current = { question: q, answerBlocks: [] };
			continue;
		}

		// Non-heading block: inside an active FAQ item it's its answer,
		// otherwise it belongs to the current plain run.
		if (current) {
			current.answerBlocks.push(raw);
		} else {
			plainRun.push(raw);
		}
	}
	flushFaq();
	flushPlain();

	return sections;
}

// Extract (question, answer) pairs from a rich-text longDescription. The
// editor keeps a Portable Text document where each question is an `h2`/`h3`
// heading and the following block(s) form the answer. This lets category &
// topic pages render their rich text as an FAQ accordion instead of flat text.
export interface FaqItem {
	question: string;
	answerBlocks: unknown[];
}

export function faqBlocksToItems(blocks: unknown[]): FaqItem[] {
	return splitLongtextSections(blocks)
		.filter((s) => s.type === "faq")
		.map((s) => ({ question: s.question ?? "", answerBlocks: s.answerBlocks ?? [] }));
}

// Try several candidate collection slugs in order and return the first entry
// that resolves. Collection slugs are typed at the CMS, not in this repo, so a
// hard-coded name breaks silently when the editor picks a different spelling.
async function getEntryFromCandidates(
	candidates: string[],
	slug: string,
): Promise<{ entry: Record<string, unknown> | undefined; collection: string }> {
	for (const candidate of candidates) {
		const result = (await getEmDashEntry(candidate as never, slug)) as {
			entry?: unknown;
			error?: unknown;
		};
		const entry = result?.entry as Record<string, unknown> | undefined;
		if (entry && entry.data && typeof entry.data === "object") {
			return { entry, collection: candidate };
		}
	}
	return { entry: undefined, collection: candidates[0] ?? "" };
}

// Merge the lightweight taxonomy term (name/count) with the rich content-type
// entry (banner image, long description, SEO) keyed by the same slug.
async function getTermPageData(
	taxonomy: string,
	collections: string[],
	imageField: string,
	slug: string,
): Promise<CategoryMeta | null> {
	const term = await getTerm(taxonomy, slug);
	const { entry, collection } = await getEntryFromCandidates(collections, slug);
	const d =
		entry && entry.data && typeof entry.data === "object"
			? (entry.data as Record<string, unknown>)
			: {};
	if (!term && !entry) return null;

	const seo = (d.seo && typeof d.seo === "object" ? d.seo : {}) as Record<string, unknown>;
	const longtext = Array.isArray(d.longtext) ? d.longtext : null;
	const faq = Array.isArray(d.faq) ? d.faq : null;

	return {
		name:
			typeof d.name === "string" && d.name.trim()
				? d.name.trim()
				: (term?.label ?? ""),
		banner: mediaUrl(d[imageField]),
		seoTitle: typeof seo.title === "string" ? seo.title : "",
		seoDescription: typeof seo.description === "string" ? seo.description : "",
		seoImage: mediaUrl(seo.image),
		seoCanonical: typeof seo.canonical === "string" ? seo.canonical : "",
		seoNoIndex: seo.noIndex === true,
		termDescription: term?.description ?? "",
		longDescription: longtext ? ptToText(longtext) : "",
		longDescriptionBlocks: longtext ?? [],
		faqBlocks: faq ?? [],
		totalProducts: term?.count ?? 0,
		entryId: typeof entry?.id === "string" ? entry.id : "",
		collection,
	};
}

// Product categories: taxonomy term `collection` + rich `categories` entry.
export async function getCategoryPageData(slug: string): Promise<CategoryMeta | null> {
	return getTermPageData("collection", ["categories"], "categoryimage", slug);
}

// Product topics: taxonomy term `topic` + a rich SEO entry collection. The
// editor may name the collection `topicseo`, `topicss`, etc., so probe the
// likely spellings instead of pinning one.
export async function getTopicPageData(slug: string): Promise<CategoryMeta | null> {
	return getTermPageData(
		"topic",
		["topicseo", "topicss", "topics", "topic_seo", "topic"],
		"topicimage",
		slug,
	);
}

export interface HomeCategory {
	slug: string;
	name: string;
	image: string;
	count: number;
}

// Homepage "Shop by Category": map real `collection` taxonomy terms to display
// cards. Only level-2 terms are shown — the direct children of every top-level
// term are flattened into one flat card list, and deeper levels are ignored.
// Card images come from the `categories` collection entry's `categoryimage`
// field, matched to the term by slug.
export async function getHomeCategories(): Promise<HomeCategory[]> {
	const [terms, result] = await Promise.all([
		getTaxonomyTerms("collection", { includeCounts: true }),
		getEmDashCollection("categories" as never) as Promise<{
			entries?: unknown[] | undefined;
			error?: unknown;
		}>,
	]);

	const entries =
		result && !result.error && Array.isArray(result.entries)
			? (result.entries as Record<string, unknown>[])
			: [];

	const imageBySlug = new Map<string, string>();
	for (const entry of entries) {
		const slug = typeof entry.slug === "string" ? entry.slug : "";
		const d =
			entry.data && typeof entry.data === "object"
				? (entry.data as Record<string, unknown>)
				: {};
		if (slug) imageBySlug.set(slug, mediaUrl(d.categoryimage));
	}

	const toCard = (term: { slug: string; label: string; count?: number }): HomeCategory => ({
		slug: term.slug,
		name: term.label,
		image: imageBySlug.get(term.slug) ?? "",
		count: term.count ?? 0,
	});

	const level2 = terms.flatMap((term) =>
		(Array.isArray(term.children) ? term.children : []).map(toCard),
	);

	// Fall back to the top-level terms when no level-2 terms exist yet, so the
	// section never renders empty on a freshly seeded site.
	return level2.length > 0 ? level2 : terms.map(toCard);
}