import type { APIRoute } from "astro";
import { ContentRepository, SchemaRegistry } from "emdash";
import { getDb } from "emdash/runtime";

interface QuoteItem {
  id?: unknown;
  name?: unknown;
  quantity?: unknown;
}

// Fields for the `inquiries` content collection, created lazily on first use.
// Field slugs are typed at the CMS and map to SQLite columns automatically.
const INQUIRY_FIELDS = [
  { slug: "customer_name", label: "Customer Name", type: "string" as const, required: true },
  { slug: "customer_email", label: "Customer Email", type: "string" as const, required: true },
  { slug: "phone", label: "Phone", type: "string" as const },
  { slug: "company_name", label: "Company", type: "string" as const },
  { slug: "message", label: "Message", type: "text" as const },
  { slug: "items", label: "Quote Items", type: "json" as const },
  {
    slug: "inquiry_status",
    label: "Status",
    type: "select" as const,
    options: { showPreview: false },
    validation: { options: ["pending", "replied", "closed"] },
    defaultValue: "pending",
  },
];

async function ensureInquiriesCollection(db: Awaited<ReturnType<typeof getDb>>): Promise<void> {
  const registry = new SchemaRegistry(db);
  const existing = await registry.getCollection("inquiries");
  if (existing) return;
  await registry.createSeedCollection(
    {
      slug: "inquiries",
      label: "Inquiries",
      labelSingular: "Inquiry",
      supports: ["drafts", "revisions"],
      group: "Commerce",
    },
    INQUIRY_FIELDS,
  );
}

const jsonHeaders = { "content-type": "application/json" };

function invalid(body: unknown, message: string): Response {
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
    return invalid(null, "Invalid JSON body");
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const rawItems = Array.isArray(body.items) ? (body.items as QuoteItem[]) : [];

  if (!name) return invalid(body, "Please provide your name");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return invalid(body, "Please provide a valid email address");
  }
  if (rawItems.length === 0) return invalid(body, "Your quote list is empty");

  const items = rawItems
    .map((item) => ({
      id: typeof item?.id === "string" ? item.id : "",
      name: typeof item?.name === "string" ? item.name : "",
      quantity: Number(item?.quantity) || 1,
    }))
    .filter((item) => item.id !== "" || item.name !== "");

  if (items.length === 0) return invalid(body, "Your quote list is empty");

  try {
    const db = await getDb();
    await ensureInquiriesCollection(db);

    const content = new ContentRepository(db);
    const slug = `inquiry-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const created = await content.create({
      type: "inquiries",
      slug,
      status: "draft",
      data: {
        customer_name: name,
        customer_email: email,
        phone,
        company_name: company,
        message,
        items,
        inquiry_status: "pending",
      },
    });

    return new Response(
      JSON.stringify({ ok: true, id: created.id, slug: created.slug }),
      { status: 200, headers: jsonHeaders },
    );
  } catch (error) {
    console.error("[inquiry] submit failed:", error);
    return new Response(
      JSON.stringify({ ok: false, message: "Could not submit your quote request. Please try again." }),
      { status: 500, headers: jsonHeaders },
    );
  }
};