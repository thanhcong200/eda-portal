'use strict';

/**
 * ai-propensity-model controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  "api::ai-propensity-model.ai-propensity-model",
  ({ strapi }) => ({
    async findAll(ctx) {
      const result = await strapi
        .service("api::ai-propensity-model.ai-propensity-model")
        .findAll(ctx);
      ctx.send(result);
    },
    async findOneById(ctx) {
      const result = await strapi
        .service("api::ai-propensity-model.ai-propensity-model")
        .findOneById(ctx);
      ctx.send(result);
    },
  })
);
