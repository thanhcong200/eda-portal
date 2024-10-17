const { authUser } = require("../../custom-auth/middlewares/custom-auth");

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/winnovate-category/all",
      handler: "winnovate-category.findAll",
      config: {
        auth: false,
        // middlewares: [authUser],
      },
    },
    {
      method: "GET",
      path: "/winnovate-category/:document_id",
      handler: "winnovate-category.findOneById",
      config: {
        auth: false,
        // middlewares: [authUser],
      },
    },
  ],
};
