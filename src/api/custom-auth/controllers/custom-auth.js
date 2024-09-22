"use strict";

/**
 * A set of functions called "actions" for `custom-auth`
 */


module.exports = {
  async login(ctx) {
    return strapi.service('api::custom-auth.custom-auth').login(ctx);
  },
  async refreshToken(ctx) {
    return strapi.service('api::custom-auth.custom-auth').refreshToken(ctx);
  },
  async logout(ctx) {
    return strapi.service('api::custom-auth.custom-auth').logout(ctx);
  }

};
