const { authUser } = require("../../custom-auth/middlewares/custom-auth");

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/ai-model/all",
      handler: "ai-model.findAll",
      config: {
        middlewares: [authUser],
      },
    },
  ],
};
