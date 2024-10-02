'use strict';

const { createResponse, parseEntries } = require('../../../common/util');

/**
 * ai-app-category service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::ai-app-category.ai-app-category', ({ strapi }) => ({
    async findAll(ctx) {
        const {
            keyword = "",
            sortField = "created_at",
            sortValue = "DESC",
            page = 1,
            limit = 10,
        } = ctx.request.query;
        const query = `SELECT ai.id as id, ai.document_id as document_id, ai.name as name, 
                      ai.type as type, f.url as url, f.formats as image,
                      ai.updated_at as updated_at, ai.created_at as created_at, ai.published_at as published_at, 
                      ai.locale as locale
                    FROM ai_app_categories ai
                    LEFT JOIN files_related_mph fr ON fr.related_id = ai.id AND fr.related_type = 'api::ai-app-category.ai-app-category' AND fr.field = 'image'
                    LEFT JOIN files f ON f.id = fr.file_id 
                    WHERE ai.published_at IS NOT NULL AND LOWER(ai.name) LIKE ?
                    ORDER BY ${sortField} ${sortValue}
        `;

        const entries = await strapi.db.connection.raw(query, [
            `%${keyword.trim().toLowerCase()}%`,
        ]);

        return {
            ...createResponse(parseEntries(entries)),
        };
    },
}));
