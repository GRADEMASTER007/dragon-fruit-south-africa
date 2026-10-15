import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getEditorialPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { editorialPosts } = await import("../server/editorial");
  return editorialPosts();
});

export const getEditorialPost = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().min(1).max(191) }))
  .handler(async ({ data }) => {
    const { editorialPosts } = await import("../server/editorial");
    return (await editorialPosts()).find((post) => post.slug === data.slug) || null;
  });
