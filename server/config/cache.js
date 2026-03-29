const NodeCache = require("node-cache");
const Redis = require("ioredis");
const logger = require("../utils/logger");

const localCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
let redisClient = null;

if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
  redisClient.connect().catch((err) => logger.warn(`Redis unavailable, using local cache: ${err.message}`));
}

const get = async (key) => {
  if (redisClient && redisClient.status === "ready") {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }
  return localCache.get(key) || null;
};

const set = async (key, value, ttlSeconds = 60) => {
  if (redisClient && redisClient.status === "ready") {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
    return;
  }
  localCache.set(key, value, ttlSeconds);
};

module.exports = { cacheClient: { get, set } };
