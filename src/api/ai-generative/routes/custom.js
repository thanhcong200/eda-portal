const { authUser } = require("../../custom-auth/middlewares/custom-auth");

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/ai-generative/all",
      handler: "ai-generative.findAll",
      config: {
        middlewares: [authUser],
      },
    },
  ],
};