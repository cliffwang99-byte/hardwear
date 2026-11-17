import type { APIRoute } from "astro";
import { SchemaRegistry } from "emdash";
import { getDb } from "emdash/runtime";
import type { CreateFieldInput } from "emdash/schema/types";

// 一次性迁移：为 `products` 集合补齐产品变体 + 静态属性所需的字段。
// 通过 SchemaRegistry.createField() 落地，幂等（已存在的字段自动跳过）。
// 必须设置 SCHEMA_APPLY_TOKEN 环境变量作为访问钥匙，防止公开可写结构。
const FIELD_DEFS: CreateFieldInput[] = [
  // 变体维度一（单属性变体必用；None 表示未启用）
  {
    slug: "variant_attr_1",
    label: "Variant Dimension 1",
    type: "select",
    validation: { options: ["None", "Finish", "Size", "Thread", "Thickness"] },
    defaultValue: "None",
  },
  // 变体维度二（双属性组合变体时启用；None 表示单属性）
  {
    slug: "variant_attr_2",
    label: "Variant Dimension 2",
    type: "select",
    validation: { options: ["None", "Finish", "Size", "Thread", "Thickness"] },
    defaultValue: "None",
  },
  // 变体列表（repeater）：单属性只填 attr_1_value，双属性组合再填 attr_2_value
  {
    slug: "variants",
    label: "Variants",
    type: "repeater",
    validation: {
      subFields: [
        { slug: "attr_1_value", label: "Attribute 1 Value", type: "string" },
        { slug: "attr_2_value", label: "Attribute 2 Value", type: "string" },
        { slug: "variant_sku", label: "SKU", type: "string" },
        { slug: "color_hex", label: "Color Hex", type: "string" },
        { slug: "variant_image", label: "Variant Image", type: "image" },
      ],
    },
  },
  // 静态属性（repeater）：用于详情页规格表 + 分类页筛选
  {
    slug: "product_attributes",
    label: "Attributes (Specs & Filter)",
    type: "repeater",
    validation: {
      subFields: [
        { slug: "attr_name", label: "Attribute Name", type: "string" },
        {
          slug: "attr_value",
          label: "Values (comma-separated)",
          type: "text",
        },
        {
          slug: "show_in_filter",
          label: "Show in Category Filter",
          type: "boolean",
        },
      ],
    },
  },
];

export const POST: APIRoute = async ({ request }) => {
  const jsonHeaders = { "content-type": "application/json" };

  const expected = import.meta.env.SCHEMA_APPLY_TOKEN as string | undefined;
  if (!expected) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "SCHEMA_APPLY_TOKEN env is not set; refusing to run.",
      }),
      { status: 500, headers: jsonHeaders },
    );
  }
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (bearer !== expected) {
    return new Response(
      JSON.stringify({ ok: false, message: "Unauthorized." }),
      { status: 401, headers: jsonHeaders },
    );
  }

  try {
    const db = await getDb();
    const registry = new SchemaRegistry(db);
    const collection = await registry.getCollection("products");
    if (!collection) {
      throw new Error('Collection "products" not found.');
    }

    const report: { slug: string; status: "created" | "exists" }[] = [];
    for (const def of FIELD_DEFS) {
      const existing = await registry.getField("products", def.slug);
      if (existing) {
        report.push({ slug: def.slug, status: "exists" });
        continue;
      }
      await registry.createField("products", def);
      report.push({ slug: def.slug, status: "created" });
    }

    return new Response(
      JSON.stringify({ ok: true, fields: report }),
      { status: 200, headers: jsonHeaders },
    );
  } catch (error) {
    console.error("[schema] apply-variant-fields failed:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: jsonHeaders },
    );
  }
};