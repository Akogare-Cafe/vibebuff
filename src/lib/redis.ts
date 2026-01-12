import IORedis from "ioredis";

let redis: IORedis | null = null;

export function getRedis(): IORedis | null {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn("Redis credentials not configured. Rate limiting will be disabled.");
    return null;
  }

  redis = new IORedis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  });
  
  redis.connect().catch((err) => {
    console.error("Failed to connect to Redis:", err);
    redis = null;
  });
  
  return redis;
}
