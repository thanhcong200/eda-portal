"use strict";

/**
 * A set of functions called "actions" for `custom-auth`
 */

module.exports = {
  async login(ctx) {
    const result = await strapi
      .service("api::custom-auth.custom-auth")
      .login(ctx);
    ctx.send(result);
  },
  async refreshToken(ctx) {
    const result = await strapi
      .service("api::custom-auth.custom-auth")
      .refreshToken(ctx);
    ctx.send(result);
  },
  async logout(ctx) {
    const result = await strapi
      .service("api::custom-auth.custom-auth")
      .logout(ctx);
    ctx.send(result);
  },
};
