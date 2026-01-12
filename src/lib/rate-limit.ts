import { NextRequest } from "next/server";
import { getRedis } from "./redis";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redis = getRedis();
  
  const identifier = 
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const key = `ratelimit:${identifier}:${request.nextUrl.pathname}`;

  if (!redis) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: now + config.windowMs,
    };
  }

  try {
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.pexpire(key, config.windowMs);
    }

    const ttl = await redis.pttl(key);
    const resetAt = ttl > 0 ? now + ttl : now + config.windowMs;

    if (current > config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - current),
      resetAt,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: now + config.windowMs,
    };
  }
}

export function createRateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Reset": new Date(resetAt).toISOString(),
      },
    }
  );
}
