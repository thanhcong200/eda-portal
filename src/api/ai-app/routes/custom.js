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
      method: "POST",
      path: "/ai-app/:document_id/generate",
      handler: "ai-app.generate",
      config: {
        middlewares: [authUser],
      },
    },
    {
      method: "POST",
      path: "/ai-app/:document_id/like",
      handler: "ai-app.like",
      config: {
        middlewares: [authUser],
      },
    },
    {
      method: "POST",
      path: "/ai-app/:document_id/bookmark",
      handler: "ai-app.saveBookmark",
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
