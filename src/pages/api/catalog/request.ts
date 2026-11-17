import type { APIRoute } from "astro";
import { ContentRepository, SchemaRegistry } from "emdash";
import { getDb } from "emdash/runtime";

// Fields for the `catalog_requests` content collection, created lazily on first use.
// Field slugs are typed at the CMS and map to SQLite columns automatically.
const CATALOG_REQUEST_FIELDS = [
  { slug: "work_email", label: "Work Email", type: "string" as const, required: true },
  { slug: "geo_value", label: "ZIP Code / Port", type: "string" as const, required: true },
  { slug: "geo_kind", label: "GEO Field Type", type: "string" as const },
  { slug: "scope_type", label: "Scope Type", type: "string" as const },
  { slug: "scope_name", label: "Scope Name", type: "string" as const },
  { slug: "scope_label", label: "Scope Label", type: "string" as const },
  { slug: "request_locale", label: "Locale", type: "string" as const },
  { slug: "cr_number", label: "CR Number", type: "string" as const },
  { slug: "company_name", label: "Company", type: "string" as const },
  { slug: "bom_note", label: "BOM / Model List", type: "text" as const },
  { slug: "catalog_categories", label: "Requested Catalogs", type: "json" as const },
  { slug: "submitter_ip", label: "Submitter IP", type: "string" as const },
  { slug: "submitter_country", label: "Country", type: "string" as const },
  {
    slug: "request_status",
    label: "Status",
    type: "select" as const,
    options: { showPreview: false },
    validation: { options: ["new", "sent", "closed"] },
    defaultValue: "new",
  },
];

async function ensureCatalogRequestsCollection(db: Awaited<ReturnType<typeof getDb>>): Promise<void> {
  const registry = new SchemaRegistry(db);
  const existing = await registry.getCollection("catalog_requests");
  if (existing) return;
  await registry.createSeedCollection(
    {
      slug: "catalog_requests",
      label: "Catalog Requests",
      labelSingular: "Catalog Request",
      supports: ["drafts", "revisions"],
      group: "Commerce",
    },
    CATALOG_REQUEST_FIELDS,
  );
}

const jsonHeaders = { "content-type": "application/json" };

function invalid(message: string): Response {
  return new Response(JSON.stringify({ ok: false, message }), {
    status: 400,
    headers: jsonHeaders,
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return invalid("Invalid JSON body");
  }

  const email = typeof body.work_email === "string" ? body.work_email.trim() : "";
  const geoValue = typeof body.geo_value === "string" ? body.geo_value.trim() : "";
  const geoKind = typeof body.geo_kind === "string" ? body.geo_kind.trim() : "";
  const scopeType = typeof body.scope_type === "string" ? body.scope_type.trim() : "";
  const scopeName = typeof body.scope_name === "string" ? body.scope_name.trim() : "";
  const scopeLabel = typeof body.scope_label === "string" ? body.scope_label.trim() : "";
  const requestLocale = typeof body.request_locale === "string" ? body.request_locale.trim() : "";
  const crNumber = typeof body.cr_number === "string" ? body.cr_number.trim() : "";
  const company = typeof body.company_name === "string" ? body.company_name.trim() : "";
  const bomNote = typeof body.bom_note === "string" ? body.bom_note.trim() : "No BOM attached";
  // `catalog_categories` may arrive as a JSON array of slugs, or a comma-separated string.
  let catalogCategories: string[] = [];
  if (Array.isArray(body.catalog_categories)) {
    catalogCategories = (body.catalog_categories as unknown[])
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
  } else if (typeof body.catalog_categories === "string" && body.catalog_categories.trim()) {
    catalogCategories = body.catalog_categories
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  // --- Anti-abuse: honeypot (only gate kept; timing check removed) ---
  const honeypot = typeof body.honeypot_website === "string" ? body.honeypot_website.trim() : "";
  if (honeypot) return invalid("Suspicious submission rejected");

  // --- Geo / IP enrichment from Cloudflare edge headers ---
  const submitterIp = request.headers.get("CF-Connecting-IP") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const submitterCountry = (request.headers.get("CF-IPCountry") ?? "").toUpperCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return invalid("Please provide a valid work email");
  }
  if (!geoValue) return invalid("Please fill in the required fields");

  try {
    const db = await getDb();
    await ensureCatalogRequestsCollection(db);

    const content = new ContentRepository(db);
    const slug = `catalog-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const created = await content.create({
      type: "catalog_requests",
      slug,
      status: "draft",
      data: {
        work_email: email,
        geo_value: geoValue,
        geo_kind: geoKind,
        scope_type: scopeType,
        scope_name: scopeName,
        scope_label: scopeLabel,
        request_locale: requestLocale,
        cr_number: crNumber,
        company_name: company,
        bom_note: bomNote,
        catalog_categories: catalogCategories,
        submitter_ip: submitterIp,
        submitter_country: submitterCountry,
        request_status: "new",
      },
    });

    return new Response(
      JSON.stringify({ ok: true, id: created.id, slug: created.slug }),
      { status: 200, headers: jsonHeaders },
    );
  } catch (error) {
    console.error("[catalog] request failed:", error);
    return new Response(
      JSON.stringify({ ok: false, message: "Could not submit your catalog request. Please try again." }),
      { status: 500, headers: jsonHeaders },
    );
  }
};