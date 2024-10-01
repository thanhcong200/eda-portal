const { authUser } = require("../../custom-auth/middlewares/custom-auth");

module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/custom-upload',
            handler: 'custom-upload.customFileUpload',
            config: {
                auth: false,
                middlewares: [],
            },
        },
    ],
};
