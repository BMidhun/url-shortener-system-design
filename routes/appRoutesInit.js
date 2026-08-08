const { rateLimiter } = require("../config/rate-limit.js");

const isLoadTestEnv = process.env === "loadtest";

function intializeRoutes(app) {
  app.get("/favicon.ico", (req, res) => res.status(204).end());

  // app.get("", (req, res) => {
  //   res.sendFile(`${rootDir}/ui/index.html`);
  // });

  app.get(
    "/:shortCode",
    ...(isLoadTestEnv
      ? [
          rateLimiter({
            windowMs: 1 * 60 * 1000,
            max: 100,
            message: "Too many requests. Slow down.",
          }),
        ]
      : []),
    (req, res) => {
      const shortCode = req.params.shortCode;
      const newPath = `/api/v1/shortUrls/${shortCode}`;
      return res.redirect(newPath);
    },
  );

  // Moving the router here because it relies on the redis intialization for rate limiting in the routes
  const { router } = require("./index.js");
  app.use("/api/v1", router);

  // Catch-all 404 handler for routes that don't match /api/v1/...
  app.use((req, res) => {
    return res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
  });
}

module.exports = {
  intializeRoutes,
};
