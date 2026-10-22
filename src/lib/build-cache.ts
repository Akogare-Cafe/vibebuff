export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  label?: string;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
}

const TRANSIENT_CODES = new Set([
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "ECONNABORTED",
  "EPIPE",
  "EAI_AGAIN",
  "ENOTFOUND",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_SOCKET",
]);

const TRANSIENT_MESSAGE =
  /fetch failed|ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN|socket hang up|network error|timed? ?out|bad gateway|service unavailable|gateway timeout|internal server error|\b50[0-4]\b/i;

export function isTransientError(error: unknown, depth = 0): boolean {
  if (!error || typeof error !== "object" || depth > 3) return false;
  const err = error as { code?: unknown; status?: unknown; message?: unknown; cause?: unknown };

  if (typeof err.code === "string" && TRANSIENT_CODES.has(err.code)) return true;
  if (typeof err.status === "number" && err.status >= 500 && err.status < 600) return true;
  if (typeof err.message === "string" && TRANSIENT_MESSAGE.test(err.message)) return true;

  return isTransientError(err.cause, depth + 1);
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    retries = 3,
    baseDelayMs = 500,
    maxDelayMs = 5000,
    label = "request",
    sleep = defaultSleep,
    random = Math.random,
  } = options;

  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !isTransientError(error)) throw error;
      const cap = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
      const delay = Math.round(cap / 2 + random() * (cap / 2));
      console.warn(
        `[build-cache] ${label} failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms:`,
        error instanceof Error ? error.message : error
      );
      await sleep(delay);
    }
  }
}

interface CacheEntry<T> {
  promise: Promise<T>;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function memoizeWithTtl<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = 10 * 60 * 1000,
  now: () => number = Date.now
): Promise<T> {
  const existing = cache.get(key) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > now()) return existing.promise;

  const promise = loader();
  const entry: CacheEntry<T> = { promise, expiresAt: now() + ttlMs };
  cache.set(key, entry);
  promise.catch(() => {
    if (cache.get(key) === entry) cache.delete(key);
  });
  return promise;
}

export function clearBuildCache() {
  cache.clear();
}
