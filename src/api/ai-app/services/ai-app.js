'use strict';

/**
 * ai-app service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::ai-app.ai-app');
