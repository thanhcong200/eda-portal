'use strict';

/**
 * winnovate-topic service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::winnovate-topic.winnovate-topic', ({ strapi }) => ({
    async findAll(ctx) {
        return { list: 1 }
    },
    async findOneById(ctx) {
        return { detail: 1 }
    },
}));
