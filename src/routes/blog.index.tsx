import { createFileRoute, Link } from "@tanstack/react-router";
import { getEditorialPosts } from "@/lib/editorial";

export const Route = createFileRoute("/blog/")({
  loader: () => getEditorialPosts(),
  head: () => ({
    meta: [
      { title: "Dragon Fruit Farming Blog · DFSA" },
      {
        name: "description",
        content:
          "DFSA grower resources on dragon fruit planting, cultivars, trellises, care and farm planning in South Africa.",
      },
    ],
  }),
  component: Blog,
});

function Blog() {
  const posts = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        The grower's library
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
        Rooted in practical knowledge.
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Explore the DFSA editorial library. For advice specific to your soil, climate and planting
        goals, speak with our team.
      </p>
      <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.slug}>
            <Link to="/blog/$slug" params={{ slug: post.slug }}>
              <img
                src={post.image}
                alt={post.imageAlt}
                loading="lazy"
                width={1024}
                height={640}
                className="aspect-[8/5] w-full rounded-sm object-cover"
              />
            </Link>
            <p className="mt-5 text-xs uppercase tracking-wider text-primary">
              {post.category} · {post.readTime}
            </p>
            <h2 className="mt-2 font-display text-xl font-semibold">
              <Link to="/blog/$slug" params={{ slug: post.slug }}>
                {post.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
            <Link
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="mt-4 inline-block text-sm font-semibold text-primary"
            >
              Read the guide →
            </Link>
          </article>
        ))}
      </div>
      {posts.length === 0 && (
        <p className="mt-10 text-muted-foreground">No published guides are available yet.</p>
      )}
    </div>
  );
}
