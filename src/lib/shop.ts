import { getEmDashCollection, getEmDashEntry, getTaxonomyTerms, getTerm } from "emdash";

export interface ProductTopic {
	slug: string;
	name: string;
}

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
	categories?: string[];
	topic?: string;
	// 列表/卡片场景下为 topic slug 数组；详情场景下为 {slug,name} 对象数组。
	topics?: string[] | ProductTopic[];
	series?: string;
	sku?: string;
	description?: string;
	// —— 浴室柜专属定制（列表/卡片场景，与详情页同一字段口径）——
	enableVanityCustomizer?: boolean;
	optCabinetMaterial?: string;
}

export interface ShopCategory {
	slug: string;
	name: string;
	icon: string;
	description: string;
	banner: string;
	totalProducts: number;
	children?: ShopCategory[];
}

// Portable Text 富文本递归提取为纯文本（含嵌套 children），供搜索/摘要等场景使用。
export function portableTextToText(value: unknown): string {
	if (typeof value === "string") return value.trim();
	if (!Array.isArray(value)) return "";
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
	walk(value);
	return parts.join(" ").replace(/\s+/g, " ").trim();
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
		categories: referenceSlugs((d.terms as Record<string, unknown> | undefined)?.collection),
		topic: referenceSlug((d.terms as Record<string, unknown> | undefined)?.topic),
		topics: referenceSlugs((d.terms as Record<string, unknown> | undefined)?.topic),
		series: referenceSlug((d.terms as Record<string, unknown> | undefined)?.series),
		sku: typeof d.sku === "string" ? d.sku : undefined,
		description: portableTextToText(d.description) || undefined,
		// 浴室柜专属定制开关（列表/卡片场景需要做按钮分流，与详情页同一字段口径）。
		enableVanityCustomizer:
			d.enable_vanity_customizer === true ||
			d.enable_vanity_customizer === 1 ||
			d.enable_vanity_customizer === "true",
		optCabinetMaterial: str(d.opt_cabinet_material),
	};
}

export async function getProducts(): Promise<ShopProduct[]> {
	let result: { entries?: unknown[] | undefined; error?: unknown };
	try {
		result = (await getEmDashCollection("products" as never)) as {
			entries?: unknown[] | undefined;
			error?: unknown;
		};
	} catch {
		return [];
	}
	if (result.error || !Array.isArray(result.entries) || result.entries.length === 0) {
		return [];
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
		return undefined;
	}
	return toProduct(result.entry as Record<string, unknown>);
}

export interface ProductVariant {
	// 变体维度一的值，如 "Matte Black" / "30""（单属性变体只填这一个）。
	attr1Value: string;
	// 变体维度二的值，如 "Matte White"。空 = 单属性变体，非空 = 双属性组合。
	attr2Value?: string;
	// 变体级 SKU，如 "BV-02-30-MW"。
	sku: string;
	// 前端渲染色块圆点用的颜色值，如 "#1A1A1A"（选填）。
	colorHex?: string;
	// 选中该变体时切换的主图（选填）。
	image: string;
}

export interface ProductAttribute {
	// 工程属性名，如 Material / Mounting / Certification。
	name: string;
	// 逗号拆分的属性值数组，如 ["1/2\" NPT", "G1/2\" BSP"]。
	values: string[];
	// 是否参与分类页筛选（True=展示+筛选；False=仅详情页规格表展示）。
	showInFilter: boolean;
}

export interface ShopProductDetail extends ShopProduct {
	images: string[];
	sku: string;
	category: string;
	categorySlug: string;
	brand: string;
	topics: ProductTopic[];
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
	// —— 变体（WooCommerce-like Variable Product）——
	variants: ProductVariant[];
	// 主变体维度名（Finish / Size / Thread…），None 或空 = 无变体。
	variantAttr1?: string;
	// 次变体维度名（可选），None 或空 = 仅单属性变体。
	variantAttr2?: string;
	// 非变体静态属性（展示 + 分类页筛选），无则空数组。
	attributes: ProductAttribute[];
	// —— 浴室柜专属定制开关（EmDash Products → Checkbox）——
	enableVanityCustomizer: boolean;
	// 定制控制台区域 H2 标题（扁平字段 config_section_title；不配时组件回退默认文案）。
	configSectionTitle?: string;
	// —— 浴室柜专属扁平定制字段（逗号分隔纯文本，非浴室柜留空）——
	optCabinetMaterial?: string;
	// 柜体二级色板（颜色/饰面）："[Oak] Tasmanian Oak | oak.webp, [Walnut] American Walnut" 格式。
	optCabinetFinish?: string;
	optCountertop?: string;
	optBasin?: string;
	optFaucetHole?: string;
	bundledHardwareSlugs?: string;
	// Drainage Type："Wall Drainage (P-Trap / Back Cutout), Floor Drainage (S-Trap / Bottom Cutout)" 逗号分隔，第1项默认选中。
	optDrainageType?: string;
	cadSpecPdfUrl?: string;
}

