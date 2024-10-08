const { authUser } = require("../../custom-auth/middlewares/custom-auth");

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/ai-propensity-model/:ai_model_document_id/all",
      handler: "ai-propensity-model.findAll",
      config: {
        middlewares: [authUser],
      },
    },
    {
      method: "GET",
      path: "/ai-propensity-model/:document_id",
      handler: "ai-propensity-model.findOneById",
      config: {
        middlewares: [authUser],
      },
    },
  ],
};
