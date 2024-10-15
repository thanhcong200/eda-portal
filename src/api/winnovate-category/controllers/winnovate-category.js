'use strict';

/**
 * winnovate-category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::winnovate-category.winnovate-category', ({ strapi }) => ({
    async findAll(ctx) {
        const result = await strapi
            .service("api::winnovate-category.winnovate-category")
            .findAll(ctx);
        ctx.send(result);
    },
    async findOneById(ctx) {
        const result = await strapi
            .service("api::winnovate-category.winnovate-category")
            .findOneById(ctx);
        ctx.send(result);
    },
}));
