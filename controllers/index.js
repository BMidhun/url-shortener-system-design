const { dbServiceInstance } = require("../services/db");
const { redisServiceInstance } = require("../services/redis");
const { isValidHttpUrl } = require("../utils/isValidUrl");
const { getSqids } = require("../utils/sqids");

async function shortenURLController(req, res) {
  const longUrl = req.body.longUrl;
  const response = {
    status: 200,
    error: [],
    success: true,
    data: null,
  };

  // VALIDATIONS
  if (!longUrl.length) {
    response.status = 400;
    response.error = [{ message: "longURL is required" }];
    response.success = false;
    return res.status(response.status).json(response);
  }

  if (!isValidHttpUrl(longUrl)) {
    response.status = 400;
    response.error = [{ message: "Not a valid longURL" }];
    response.success = false;
    return res.status(response.status).json(response);
  }

  try {
    const { isExisting, shortCode: shortURLCode } =
      await dbServiceInstance.createShortUrl(longUrl);

    await redisServiceInstance.addURLToCache(shortURLCode, longUrl);
    response.status = isExisting ? 200 : 201;
    response.error = [];
    response.success = true;
    response.data = { shortCode: shortURLCode };
  } catch (error) {
    response.status = 500;
    response.error = [{ message: error?.message || "Server issue" }];
    response.success = false;
  }
  return res.status(response.status).json(response);
}

async function getLongURLController(req, res) {
  const shortCode = req.params.shortCode;

  const response = {
    status: 200,
    error: [],
    success: true,
    data: null,
  };

  // VALIDATIONS
  if (!shortCode) {
    response.status = 400;
    response.error = [{ message: "Please pass a shortCode" }];
    response.success = false;
    return res.status(response.status).json(response);
  }

  const decodedArray = getSqids().decode(shortCode);

  if (decodedArray.length === 0) {
    response.status = 404;
    response.error = [{ message: "URL not found" }];
    response.success = false;
    return res.status(response.status).json(response);
  }

  try {
    const id = decodedArray[0];

    let longURL = null;
    let hasHitCache = true;

    // First check in cache, if not then in db
    longURL = await redisServiceInstance.getURLFromCache(shortCode);

    if (!longURL) {
      console.log("Cache hit miss..");
      longURL = await dbServiceInstance.getLongURL(id);
      hasHitCache = false;
    }

    if (!longURL) {
      response.status = 404;
      response.error = [{ message: `URL not found` }];
      response.success = false;
      return res.status(response.status).json(response);
    } else {
      if (!hasHitCache)
        await redisServiceInstance.addURLToCache(shortCode, longURL);
    }

    return res.redirect(longURL);
  } catch (error) {
    response.status = 500;
    response.error = [{ message: error?.message || "Server error" }];
    response.success = false;
    return res.status(response.status).json(response);
  }
}

module.exports = {
  shortenURLController,
  getLongURLController,
};
