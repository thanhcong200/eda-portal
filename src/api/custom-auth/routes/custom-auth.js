const { authUser } = require("../middlewares/custom-auth");

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/custom-auth/login",
      handler: "custom-auth.login",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/custom-auth/refresh-token",
      handler: "custom-auth.refreshToken",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/custom-auth/logout",
      handler: "custom-auth.logout",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
};
