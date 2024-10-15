'use strict';

/**
 * winnovate-bu service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::winnovate-bu.winnovate-bu', ({ strapi }) => ({
    async findAll(ctx) {
        return { list: 1 }
    },
    async findOneById(ctx) {
        return { detail: 1 }
    },
}));
