# Proposal: Replace Railway Redis (rate limiting only)

Status: proposal (no code changes) — KAV-263 follow-up

## Context

Railway Redis is used for exactly one thing: fixed-window rate limiting of the AI API routes.

- `src/lib/redis.ts` — lazy `ioredis` singleton from `REDIS_URL`; returns `null` (and warns) if unset.
- `src/lib/rate-limit.ts` — `INCR` + `PEXPIRE` + `PTTL` per `ratelimit:<ip>:<pathname>` key.
- Callers:
  - `src/app/api/ai/recommend/route.ts:90` (50 req / 60s)
  - `src/app/api/ai/compare/route.ts:34` (50 req / 60s)
  - `src/app/api/ai/tools/route.ts:9` (100 req / 60s)
- `docs/REDIS_SETUP.md` documents the Railway setup.

What we have today:

- **It already fails open.** If `REDIS_URL` is missing, or any Redis command throws, the request is allowed (`rate-limit.ts`, the `!redis` branch and the `catch`).
- **It isn't a good fit for serverless.** Each Vercel function instance opens its own long-lived TCP connection to Railway. Cold starts pay the connection cost, and `maxRetriesPerRequest: 3` can add latency to `/api/ai/*` while Railway is slow.
- **It isn't atomic.** `INCR` and `PEXPIRE` are separate round trips, so a crash between them can leave a key with no TTL.
- **It's a separate vendor and bill** for one small feature.

## Options

| Option | Fit | Notes |
|---|---|---|
| **Upstash Redis via Vercel Marketplace** + `@upstash/ratelimit` | Best | HTTP/REST client, so there are no persistent sockets to manage and it works on Node and Edge. Env vars are provisioned into the Vercel project automatically and billing goes through Vercel. `@upstash/ratelimit` provides atomic sliding-window and fixed-window limits (a single Lua script), an optional ephemeral in-memory cache, and `timeout` / analytics options. The free tier covers our volume. |
| Vercel KV | N/A | Deprecated; it was Upstash under the hood, and new stores are created as Upstash via the Marketplace. |
| Vercel Edge Config | Not suitable | Read-optimised global config. Writes go through the REST API, are slow and rate-limited, and can't do per-request counters. |
| In-memory / no-op limiter | Fallback only | Per-instance memory isn't shared across Vercel instances or regions, so the effective limit becomes N × the configured limit. Fine as a degraded mode, but not as primary protection. |
| Convex-based limiter (`@convex-dev/rate-limiter` component or a hand-written mutation) | Viable | No new vendor, since Convex is already a dependency, and it's transactional and exact. The cost is that every AI request adds a Convex mutation, which uses function-call quota and adds latency. It also couples AI-route availability to Convex, the same dependency whose flakiness caused KAV-263. |
| Vercel WAF rate limiting (firewall rule) | Complementary | Configured in the dashboard, with no code changes, and blocks traffic before the function runs. Matching is by IP/path. Depends on plan; useful as an outer coarse limit. |

## Recommendation

Use **Upstash Redis via the Vercel Marketplace with `@upstash/ratelimit`**. Keep a small in-memory fallback, and optionally add a coarse Vercel WAF rule as an outer limit.

Why:

- It's a drop-in replacement for the current semantics: per IP + path, N requests per window.
- It removes Railway and the `ioredis` socket handling.
- Billing and env vars are managed in Vercel.

Convex is the runner-up if we want zero new vendors. We decided against it because the AI routes would then depend on Convex availability.

## Migration steps

1. Provision Upstash Redis from the Vercel Marketplace and connect it to the vibebuff project, covering Preview and Production. This sets `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_*`, depending on the integration).
2. Add the dependencies `@upstash/redis` and `@upstash/ratelimit`.
3. Rewrite `src/lib/rate-limit.ts` internals and keep the exported `rateLimit(request, config)` / `createRateLimitResponse` signatures, so the three route callers don't change.
   - Build one `Ratelimit` instance per `(maxRequests, windowMs)`. Use `Ratelimit.slidingWindow` for parity, or `fixedWindow` for exact parity.
   - Set `prefix: "ratelimit"`, `timeout` to about 1000 ms, and `ephemeralCache: new Map()`.
   - Map `{ success, remaining, reset }` to `{ allowed, remaining, resetAt }`.
4. Keep the identifier logic (`x-forwarded-for` first hop → `x-real-ip` → `"unknown"`). Consider trusting `request.ip`/`x-vercel-forwarded-for` on Vercel.
5. If the Upstash env vars are absent (local dev), fall back to a per-instance in-memory fixed window rather than a hard no-op.
6. Deploy to Preview and verify:
   - 429 responses after N requests.
   - `Retry-After` and `X-RateLimit-Reset` headers.
   - Behaviour with the Upstash env vars removed.
7. Ship to Production. Watch for 429 rate and route latency in Vercel Observability for a few days.
8. Decommission:
   - Delete `src/lib/redis.ts`, remove `ioredis`, and remove `REDIS_URL` from Vercel env and `.env.example`.
   - Update `docs/REDIS_SETUP.md` and `docs/SECURITY.md`.
   - Shut down the Railway Redis service after a one-week overlap.

## Fail-open vs fail-closed

Recommended policy: **fail open, with a degraded local limit.**

- **Backend error or timeout** (Upstash unreachable, or slower than the `timeout`): allow the request, but count it in the per-instance in-memory limiter, so a single instance can't be hammered without limit. Log at `warn` and report to Sentry with sampling.
- **Misconfiguration** (env missing in Production): same behaviour. Also log one `error` per cold start so it's visible.
- **Why not fail closed:** the limiter protects Anthropic spend on `/api/ai/*`. It isn't an auth boundary. Fail-closed would turn a limiter outage into a full AI-feature outage for every user. Note that none of the three `/api/ai/*` routes currently call BotID (`src/lib/botid.ts`) or check auth. Adding a BotID check to them is the right complement to fail-open, and is worth doing in the same PR.
- **When to revisit:** if spend abuse during a limiter outage becomes a real risk, switch `/api/ai/recommend` alone to fail closed for anonymous users and keep it open for authenticated users.
