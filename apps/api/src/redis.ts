import { createHash } from "node:crypto";
import { Redis } from "ioredis";
import { config } from "./config";

async function connect(): Promise<Redis> {
  if (config.redisUrl === "memory") {
    const { default: RedisMock } = await import("ioredis-mock");
    return new RedisMock() as unknown as Redis;
  }
  return new Redis(config.redisUrl, { maxRetriesPerRequest: 2 });
}

export const redis = await connect();

function dailySalt(): string {
  return `${config.hashSecret}:${new Date().toISOString().slice(0, 10)}`;
}

export function hash(value: string): string {
  return createHash("sha256").update(`${dailySalt()}:${value}`).digest("base64url").slice(0, 22);
}

const DEVICE_BANK_TTL = 10 * 60;
const IP_LIMIT = 20;
const IP_TTL = 60 * 60;

/** Returns seconds to wait, or 0 if allowed. */
export async function rateLimit(deviceId: string, ip: string, bankId: string): Promise<number> {
  const deviceKey = `rl:d:${hash(deviceId)}:${bankId}`;
  const ipKey = `rl:ip:${hash(ip)}`;

  const [[, setOk], [, ipCount], [, ipTtl]] = (await redis
    .multi()
    .set(deviceKey, "1", "EX", DEVICE_BANK_TTL, "NX")
    .incr(ipKey)
    .ttl(ipKey)
    .exec()) as [[null, string | null], [null, number], [null, number]];

  if (ipTtl < 0) await redis.expire(ipKey, IP_TTL);
  if (setOk !== "OK") return (await redis.ttl(deviceKey)) || DEVICE_BANK_TTL;
  if (ipCount > IP_LIMIT) {
    await redis.del(deviceKey);
    return ipTtl > 0 ? ipTtl : IP_TTL;
  }
  return 0;
}

export async function isDegraded(): Promise<boolean> {
  return (await redis.get("degraded")) === "1";
}
