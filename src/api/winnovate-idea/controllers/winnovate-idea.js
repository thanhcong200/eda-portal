'use strict';

/**
 * winnovate-idea controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::winnovate-idea.winnovate-idea', ({ strapi }) => ({
    async findAll(ctx) {
        const result = await strapi
            .service("api::winnovate-idea.winnovate-idea")
            .findAll(ctx);
        ctx.send(result);
    },
    async findOneById(ctx) {
        const result = await strapi
            .service("api::winnovate-idea.winnovate-idea")
            .findOneById(ctx);
        ctx.send(result);
    },
}));
