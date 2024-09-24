"use strict";

/**
 * ai-generative controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::ai-generative.ai-generative",
  ({ strapi }) => ({
    async findAll(ctx) {
      const result = await strapi
        .service("api::ai-generative.ai-generative")
        .findAll(ctx);
      ctx.send(result);
    },
  })
);
