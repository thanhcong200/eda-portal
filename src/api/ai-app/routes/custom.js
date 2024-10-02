const { authUser } = require("../../custom-auth/middlewares/custom-auth");

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/ai-app/all",
      handler: "ai-app.findAll",
      config: {
        middlewares: [authUser],
      },
    },
    {
      method: "GET",
      path: "/ai-app/:document_id",
      handler: "ai-app.findOneById",
      config: {
        middlewares: [authUser],
      },
    },
  ],
};
