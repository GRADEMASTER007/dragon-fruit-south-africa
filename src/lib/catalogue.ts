import { createServerFn } from "@tanstack/react-start";

export const getCatalogue = createServerFn({ method: "GET" }).handler(async () => {
  const { catalogue } = await import("../server/store");
  return catalogue();
});
