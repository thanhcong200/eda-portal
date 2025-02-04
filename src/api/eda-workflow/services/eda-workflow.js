'use strict';

/**
 * eda-workflow service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::eda-workflow.eda-workflow');
