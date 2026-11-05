const { DatabaseSync } = require("node:sqlite");
const path =
	".wrangler/state/v3/d1/miniflare-D1DatabaseObject/e7352547963de7050bd7d94658afc4fe78b61811b7815da12d90be8e863abf4d.sqlite";
const db = new DatabaseSync(path);

const colls = db.prepare("select id, slug from _emdash_collections").all();
console.log("COLLECTIONS:", colls.map((c) => `${c.id}:${c.slug}`).join(", "));

const prod = colls.find((c) => (c.slug || "").toLowerCase().includes("product"));
if (prod) {
	const fields = db
		.prepare(
			"select slug, label, type, column_type, required, validation, options from _emdash_fields where collection_id = ? order by sort_order",
		)
		.all(prod.id);
	console.log("\nPRODUCT FIELDS:");
	for (const f of fields) {
		console.log(
			`- ${f.slug} | label=${f.label} | type=${f.type} | col=${f.column_type} | required=${f.required} | validation=${f.validation} | options=${f.options}`,
		);
	}
} else {
	console.log("no products collection found");
}