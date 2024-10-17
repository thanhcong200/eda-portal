const { authUser } = require("../../custom-auth/middlewares/custom-auth");

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/winnovate-topic/all",
      handler: "winnovate-topic.findAll",
      config: {
        auth: false,
        // middlewares: [authUser],
      },
    },
    {
      method: "GET",
      path: "/winnovate-topic/:document_id",
      handler: "winnovate-topic.findOneById",
      config: {
        auth: false,
        // middlewares: [authUser],
      },
    },
  ],
};
