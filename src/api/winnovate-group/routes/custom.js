const { authUser } = require("../../custom-auth/middlewares/custom-auth");

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/winnovate-group/all",
      handler: "winnovate-group.findAll",
      config: {
        middlewares: [authUser],
      },
    },
    {
      method: "GET",
      path: "/winnovate-group/:document_id",
      handler: "winnovate-group.findOneById",
      config: {
        middlewares: [authUser],
      },
    },
  ],
};
