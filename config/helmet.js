const helmet = require("helmet");

function getHelmetConfig() {
  const env = process.env.NODE_ENV;

  if (env === "development" || env === "secure-development") {
    return {
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          // Allow fetch/POST requests to your API ports
          "connect-src": ["'self'", `http://localhost:${process.env.PORT}`],
          "script-src": [
            "'self'",
            "'sha256-4y1PYUkT4pbG8JSf49t3vlsRw5zUN0IsIbIkSFgrvU4='",
          ],
        },
      },
    };
  } else return {};
}

module.exports = {
  getHelmetConfig,
};
