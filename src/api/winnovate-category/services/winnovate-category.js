'use strict';

const { createResponse, parseEntries } = require('../../../common/util');

/**
 * winnovate-category service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::winnovate-category.winnovate-category', ({ strapi }) => ({
    async findAll(ctx) {
        const {
          keyword = "",
          sortField = "created_at",
          sortValue = "DESC",
        } = ctx.request.query;
        const query = `SELECT category.id as id, category.document_id as document_id, category.name as name, 
                        f.url as url, f.formats as image 
                        FROM winnovate_categories category
                        LEFT JOIN files_related_mph fr ON fr.related_id = category.id AND fr.related_type = 'api::winnovate-category.winnovate-category' AND fr.field = 'image'
                        LEFT JOIN files f ON f.id = fr.file_id 
                        WHERE category.published_at IS NOT NULL AND LOWER(category.name) LIKE ?
                        ORDER BY category.${sortField} ${sortValue}
          `;
        const entries = await strapi.db.connection.raw(query, [
          `%${keyword.trim().toLowerCase()}%`,
        ]);
        return createResponse(parseEntries(entries));
      },
      async findOneById(ctx) {
        const { document_id } = ctx.params;
        const query = `SELECT category.id as id, category.document_id as document_id, category.name as name, 
                        f.url as url, f.formats as image 
                        FROM winnovate_categories category
                        LEFT JOIN files_related_mph fr ON fr.related_id = category.id AND fr.related_type = 'api::winnovate-category.winnovate-category' AND fr.field = 'image'
                        LEFT JOIN files f ON f.id = fr.file_id 
                        WHERE category.published_at IS NOT NULL AND category.document_id = ?
          `;
        const entries = await strapi.db.connection.raw(query, [document_id]);
        return {
          ...createResponse(parseEntries(entries)[0]),
        };
      },
}));
