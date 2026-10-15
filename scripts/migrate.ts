import { readFile, readdir } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { database, closeDatabase, transaction } from "../src/server/database";
import { PRODUCTS } from "../src/lib/products";
import type { RowDataPacket } from "mysql2/promise";

async function migrate() {
  const db = database();
  await db.execute(`CREATE TABLE IF NOT EXISTS schema_migrations (
    migration_name VARCHAR(191) PRIMARY KEY,
    checksum CHAR(64) NOT NULL,
    applied_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
  )`);
  const directory = fileURLToPath(new URL("../migrations/", import.meta.url));
  for (const name of (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort()) {
    const sql = await readFile(`${directory}/${name}`, "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const [existing] = await db.execute<RowDataPacket[]>(
      "SELECT checksum FROM schema_migrations WHERE migration_name = ?",
      [name],
    );
    if (existing.length) {
      if (existing[0].checksum !== checksum)
        throw new Error(
          `Applied migration ${name} has changed; create a new additive migration instead.`,
        );
      console.log(`Already applied: ${name}`);
      continue;
    }
    for (const statement of sql
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean))
      await db.query(statement);
    await db.execute("INSERT INTO schema_migrations (migration_name, checksum) VALUES (?, ?)", [
      name,
      checksum,
    ]);
    console.log(`Applied: ${name}`);
  }
  await transaction(async (connection) => {
    const [seed] = await connection.execute<RowDataPacket[]>(
      "SELECT migration_name FROM schema_migrations WHERE migration_name = ?",
      ["seed_catalogue_813833f"],
    );
    if (seed.length) return;
    const unique = new Set(PRODUCTS.map((product) => product.sku));
    if (unique.size !== PRODUCTS.length) throw new Error("Source catalogue has duplicate SKUs.");
    for (const product of PRODUCTS) {
      await connection.execute(
        "INSERT IGNORE INTO products (sku, name, category, price_cents, stock) VALUES (?, ?, ?, ?, ?)",
        [
          product.sku,
          product.name,
          product.category,
          Math.round(product.price * 100),
          product.stock,
        ],
      );
    }
    for (const gateway of ["payfast", "yoco", "paypal"]) {
      await connection.execute("INSERT IGNORE INTO gateway_settings (gateway) VALUES (?)", [
        gateway,
      ]);
    }
    const defaults = {
      shipping: { pudo_locker: 6000, pudo_door: 15000, pickup: 0 },
      catalogue_source: {
        repository: "GRADEMASTER007/dragon-fruit-south-africa",
        commit: "813833f",
        importedProducts: PRODUCTS.length,
      },
    };
    for (const [key, value] of Object.entries(defaults))
      await connection.execute(
        "INSERT IGNORE INTO store_settings (setting_key, value_json) VALUES (?, ?)",
        [key, JSON.stringify(value)],
      );
    await connection.execute(
      "INSERT INTO schema_migrations (migration_name, checksum) VALUES (?, ?)",
      [
        "seed_catalogue_813833f",
        createHash("sha256").update(JSON.stringify(PRODUCTS)).digest("hex"),
      ],
    );
    console.log(
      `Imported ${PRODUCTS.length} source products; existing rows preserved. No buyers or transactions seeded.`,
    );
  });
  const [counts] = await db.query<RowDataPacket[]>("SELECT COUNT(*) AS count FROM products");
  console.log(`Native catalogue records: ${counts[0].count}`);
}

migrate()
  .catch(() => {
    console.error(
      "Native migration failed. No credentials are logged; inspect schema and retry the additive migration.",
    );
    process.exitCode = 1;
  })
  .finally(closeDatabase);
