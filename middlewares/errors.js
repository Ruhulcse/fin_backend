const { createResponse } = require("../utils/responseGenerate");

module.exports = function (err, req, res, next) {
  if (err) {
    console.error(
      `Error: ${req.method} request from ${req.ip} on route ${req.path}`.red
    );
    console.error(err);
    res.status(err.status || 500).json(createResponse(null, err.message, true));
  }
};
