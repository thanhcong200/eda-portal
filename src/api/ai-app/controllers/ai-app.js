'use strict';

/**
 * ai-app controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::ai-app.ai-app', ({ strapi }) => ({
    async generate(ctx) {
        const result = await strapi
            .service("api::ai-app.ai-app")
            .generate(ctx);
        ctx.send(result);
    },
    async like(ctx) {
        const result = await strapi
            .service("api::ai-app.ai-app")
            .like(ctx);
        ctx.send(result);
    },
    async saveBookmark(ctx) {
        const result = await strapi
            .service("api::ai-app.ai-app")
            .saveBookmark(ctx);
        ctx.send(result);
    },
    async findAll(ctx) {
        const result = await strapi
            .service("api::ai-app.ai-app")
            .findAll(ctx);
        ctx.send(result);
    },
    async findOneById(ctx) {
        const result = await strapi
            .service("api::ai-app.ai-app")
            .findOneById(ctx);
        ctx.send(result);
    },
}));