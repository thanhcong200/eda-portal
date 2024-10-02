'use strict';

/**
 * ai-app-category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::ai-app-category.ai-app-category', ({ strapi }) => ({
    async findAll(ctx) {
        const result = await strapi
            .service("api::ai-app-category.ai-app-category")
            .findAll(ctx);
        ctx.send(result);
    }
}));
