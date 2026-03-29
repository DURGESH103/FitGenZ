const { cacheClient } = require("../config/cache");

const cacheByQuery = (prefix, ttlSeconds = 60) => async (req, res, next) => {
  const key = `${prefix}:${JSON.stringify(req.query)}`;
  const cached = await cacheClient.get(key);
  if (cached) return res.status(200).json({ ...cached, cached: true });

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    res.json = originalJson; // restore before calling to avoid infinite loop
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cacheClient.set(key, body, ttlSeconds).catch(() => {});
    }
    return originalJson(body);
  };

  return next();
};

module.exports = { cacheByQuery };
