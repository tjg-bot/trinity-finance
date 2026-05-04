import type { RedisOptions } from "ioredis";
import IORedis from "ioredis";

let redis: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (redis) return redis;

  const url = process.env["REDIS_URL"] ?? "redis://localhost:6379";
  redis = new IORedis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  } satisfies RedisOptions);

  return redis;
}
