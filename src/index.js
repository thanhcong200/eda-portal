"use strict";

const envConfig = require("../config/env-config");
const { readDataFromWinnovateFile } = require("./seeder");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    if (envConfig.ENABLE_SEEDER === 1) {
      await readDataFromWinnovateFile(strapi);
    }
  },
};
