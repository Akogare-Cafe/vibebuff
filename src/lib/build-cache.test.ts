import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clearBuildCache,
  fallbackOrThrow,
  isStrictBuild,
  isTransientError,
  memoizeWithTtl,
  withRetry,
} from "./build-cache";

const noSleep = async () => {};

test("isTransientError detects network and 5xx failures", () => {
  const fetchFailed = new TypeError("fetch failed", {
    cause: Object.assign(new Error("connect ETIMEDOUT 1.2.3.4:443"), { code: "ETIMEDOUT" }),
  });
  assert.equal(isTransientError(fetchFailed), true);
  assert.equal(isTransientError(Object.assign(new Error("x"), { code: "ECONNRESET" })), true);
  assert.equal(isTransientError(Object.assign(new Error("x"), { status: 503 })), true);
  assert.equal(isTransientError(new Error("502 Bad Gateway")), true);
  assert.equal(isTransientError(new Error("Service Unavailable")), true);
});

test("isTransientError ignores application errors", () => {
  assert.equal(isTransientError(new Error("ArgumentValidationError: missing slug")), false);
  assert.equal(isTransientError(Object.assign(new Error("x"), { status: 404 })), false);
  assert.equal(isTransientError(null), false);
  assert.equal(isTransientError("fetch failed"), false);
});

test("isTransientError matches explicit HTTP 5xx status patterns", () => {
  for (const message of [
    "HTTP 500",
    "HTTP/1.1 503",
    "Request failed with status 502",
    "status: 504",
    "status code 500",
    "status=599",
  ]) {
    assert.equal(isTransientError(new Error(message)), true, message);
  }
});

test("isTransientError ignores bare numbers that look like 5xx", () => {
  for (const message of [
    "500 tools",
    "Found 503 results",
    "limit must be <= 500",
    "Tool #502 not found",
    "status 404",
    "HTTP 400",
    "status 5000",
  ]) {
    assert.equal(isTransientError(new Error(message)), false, message);
  }
});

test("isStrictBuild is strict for production deploys and CI, lenient for dev/preview", () => {
  assert.equal(isStrictBuild({ VERCEL_ENV: "production", NODE_ENV: "production", CI: "1" }), true);
  assert.equal(isStrictBuild({ VERCEL_ENV: "preview", NODE_ENV: "production", CI: "1" }), false);
  assert.equal(isStrictBuild({ VERCEL_ENV: "development", NODE_ENV: "development" }), false);
  assert.equal(isStrictBuild({ CI: "true", NODE_ENV: "test" }), true);
  assert.equal(isStrictBuild({ CI: "false", NODE_ENV: "development" }), false);
  assert.equal(isStrictBuild({ NODE_ENV: "production" }), true);
  assert.equal(isStrictBuild({ NODE_ENV: "development" }), false);
  assert.equal(isStrictBuild({}), false);
});

test("fallbackOrThrow rethrows in strict builds and falls back otherwise", () => {
  const error = new TypeError("fetch failed");
  assert.throws(() => fallbackOrThrow(error, [], "x", { VERCEL_ENV: "production" }), (e) => e === error);
  assert.throws(() => fallbackOrThrow(error, [], "x", { NODE_ENV: "production" }), (e) => e === error);
  const originalError = console.error;
  console.error = () => {};
  try {
    assert.deepEqual(fallbackOrThrow(error, [], "x", { VERCEL_ENV: "preview", NODE_ENV: "production" }), []);
    assert.equal(fallbackOrThrow(error, null, "x", { NODE_ENV: "development" }), null);
  } finally {
    console.error = originalError;
  }
});

test("withRetry retries transient errors with bounded exponential backoff", async () => {
  const delays: number[] = [];
  let calls = 0;
  const result = await withRetry(
    async () => {
      calls++;
      if (calls < 3) throw new TypeError("fetch failed");
      return "ok";
    },
    { retries: 3, baseDelayMs: 100, maxDelayMs: 150, random: () => 1, sleep: async (ms) => void delays.push(ms) }
  );
  assert.equal(result, "ok");
  assert.equal(calls, 3);
  assert.deepEqual(delays, [100, 150]);
});

test("withRetry gives up after the retry budget", async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls++;
        throw new TypeError("fetch failed");
      },
      { retries: 2, sleep: noSleep }
    ),
    /fetch failed/
  );
  assert.equal(calls, 3);
});

test("withRetry does not retry non-transient errors", async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls++;
        throw new Error("Server Error: invalid argument");
      },
      { sleep: noSleep }
    )
  );
  assert.equal(calls, 1);
});

test("memoizeWithTtl shares one in-flight promise across concurrent callers", async () => {
  clearBuildCache();
  let calls = 0;
  const loader = async () => {
    calls++;
    return [1, 2, 3];
  };
  const results = await Promise.all(Array.from({ length: 50 }, () => memoizeWithTtl("k", loader)));
  assert.equal(calls, 1);
  assert.ok(results.every((r) => r === results[0]));
});

test("memoizeWithTtl evicts rejected promises so the next caller refetches", async () => {
  clearBuildCache();
  let calls = 0;
  const loader = async () => {
    calls++;
    if (calls === 1) throw new Error("boom");
    return "fresh";
  };
  await assert.rejects(memoizeWithTtl("k", loader));
  await new Promise((r) => setImmediate(r));
  assert.equal(await memoizeWithTtl("k", loader), "fresh");
  assert.equal(calls, 2);
});

test("memoizeWithTtl refetches after the TTL expires", async () => {
  clearBuildCache();
  let t = 0;
  let calls = 0;
  const loader = async () => ++calls;
  assert.equal(await memoizeWithTtl("k", loader, 1000, () => t), 1);
  t = 999;
  assert.equal(await memoizeWithTtl("k", loader, 1000, () => t), 1);
  t = 1000;
  assert.equal(await memoizeWithTtl("k", loader, 1000, () => t), 2);
});
