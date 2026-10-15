import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getEditorialPost } from "@/lib/editorial";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getEditorialPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData: post }) => ({
    meta: post
      ? [
          { title: `${post.title} · DFSA` },
          { name: "description", content: post.excerpt },
          { property: "og:type", content: "article" },
          { property: "og:title", content: post.title },
          { property: "og:description", content: post.excerpt },
        ]
      : [],
  }),
  component: Article,
});

function Article() {
  const post = Route.useLoaderData();
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link to="/blog" className="text-sm font-medium text-primary">
        ← All growing guides
      </Link>
      <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-primary">
        {post.category} · {post.readTime}
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
        {post.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
      <p className="mt-4 text-xs text-muted-foreground">DFSA editorial · {post.date}</p>
      <img
        src={post.image}
        alt={post.imageAlt}
        width={1024}
        height={640}
        className="mt-8 aspect-[8/5] w-full rounded-sm object-cover"
      />
      <div className="mt-10 space-y-9">
        {post.sections.map((section, index) => (
          <section key={index}>
            {section.heading && (
              <h2 className="mb-4 font-display text-2xl font-semibold">{section.heading}</h2>
            )}
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex} className="mt-4 leading-8 text-foreground/80">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-foreground/80">
                {section.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} className="leading-7">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <aside className="mt-12 border-t border-border pt-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          This is general editorial guidance, not a site-specific agronomic or financial forecast.
          Confirm current conditions, costs and requirements with qualified advisers.
        </p>
        <Link to="/contact" className="mt-4 inline-block font-semibold text-primary">
          Discuss your growing plans with DFSA →
        </Link>
      </aside>
    </article>
  );
}
