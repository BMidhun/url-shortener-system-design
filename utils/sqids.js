const { default: Sqids } = require("sqids");

const sqids = new Sqids({
  minLength: 5, // Keep codes as short as possible
});

const getSqids = () => {
  return sqids;
};

module.exports = { getSqids };
