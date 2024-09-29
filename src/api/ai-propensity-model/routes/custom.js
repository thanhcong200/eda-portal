const { authUser } = require("../../custom-auth/middlewares/custom-auth");

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/ai-propensity-model/:aiModelId/all",
      handler: "ai-propensity-model.findAll",
      config: {
        middlewares: [authUser],
      },
    },
    {
      method: "GET",
      path: "/ai-propensity-model/:id",
      handler: "ai-propensity-model.findOneById",
      config: {
        middlewares: [authUser],
      },
    },
  ],
};