// 浴室柜专属模板的判定分类 slug 集合。产品满足三层条件才走 VanityDetailLayout：
//  1) categorySlug 命中集合（品类资格）；
//  2) enable_vanity_customizer 勾选（产品级定制授权，未勾选的浴室柜走标准模板）；
//  3) opt_cabinet_material 非空（至少有定制选项可渲染）。
export const VANITY_CATEGORY_SLUGS = new Set([
	"bathroom-vanities",
	"floating-bathroom-vanity",
	"freestanding-bathroom-vanity",
	"double-sink-vanity",
	"single-sink-vanity",
]);

export function isVanityProduct(product: ShopProductDetail): boolean {
	return Boolean(
		VANITY_CATEGORY_SLUGS.has(product.categorySlug) &&
			product.enableVanityCustomizer &&
			typeof product.optCabinetMaterial === "string" &&
			product.optCabinetMaterial.trim() !== "",
	);
}

// 列表/卡片场景的定制判定：与 isVanityProduct 同口径，兼容 ShopProduct 的 categories 数组。
export function isVanityListProduct(product: {
	categories?: string[];
	category?: string;
	enableVanityCustomizer?: boolean;
	optCabinetMaterial?: string;
}): boolean {
	const slugs = product.categories && product.categories.length ? product.categories : product.category ? [product.category] : [];
	return Boolean(
		slugs.some((s) => VANITY_CATEGORY_SLUGS.has(s)) &&
			product.enableVanityCustomizer &&
			typeof product.optCabinetMaterial === "string" &&
			product.optCabinetMaterial.trim() !== "",
	);
}

