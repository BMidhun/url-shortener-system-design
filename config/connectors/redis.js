const { createClient } = require("redis");

let redisClient;

async function startRedis() {
  const url = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
  try {
    redisClient = createClient({
      url,
    });

    redisClient.on("error", (err) => {
      console.error("⚠️ Redis Background Client Error:", err.message);
    });

    await redisClient.connect();
    console.log("Successfully connected to Redis Server");
  } catch (error) {
    console.log("Failed to start redis server", error);
    throw error;
  }
}

function getRedisClient() {
  return redisClient;
}

module.exports = {
  startRedis,
  getRedisClient,
};
