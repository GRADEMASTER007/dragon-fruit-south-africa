import { database, closeDatabase } from "../src/server/database";

async function main() {
  const [key, origin] = process.argv.slice(2);
  if (
    !["public_site_origin", "preview_site_origin"].includes(key) ||
    !origin ||
    new URL(origin).origin !== origin ||
    !origin.startsWith("https://")
  )
    throw new Error("Supply the platform-returned exact HTTPS public or Preview origin.");
  await database().execute(
    "INSERT INTO store_settings (setting_key, value_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)",
    [key, JSON.stringify(origin)],
  );
  console.log(`Stored non-sensitive ${key}: ${origin}`);
}
main()
  .catch(() => {
    console.error("Origin configuration failed.");
    process.exitCode = 1;
  })
  .finally(closeDatabase);