// 数据缺失/未找到时返回的空壳默认值：不包含任何预设演示内容，仅保证
// 详情页结构完整、可安全访问各字段。真实内容一律来自 products 集合。
const fallbackDetail: ShopProductDetail = {
	id: "",
	name: "",
	price: 0,
	image: "",
	rating: 0,
	reviews: 0,
	inStock: false,
	images: [],
	sku: "",
	category: "",
	categorySlug: "",
	brand: "",
	topics: [],
	description: "",
	features: [],
	specifications: {},
	seoTitle: "",
	seoDescription: "",
	seoImage: "",
	seoCanonical: "",
	seoNoIndex: false,
	entryId: "",
	variants: [],
	attributes: [],
	enableVanityCustomizer: false,
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

// 解析 products 集合的 `variants`（repeater）为类型化的变体数组。单属性变体
// 只填 attr_1_value，双属性组合再填 attr_2_value；没有 attr_1_value 的行忽略。
function toVariants(raw: unknown): ProductVariant[] {
	if (!Array.isArray(raw)) return [];
	const out: ProductVariant[] = [];
	for (const item of raw) {
		if (!item || typeof item !== "object") continue;
		const rec = item as Record<string, unknown>;
		const a1 = typeof rec.attr_1_value === "string" ? rec.attr_1_value.trim() : "";
		if (!a1) continue;
		const a2Raw = typeof rec.attr_2_value === "string" ? rec.attr_2_value.trim() : "";
		out.push({
			attr1Value: a1,
			attr2Value: a2Raw || undefined,
			sku: typeof rec.variant_sku === "string" ? rec.variant_sku.trim() : "",
			colorHex:
				typeof rec.color_hex === "string" && rec.color_hex.trim()
					? rec.color_hex.trim()
					: undefined,
			image: mediaUrl(rec.variant_image) || "",
		});
	}
	return out;
}

// 解析 products 集合的 `product_attributes`（repeater）为静态属性数组，用于
// 详情页规格表与分类页筛选。attr_value 用英文逗号拆成多个值。
function toAttributes(raw: unknown): ProductAttribute[] {
	if (!Array.isArray(raw)) return [];
	const out: ProductAttribute[] = [];
	for (const item of raw) {
		if (!item || typeof item !== "object") continue;
		const rec = item as Record<string, unknown>;
		const name = typeof rec.attr_name === "string" ? rec.attr_name.trim() : "";
		if (!name) continue;
		const value = typeof rec.attr_value === "string" ? rec.attr_value : "";
		out.push({
			name,
			values: value
				.split(",")
				.map((v) => v.trim())
				.filter(Boolean),
			showInFilter: rec.show_in_filter === true || rec.show_in_filter === 1 || rec.show_in_filter === "true",
		});
	}
	return out;
}

// 读取变体维度名，None/空 视为未启用对应维度。
function variantDim(value: unknown): string | undefined {
	const v = typeof value === "string" ? value.trim() : "";
	if (!v || v === "None") return undefined;
	return v;
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
		variants: toVariants(d.variants),
		variantAttr1: variantDim(d.variant_attr_1),
		variantAttr2: variantDim(d.variant_attr_2),
		attributes: toAttributes(d.product_attributes),
		// —— 浴室柜专属定制开关（Checkbox 布尔字段；兼容 true / 1 / "true" 三种存储形态）——
		enableVanityCustomizer:
			d.enable_vanity_customizer === true ||
			d.enable_vanity_customizer === 1 ||
			d.enable_vanity_customizer === "true",
		// 定制控制台区域 H2 标题（可配置化，缺失时组件内回退默认文案）。
		configSectionTitle: str(d.config_section_title),
		// —— 浴室柜专属扁平字段（逗号分隔纯文本，空串/undefined 一律归一为 undefined）——
		optCabinetMaterial: str(d.opt_cabinet_material),
		optCabinetFinish: str(d.opt_cabinet_finish),
		optCountertop: str(d.opt_countertop),
		optBasin: str(d.opt_basin),
		optFaucetHole: str(d.opt_faucet_hole),
		optDrainageType: str(d.opt_drainage_type),
		bundledHardwareSlugs: str(d.bundled_hardware_slugs),
		cadSpecPdfUrl: str(d.cad_spec_pdf_url),
	};
}

