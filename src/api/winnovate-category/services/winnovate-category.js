'use strict';

/**
 * winnovate-category service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::winnovate-category.winnovate-category', ({ strapi }) => ({
    async findAll(ctx) {
        return { list: 1 }
    },
    async findOneById(ctx) {
        return { detail: 1 }
    },
}));
