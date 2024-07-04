module.exports = function (app) {
  const index = require("../controllers/indexController");
  const jwtMiddleware = require("../../config/jwtMiddleware");

  // Read
  app.get("/restaurants", index.readRestaurants);
};
