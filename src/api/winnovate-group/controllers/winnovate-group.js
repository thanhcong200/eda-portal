'use strict';

/**
 * winnovate-group controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::winnovate-group.winnovate-group', ({ strapi }) => ({
    async findAll(ctx) {
        const result = await strapi
            .service("api::winnovate-group.winnovate-group")
            .findAll(ctx);
        ctx.send(result);
    },
    async findOneById(ctx) {
        const result = await strapi
            .service("api::winnovate-group.winnovate-group")
            .findOneById(ctx);
        ctx.send(result);
    },
}));
