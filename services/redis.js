const { getRedisClient } = require("../config/connectors/redis");

class RedisService {
  async addURLToCache(shortCode, longUrl) {
    const redisClient = getRedisClient();
    console.log(`Setting URL ${longUrl} to cache....`);
    // set string with expiration
    return await redisClient.setEx(`url:${shortCode}`, 900, longUrl);
  }

  async getURLFromCache(shortCode) {
    const redisClient = getRedisClient();
    console.log(`Getting long URL of ${shortCode} from cache....`);
    return await redisClient.get(`url:${shortCode}`);
  }
}

const redisServiceInstance = new RedisService();

module.exports = {
  redisServiceInstance,
};
