'use strict';

/**
 * winnovate-bu controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::winnovate-bu.winnovate-bu', 
    ({ strapi }) => ({
        async findAll(ctx) {
          const result = await strapi
            .service("api::winnovate-bu.winnovate-bu")
            .findAll(ctx);
          ctx.send(result);
        },
        async findOneById(ctx) {
          const result = await strapi
            .service("api::winnovate-bu.winnovate-bu")
            .findOneById(ctx);
          ctx.send(result);
        },
      })
);
