const { getToken } = require("../middleware/middleware.jwtoken");
async function postTokenController(req, res) {
  res = getToken({});
  return res;
}

module.exports = { postTokenController };
