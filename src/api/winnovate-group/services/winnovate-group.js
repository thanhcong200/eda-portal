'use strict';

/**
 * winnovate-group service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::winnovate-group.winnovate-group', ({ strapi }) => ({
    async findAll(ctx) {
        return { list: 1 }
    },
    async findOneById(ctx) {
        return { detail: 1 }
    },
}));
