const { connectToDB } = require("./db");
const { startRedis } = require("./redis");

async function setupConnectors() {
  return Promise.all([connectToDB(), startRedis()]);
}

module.exports = {
  setupConnectors,
};
