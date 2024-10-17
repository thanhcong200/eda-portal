const { authUser } = require("../../custom-auth/middlewares/custom-auth");

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/winnovate-idea/all",
      handler: "winnovate-idea.findAll",
      config: {
        auth: false
        // middlewares: [authUser],
      },
    },
    {
      method: "GET",
      path: "/winnovate-idea/group",
      handler: "winnovate-idea.findGroup",
      config: {
        auth: false
        // middlewares: [authUser],
      },
    },
    {
      method: "GET",
      path: "/winnovate-idea/bu",
      handler: "winnovate-idea.findBU",
      config: {
        auth: false
        // middlewares: [authUser],
      },
    },
    {
      method: "GET",
      path: "/winnovate-idea/topic",
      handler: "winnovate-idea.findTopic",
      config: {
        auth: false
        // middlewares: [authUser],
      },
    },
    {
      method: "POST",
      path: "/winnovate-idea/:document_id/bookmark",
      handler: "winnovate-idea.saveBookmark",
      config: {
        middlewares: [authUser],
      },
    },
    {
      method: "GET",
      path: "/winnovate-idea/:document_id",
      handler: "winnovate-idea.findOneById",
      config: {
        auth: false
        // middlewares: [authUser],
      },
    },
  ],
};
