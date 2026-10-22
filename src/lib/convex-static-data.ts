import "server-only";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { memoizeWithTtl, withRetry } from "./build-cache";

export function getCategoriesList() {
  return memoizeWithTtl("categories.list", () =>
    withRetry(() => fetchQuery(api.categories.list, {}), { label: "categories.list" })
  );
}

export function getToolsByCategory(categorySlug: string, limit = 10) {
  return memoizeWithTtl(`tools.list:${categorySlug}:${limit}`, () =>
    withRetry(() => fetchQuery(api.tools.list, { categorySlug, limit }), { label: `tools.list:${categorySlug}` })
  );
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategoriesList();
  return categories.find((c) => c.slug === slug) ?? null;
}
