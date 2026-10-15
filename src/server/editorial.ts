import type { RowDataPacket } from "mysql2/promise";
import type { BlogPost, BlogSection } from "../data/blog";
import { rows } from "./database";

export async function editorialPosts(): Promise<BlogPost[]> {
  const records = await rows<RowDataPacket>(
    "SELECT slug, title, excerpt, category, publication_date, read_time, image_path, image_alt, sections_json FROM blog_posts WHERE published = TRUE ORDER BY publication_date DESC, slug",
  );
  return records.map((record) => ({
    slug: String(record.slug),
    title: String(record.title),
    excerpt: String(record.excerpt),
    category: String(record.category),
    date:
      record.publication_date instanceof Date
        ? record.publication_date.toISOString().slice(0, 10)
        : String(record.publication_date).slice(0, 10),
    readTime: String(record.read_time),
    image: String(record.image_path),
    imageAlt: String(record.image_alt),
    sections: (typeof record.sections_json === "string"
      ? JSON.parse(record.sections_json)
      : record.sections_json) as BlogSection[],
  }));
}
