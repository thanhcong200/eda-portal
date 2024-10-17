"use strict";

/**
 * winnovate-idea controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::winnovate-idea.winnovate-idea",
  ({ strapi }) => ({
    async findAll(ctx) {
      const result = await strapi
        .service("api::winnovate-idea.winnovate-idea")
        .findAll(ctx);
      ctx.send(result);
    },
    async findGroup(ctx) {
      const result = await strapi
        .service("api::winnovate-idea.winnovate-idea")
        .findGroup(ctx);
      ctx.send(result);
    },
    async findBU(ctx) {
      const result = await strapi
        .service("api::winnovate-idea.winnovate-idea")
        .findBU(ctx);
      ctx.send(result);
    },
    async findTopic(ctx) {
      const result = await strapi
        .service("api::winnovate-idea.winnovate-idea")
        .findTopic(ctx);
      ctx.send(result);
    },
    async findOneById(ctx) {
      const result = await strapi
        .service("api::winnovate-idea.winnovate-idea")
        .findOneById(ctx);
      ctx.send(result);
    },
    async saveBookmark(ctx) {
      const result = await strapi
        .service("api::winnovate-idea.winnovate-idea")
        .saveBookmark(ctx);
      ctx.send(result);
    }
  })
);
