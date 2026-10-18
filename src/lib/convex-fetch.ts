import { fetchQuery as convexFetchQuery } from "convex/nextjs";

// KAV-214: prerendering ~885 pages fires many Convex queries at once, and a
// transient network blip (`TypeError: fetch failed` / ETIMEDOUT) failed the
// whole prod build. Retry only those transient errors, with backoff; any
// other error (bad args, Convex function error) is rethrown immediately.

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 500;

export function isTransientFetchError(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const e = current as { code?: unknown; message?: unknown; cause?: unknown; errors?: unknown };
    if (e.code === "ETIMEDOUT") return true;
    if (typeof e.message === "string" && e.message.includes("fetch failed")) return true;
    if (Array.isArray(e.errors) && e.errors.some((inner) => isTransientFetchError(inner))) return true;
    current = e.cause;
  }
  return false;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const callConvex = convexFetchQuery as (...args: any[]) => Promise<unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchQuery: typeof convexFetchQuery = (async (...args: any[]) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await callConvex(...args);
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS || !isTransientFetchError(error)) throw error;
      const delay = BASE_DELAY_MS * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
      await sleep(delay);
    }
  }
}) as typeof convexFetchQuery;
