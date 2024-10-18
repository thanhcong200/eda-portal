'use strict';

/**
 * winnovate-topic controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::winnovate-topic.winnovate-topic', ({ strapi }) => ({
    async findAll(ctx) {
        const result = await strapi
            .service("api::winnovate-topic.winnovate-topic")
            .findAll(ctx);
        ctx.send(result);
    },
    async findOneById(ctx) {
        const result = await strapi
            .service("api::winnovate-topic.winnovate-topic")
            .findOneById(ctx);
        ctx.send(result);
    },
}));
