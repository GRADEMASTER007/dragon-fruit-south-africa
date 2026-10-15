import { createServerFn } from "@tanstack/react-start";

export const getSiteSeo = createServerFn({ method: "GET" }).handler(async () => {
  const { publicSiteOrigin } = await import("../server/seo");
  return { origin: await publicSiteOrigin() };
});