// 将未知值为逗号分隔的纯文本字段归一化为可选字符串：
// 非 string / 空串 / 全空白 → undefined；否则去首尾空白。
function str(v: unknown): string | undefined {
	return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
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
// Terms are hierarchical, so level-1 terms come back as section headings and
// their level-2 terms are the actual filter options.
function toTopicNode(term: {
	slug: string;
	label: string;
	description?: string;
	count?: number;
	children?: unknown[];
}): ShopCategory {
	return {
		slug: term.slug,
		name: term.label,
		icon: "",
		description: term.description ?? "",
		banner: "",
		totalProducts: term.count ?? 0,
		children: Array.isArray(term.children)
			? term.children.map((child) =>
					toTopicNode(
						child as {
							slug: string;
							label: string;
							description?: string;
							count?: number;
							children?: unknown[];
						},
					),
				)
			: [],
	};
}

export async function getTopics(): Promise<ShopCategory[]> {
	const terms = await getTaxonomyTerms("topic", { includeCounts: true });
	return terms.map(toTopicNode);
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

	// 一个产品可关联多个分类（多对多）。取产品全部 collection slug 后与目标
	// 子树求交集，保证产品在其所属的每个分类页面都能展示出来。
	const categorySlugs = (p: ShopProduct): string[] =>
		Array.isArray(p.categories) && p.categories.length > 0
			? p.categories
			: p.category
				? [p.category]
				: [];

	// If the requested term was not found in the tree, fall back to an exact
	// slug match so the behaviour degrades gracefully.
	if (!termSet) return products.filter((p) => categorySlugs(p).includes(slug));
	return products.filter((p) => categorySlugs(p).some((cat) => termSet.has(cat)));
}

// 分类页动态筛选器聚合。扫描分类下所有产品，合并两类筛选维度：
//  1) 静态属性（product_attributes）中 show_in_filter=true 者，以其 name 分组；
//  2) 变体维度（variant_attr_1/2 的各值）作为额外筛选组。
// 不同分类自然得到各自不同的筛选维度集合（龙头页筛材质/认证、水槽页筛厚度/尺寸）。
export interface CategoryFilterGroup {
	name: string;
	values: string[];
}

// 分类页动态筛选器聚合（含每产品取值）。扫描分类下所有产品，合并两类筛选维度：
//  1) 静态属性（product_attributes）中 show_in_filter=true 者，以其 name 分组；
//  2) 变体维度（variant_attr_1/2 的各值）作为额外筛选组。
// 返回用于渲染筛选栏的分组，以及每个产品的“分组名 -> 命中值”映射，供前端按属性过滤。
export async function getCategoryFilterData(slug: string): Promise<{
	groups: CategoryFilterGroup[];
	productValues: Record<string, Record<string, string[]>>;
}> {
	const termSet = await resolveTermSlugSet("collection", slug);

	const result = (await getEmDashCollection("products" as never)) as {
		entries?: unknown[] | undefined;
		error?: unknown;
	};
	if (result.error || !Array.isArray(result.entries)) {
		return { groups: [], productValues: {} };
	}

	const inCategory = (p: ShopProduct): boolean => {
		const slugs = Array.isArray(p.categories) && p.categories.length > 0
			? p.categories
			: p.category
				? [p.category]
				: [];
		return termSet ? slugs.some((cat) => termSet.has(cat)) : slugs.includes(slug);
	};

	// 属性为手动填写，值可能存在大小写差异（gold/GOLD/Gold、GREEM/green）。
	// 按小写去重避免统计被大小写分裂，同时保留首次出现的原始大小写用于展示。
	const groups = new Map<string, Map<string, string>>();
	const productValues: Record<string, Record<string, string[]>> = {};
	const upsert = (g: string, v: string): void => {
		if (!g || !v) return;
		v = v.trim();
		const key = v.toLowerCase();
		let byKey = groups.get(g);
		if (!byKey) {
			byKey = new Map();
			groups.set(g, byKey);
		}
		if (!byKey.has(key)) byKey.set(key, v);
	};
	const addToProduct = (map: Record<string, string[]>, g: string, v: string): void => {
		if (!g || !v) return;
		if (!map[g]) map[g] = [];
		if (!map[g].includes(v)) map[g].push(v);
	};

	for (const entry of result.entries) {
		const e = entry as Record<string, unknown>;
		const p = toProduct(e);
		if (p.name === "" || !inCategory(p)) continue;
		const d = (e.data && typeof e.data === "object" ? e.data : {}) as Record<string, unknown>;
		const pid = p.id;
		const map: Record<string, string[]> = {};
		if (!pid) continue;

		for (const attr of toAttributes(d.product_attributes)) {
			if (!attr.showInFilter) continue;
			for (const v of attr.values) {
				upsert(attr.name, v);
				addToProduct(map, attr.name, v);
			}
		}

		const dim1 = variantDim(d.variant_attr_1);
		if (dim1) {
			for (const variant of toVariants(d.variants)) {
				upsert(dim1, variant.attr1Value);
				addToProduct(map, dim1, variant.attr1Value);
			}
		}
		const dim2 = variantDim(d.variant_attr_2);
		if (dim2) {
			for (const variant of toVariants(d.variants)) {
				if (variant.attr2Value) {
					upsert(dim2, variant.attr2Value);
					addToProduct(map, dim2, variant.attr2Value);
				}
			}
		}

		if (Object.keys(map).length > 0) productValues[pid] = map;
	}

	const groupList: CategoryFilterGroup[] = [...groups.entries()]
		.map(([name, byKey]) => ({ name, values: [...byKey.values()] }))
		.filter((g) => g.values.length > 0);

	return { groups: groupList, productValues };
}

export async function getCategoryFilters(slug: string): Promise<CategoryFilterGroup[]> {
	return (await getCategoryFilterData(slug)).groups;
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

	// 一个产品可关联多个 topic（一对多），取全部 topic slug 后与目标子树求交集，
	// 保证产品在其所属的每个 topic 页面都能展示出来。
	const topicSlugs = (p: ShopProduct): string[] =>
		Array.isArray(p.topics) ? p.topics.map((t) => (typeof t === "string" ? t : t.slug)) : [];

	if (!termSet) return products.filter((p) => topicSlugs(p).includes(slug));
	return products.filter((p) => topicSlugs(p).some((t) => termSet.has(t)));
}

// Product series: taxonomy term `series`. A series is a design family that can
// span several product categories (faucets, showers, accessories…), so the
// category a series belongs to is derived from the products it holds rather
// than stored on the term itself.
export async function getProductsBySeries(slug: string): Promise<ShopProduct[]> {
	const termSet = await resolveTermSlugSet("series", slug);

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

	if (!termSet) return products.filter((p) => p.series === slug);
	return products.filter((p) => (p.series ? termSet.has(p.series) : false));
}

export async function getSeries(): Promise<ShopCategory[]> {
	const terms = await getTaxonomyTerms("series", { includeCounts: true });
	return terms.map((term) => ({
		slug: term.slug,
		name: term.label,
		icon: "",
		description: term.description ?? "",
		banner: "",
		totalProducts: term.count ?? 0,
	}));
}

// One category inside a series, e.g. "Faucets" for the Purist series.
export interface SeriesCategoryGroup {
	slug: string;
	name: string;
	products: ShopProduct[];
}

// A series with its products resolved and grouped by category. Category groups
// are derived from the products each series actually holds, so a series that
// spans faucets and showers shows both without storing that on the term.
export interface ShopSeriesDetail {
	slug: string;
	name: string;
	description: string;
	products: ShopProduct[];
	categoryGroups: SeriesCategoryGroup[];
	totalProducts: number;
}

function groupByCategory(
	products: ShopProduct[],
	categoryLabels: Map<string, string>,
): SeriesCategoryGroup[] {
	const groups = new Map<string, SeriesCategoryGroup>();
	for (const product of products) {
		const slug = product.category ?? "";
		if (!groups.has(slug)) {
			groups.set(slug, {
				slug,
				name: slug ? (categoryLabels.get(slug) ?? slug) : "Other",
				products: [],
			});
		}
		(groups.get(slug) as SeriesCategoryGroup).products.push(product);
	}
	return [...groups.values()];
}

export async function getSeriesWithProducts(): Promise<ShopSeriesDetail[]> {
	const [series, products, categoryLabels] = await Promise.all([
		getSeries(),
		getProducts(),
		taxonomyLabelMap("collection"),
	]);

	// Fallback: no series terms yet, so surface the catalog as one placeholder
	// series grouped by category instead of rendering an empty page.
	if (series.length === 0) {
		return [
			{
				slug: "all",
				name: "Featured Collections",
				description: "Browse our full range of bathroom hardware, grouped by category.",
				products,
				categoryGroups: groupByCategory(products, categoryLabels),
				totalProducts: products.length,
			},
		];
	}

	const resolved = series.map((term) => {
		const seriesProducts = products.filter((p) => p.series === term.slug);
		return {
			slug: term.slug,
			name: term.name,
			description: term.description,
			products: seriesProducts,
			categoryGroups: groupByCategory(seriesProducts, categoryLabels),
			totalProducts: seriesProducts.length,
		};
	});

	// Series exist but no product is assigned to any of them yet: show the
	// catalog fallback rather than an empty list of sections.
	if (resolved.every((detail) => detail.totalProducts === 0)) {
		return [
			{
				slug: "all",
				name: "Featured Collections",
				description: "Browse our full range of bathroom hardware, grouped by category.",
				products,
				categoryGroups: groupByCategory(products, categoryLabels),
				totalProducts: products.length,
			},
		];
	}

	return resolved;
}

export interface AboutEntity {
	name: string;
	sameAs?: string;
}

export interface CategoryMeta {
	name: string;
	// Optional custom H1 shown instead of the term name when provided.
	customizationH1: string;
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
	// Category references (slugs) attached to the content entry — used to filter
	// the featured products on wholesale landing pages. Empty when not provided.
	categories: string[];
	// Schema.org `about` entities configured in the CMS (`about_entities` repeater).
	// Each entry disambiguates the topic via `sameAs` (Wikidata/Wikipedia URLs).
	aboutEntities: AboutEntity[];
	// Related blog posts configured in the CMS via the `posts` reference field.
	relatedPosts: RelatedPost[];
}

export interface RelatedPost {
	id: string;
	title: string;
	excerpt: string;
	image: string;
	date: string;
	category: string;
}

function relatedPostsFrom(entries: unknown[] | undefined): RelatedPost[] {
	if (!Array.isArray(entries)) return [];
	const out: RelatedPost[] = [];
	for (const raw of entries) {
		if (!raw || typeof raw !== "object") continue;
		const entry = raw as Record<string, unknown>;
		const d =
			entry.data && typeof entry.data === "object"
				? (entry.data as Record<string, unknown>)
				: {};
		const title = typeof d.title === "string" ? d.title.trim() : "";
		if (!title) continue;
		const dateRaw = entry.publishedAt ?? d.published_at ?? entry.published_at;
		let date = "";
		if (dateRaw instanceof Date) date = dateRaw.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
		else if (typeof dateRaw === "string" && dateRaw) date = new Date(dateRaw).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
		const terms = d.terms as Record<string, unknown> | undefined;
		const catTerms = (terms?.category as Array<Record<string, unknown>> | undefined) ?? [];
		out.push({
			id: typeof entry.slug === "string" ? entry.slug : String(entry.id ?? ""),
			title,
			excerpt: typeof d.excerpt === "string" ? d.excerpt : "",
			image: mediaUrl(d.featured_image),
			date,
			category: typeof catTerms?.[0]?.label === "string" ? catTerms[0].label : "",
		});
	}
	return out;
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
		const result = (await getEmDashEntry(candidate as never, slug, {
			references: { posts: true },
		})) as {
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

// Normalise the `about_entities` repeater into a typed list. The CMS stores
// each row as `{ name, sameAs }`; rows without a name are dropped so the JSON-LD
// `about` array never contains an empty Thing. The `sameAs` sub-field may be
// stored under its snake_case slug, so both spellings are accepted.
function aboutEntities(value: unknown): AboutEntity[] {
	if (!Array.isArray(value)) return [];
	const out: AboutEntity[] = [];
	for (const row of value) {
		if (!row || typeof row !== "object") continue;
		const rec = row as Record<string, unknown>;
		const name = typeof rec.name === "string" ? rec.name.trim() : "";
		if (!name) continue;
		const rawSameAs = rec.sameAs ?? rec.same_as;
		const sameAs = typeof rawSameAs === "string" ? rawSameAs.trim() : "";
		out.push(sameAs ? { name, sameAs } : { name });
	}
	return out;
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
		customizationH1:
			typeof d.customization_h1 === "string" && d.customization_h1.trim()
				? d.customization_h1.trim()
				: typeof d.customizationH1 === "string" && d.customizationH1.trim()
					? d.customizationH1.trim()
					: "",
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
		categories: referenceSlugs((d.terms as Record<string, unknown> | undefined)?.collection),
		aboutEntities: aboutEntities(d.about_entities),
		relatedPosts: relatedPostsFrom((entry?.references as Record<string, { entries?: unknown[] }> | undefined)?.posts?.entries),
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

// Product series: taxonomy term `series` + a rich SEO entry collection, mirroring
// the category/topic pattern. Probe the likely collection spellings so the page
// keeps working regardless of the editor's exact naming.
export async function getSeriesPageData(slug: string): Promise<CategoryMeta | null> {
	return getTermPageData(
		"series",
		["seriesseo", "seriess", "series_seo", "series"],
		"seriesimage",
		slug,
	);
}

// Wholesale / OEM landing pages. Unlike categories & topics these have no
// taxonomy term — the page is backed entirely by a rich `landing` content
// collection entry keyed by slug. We probe the likely collection spellings so
// the page keeps working regardless of the editor's exact naming.
export async function getLandingPageData(slug: string): Promise<CategoryMeta | null> {
	const collections = ["wholesales", "landing", "landings", "wholesale_oem", "wholesale_landing", "landing_page"];
	const { entry, collection } = await getEntryFromCandidates(collections, slug);
	if (!entry || !entry.data || typeof entry.data !== "object") return null;

	const d = entry.data as Record<string, unknown>;
	const seo = (d.seo && typeof d.seo === "object" ? d.seo : {}) as Record<string, unknown>;
	const longtext = Array.isArray(d.longtext) ? d.longtext : null;
	const faq = Array.isArray(d.faq) ? d.faq : null;

	return {
		name: typeof d.name === "string" && d.name.trim() ? d.name.trim() : "",
		banner: mediaUrl(d.banner ?? d.image),
		customizationH1:
			typeof d.customization_h1 === "string" && d.customization_h1.trim()
				? d.customization_h1.trim()
				: typeof d.customizationH1 === "string" && d.customizationH1.trim()
					? d.customizationH1.trim()
					: "",
		seoTitle: typeof seo.title === "string" ? seo.title : "",
		seoDescription: typeof seo.description === "string" ? seo.description : "",
		seoImage: mediaUrl(seo.image),
		seoCanonical: typeof seo.canonical === "string" ? seo.canonical : "",
		seoNoIndex: seo.noIndex === true,
		termDescription: typeof d.description === "string" ? d.description : "",
		longDescription: longtext ? ptToText(longtext) : "",
		longDescriptionBlocks: longtext ?? [],
		faqBlocks: faq ?? [],
		totalProducts: 0,
		entryId: typeof entry.id === "string" ? entry.id : "",
		collection,
		categories: referenceSlugs(d.categories),
		aboutEntities: aboutEntities(d.about_entities),
		relatedPosts: relatedPostsFrom((entry?.references as Record<string, { entries?: unknown[] }> | undefined)?.posts?.entries),
	};
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

// 品类索引页：露出 level-1 以下**全部**分类层级（二级 + 三级，不限数量），
// 二级作大卡（subtree 聚合产品数），三级作小卡，保留便当式分层布局。
export interface CategoryIndexCard {
	slug: string;
	name: string;
	image: string;
	count: number;
}

export interface CategoryIndexGroup {
	slug: string;
	name: string;
	image: string;
	/** 二级分类的子树产品数（自身 count + 所有三级 count 之和），供卡片展示。 */
	count: number;
	/** 该二级分类下的三级分类卡片（可为空）。 */
	children: CategoryIndexCard[];
}

export interface CategoryIndexSection {
	/** 一级分类名称（仅作分组标题，不渲染成卡片）。 */
	name: string;
	groups: CategoryIndexGroup[];
}

export async function getCategoryIndex(): Promise<CategoryIndexSection[]> {
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

	const toCard = (term: { slug: string; label: string; count?: number }): CategoryIndexCard => ({
		slug: term.slug,
		name: term.label,
		image: imageBySlug.get(term.slug) ?? "",
		count: term.count ?? 0,
	});

	const sections: CategoryIndexSection[] = [];
	for (const top of terms) {
		const level2 = Array.isArray(top.children) ? top.children : [];
		if (level2.length === 0) continue;
		const groups = level2.map((l2) => {
			const children = (Array.isArray(l2.children) ? l2.children : []).map(toCard);
			return {
				...toCard(l2),
				count: (l2.count ?? 0) + children.reduce((sum, c) => sum + c.count, 0),
				children,
			};
		});
		sections.push({ name: top.label, groups });
	}

	// 尚无二级结构（只挂了顶层 term）时按顶层降级，保证索引页不渲染空。
	if (sections.length > 0) return sections;
	return [
		{
			name: "All Categories",
			groups: terms.map((term) => ({ ...toCard(term), count: term.count ?? 0, children: [] })),
		},
	];
}

export interface CatalogCategoryOption {
	slug: string;
	name: string;
}

// Catalog request dropdown options: expose the level-2 `collection` taxonomy
// terms (e.g. Faucets, Sinks, Vanities, Showers) so visitors can pick which
// product catalogs they need. Falls back to level-1 terms when no children exist.
export async function getCatalogCategoryOptions(): Promise<CatalogCategoryOption[]> {
	const terms = await getTaxonomyTerms("collection", { includeCounts: true });
	const toOption = (term: { slug: string; label: string }): CatalogCategoryOption => ({
		slug: term.slug,
		name: term.label,
	});
	const level2 = terms.flatMap((term) =>
		(Array.isArray(term.children) ? term.children : []).map(toOption),
	);
	return level2.length > 0 ? level2 : terms.map(toOption);
}