import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import ts from "typescript";
import type { RowDataPacket } from "mysql2/promise";
import { database, transaction, closeDatabase } from "../src/server/database";
import type { BlogPost } from "../src/data/blog";

async function importPosts() {
  const text = await readFile(new URL("../src/data/blog.ts", import.meta.url), "utf8");
  const source = ts.createSourceFile("blog.ts", text, ts.ScriptTarget.Latest, true);
  const images = new Map<string, string>();
  for (const statement of source.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      statement.importClause?.name &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      const basename = statement.moduleSpecifier.text.split("/").pop();
      images.set(statement.importClause.name.text, `/blog-assets/${basename}`);
    }
  }
  function parse(node: ts.Expression): unknown {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isArrayLiteralExpression(node))
      return node.elements.map((entry) => parse(entry as ts.Expression));
    if (ts.isObjectLiteralExpression(node))
      return Object.fromEntries(
        node.properties.map((property) => {
          if (!ts.isPropertyAssignment(property))
            throw new Error("Unsupported blog source property.");
          const key =
            ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
              ? property.name.text
              : undefined;
          if (!key) throw new Error("Unsupported blog source key.");
          return [key, parse(property.initializer)];
        }),
      );
    if (ts.isIdentifier(node) && images.has(node.text)) return images.get(node.text);
    throw new Error("Unsupported blog source expression; refusing to execute source.");
  }
  const declarations = source.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => statement.declarationList.declarations);
  const initializer = declarations.find(
    (declaration) => declaration.name.getText(source) === "blogPosts",
  )?.initializer;
  if (!initializer) throw new Error("Existing blog source not found.");
  const posts = parse(initializer) as BlogPost[];
  const marker = "seed_editorial_813833f";
  await transaction(async (connection) => {
    const [existing] = await connection.execute<RowDataPacket[]>(
      "SELECT migration_name FROM schema_migrations WHERE migration_name = ?",
      [marker],
    );
    if (existing.length) {
      console.log("Existing editorial seed preserved.");
      return;
    }
    for (const post of posts)
      await connection.execute(
        `INSERT IGNORE INTO blog_posts
      (slug, title, excerpt, category, publication_date, read_time, image_path, image_alt, sections_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          post.slug,
          post.title,
          post.excerpt,
          post.category,
          post.date,
          post.readTime,
          post.image,
          post.imageAlt,
          JSON.stringify(post.sections),
        ],
      );
    await connection.execute(
      "INSERT INTO schema_migrations (migration_name, checksum) VALUES (?, ?)",
      [marker, createHash("sha256").update(JSON.stringify(posts)).digest("hex")],
    );
    console.log(
      `Imported ${posts.length} existing editorial posts to native database. Later edits are not overwritten.`,
    );
  });
}

importPosts()
  .catch(() => {
    console.error("Editorial import failed; no source expressions were executed.");
    process.exitCode = 1;
  })
  .finally(closeDatabase);
