const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { getRedisClient } = require("./connectors/redis");

const getLimiterStore = () => {
  const client = getRedisClient();

  if (!client) {
    throw new Error("Redis client has not been initialized yet!");
  }

  return new RedisStore({
    // Safely execute commands directly against your active connection
    sendCommand: async (...args) => {
      return client.sendCommand(args);
    },
  });
};

/*
   Here we are relying on the redis store to cache the IP addresses which are frequently requesting 
   (like millions of requests flowing from one IP address at a time blocking the actual users). 
   The reason to use redis is because we are offloading the responsibilty of storing the IP addresses from
   api server memory to redis so that API server can be used for serving the requests and not blocked by
   memory overload.
*/

function rateLimiter(config) {
  return rateLimit({
    windowMs: config?.windowMs || 15 * 60 * 1000, // 15 minutes
    max: config?.max || 20,
    standardHeaders: config?.standardHeaders ?? true,
    legacyHeaders: config?.legacyHeaders ?? false,
    store: getLimiterStore(),
    message: {
      error: config?.error || "rate limiting error",
    },
  });
}

module.exports = {
  rateLimiter,
};
