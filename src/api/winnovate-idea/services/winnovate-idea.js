'use strict';

/**
 * winnovate-idea service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::winnovate-idea.winnovate-idea', ({ strapi }) => ({
    async findAll(ctx) {
        return { list: 1 }
    },
    async findOneById(ctx) {
        return { detail: 1 }
    },
}));
