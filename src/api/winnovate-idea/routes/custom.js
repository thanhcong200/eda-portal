const { authUser } = require("../../custom-auth/middlewares/custom-auth");

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/winnovate-idea/all",
      handler: "winnovate-idea.findAll",
      config: {
        middlewares: [authUser],
      },
    },
    {
      method: "GET",
      path: "/winnovate-idea/:document_id",
      handler: "winnovate-idea.findOneById",
      config: {
        middlewares: [authUser],
      },
    },
  ],
};
