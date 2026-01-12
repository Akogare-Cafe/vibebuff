import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("Redis credentials not configured. Rate limiting will be disabled.");
    return null;
  }

  redis = new Redis({
    url,
    token,
  });

  return redis;
}
