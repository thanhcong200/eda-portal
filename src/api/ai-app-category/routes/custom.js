const { authUser } = require("../../custom-auth/middlewares/custom-auth");

module.exports = {
    routes: [
        {
            method: "GET",
            path: "/ai-app-category/all",
            handler: "ai-app-category.findAll",
            config: {
                middlewares: [authUser],
            },
        }
    ],
};
