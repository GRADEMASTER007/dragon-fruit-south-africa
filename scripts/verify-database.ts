import { randomUUID } from "node:crypto";
import { database, closeDatabase } from "../src/server/database";
import type { RowDataPacket } from "mysql2/promise";

async function verify() {
  const db = database();
  const [products] = await db.query<RowDataPacket[]>("SELECT COUNT(*) AS count FROM products");
  const [orders] = await db.query<RowDataPacket[]>("SELECT COUNT(*) AS count FROM orders");
  const id = randomUUID();
  await db.execute("INSERT INTO persistence_probes (id, description) VALUES (?, ?)", [
    id,
    "Manus native persistence verification; not an order, customer or payment.",
  ]);
  await closeDatabase();
  const [records] = await database().execute<RowDataPacket[]>(
    "SELECT id, description, created_at FROM persistence_probes WHERE id = ?",
    [id],
  );
  if (records.length !== 1) throw new Error("Persistence probe not found after reconnect.");
  console.log(
    JSON.stringify(
      {
        nativeDatabaseRead: true,
        nativeDatabaseWrite: true,
        persistedAfterConnectionRestart: true,
        catalogueRecords: Number(products[0].count),
        orderRecords: Number(orders[0].count),
        probeId: id,
        noBusinessRecordsFabricated: true,
      },
      null,
      2,
    ),
  );
}

verify()
  .catch(() => {
    console.error(
      "Native database verification failed; no connection credentials or personal data are logged.",
    );
    process.exitCode = 1;
  })
  .finally(closeDatabase);
