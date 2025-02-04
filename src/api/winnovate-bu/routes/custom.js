const { authUser } = require("../../custom-auth/middlewares/custom-auth");

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/winnovate-bu/all",
      handler: "winnovate-bu.findAll",
      config: {
        middlewares: [authUser],
      },
    },
    {
      method: "GET",
      path: "/winnovate-bu/:document_id",
      handler: "winnovate-bu.findOneById",
      config: {
        middlewares: [authUser],
      },
    },
  ],
};
