'use strict';

/**
 * ai-model controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  "api::ai-model.ai-model",
  ({ strapi }) => ({
    async findAll(ctx) {
      const result = await strapi
        .service("api::ai-model.ai-model")
        .findAll(ctx);
      ctx.send(result);
    },
  })
);
