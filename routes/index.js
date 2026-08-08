const express = require("express");
const router = express.Router();

const {
  shortenURLController,
  getLongURLController,
} = require("../controllers");
const { rateLimiter } = require("../config/rate-limit");

const isLoadTestEnv = process.env === "loadtest";

router.get("/health", (req, res) => {
  return res.status(200);
});

router.post(
  "/shorten",
  ...(isLoadTestEnv
    ? [
        rateLimiter({
          windowMs: 15 * 60 * 1000,
          max: 20,
          message:
            "Too many links created from this IP. Please try again after 15 minutes.",
        }),
      ]
    : []),
  shortenURLController,
);

router.get(
  "/shortUrls/:shortCode",
  ...(isLoadTestEnv
    ? [
        rateLimiter({
          windowMs: 1 * 60 * 1000,
          max: 100,
          message: "Too many requests. Slow down.",
        }),
      ]
    : []),
  getLongURLController,
);

module.exports = {
  router,
};
