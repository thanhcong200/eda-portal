"use strict";

const {
  pagination,
  parseTotal,
  createResponse,
  parseEntries,
} = require("../../../common/util");

/**
 * ai-generative service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::ai-generative.ai-generative",
  ({ strapi }) => ({
    async findAll(ctx) {
      const {
        keyword = "",
        sortField = "created_at",
        sortValue = "DESC",
        page = 1,
        limit = 10,
      } = ctx.request.query;
      const query = `SELECT ai.id as id, ai.document_id as document_id, ai.name as name, 
                      ai.short_desc as short_desc, ai.ref_url as ref_url, ai.image as image, 
                      f.url as url, f.formats as logo,
                      ai.updated_at as updated_at, ai.created_at as created_at, ai.published_at as published_at, 
                      ai.locale as locale
                    FROM ai_generatives ai
                    LEFT JOIN files_related_mph fr ON fr.related_id = ai.id AND fr.related_type = 'api::ai-generative.ai-generative' AND fr.field = 'logo'
                    LEFT JOIN files f ON f.id = fr.file_id 
                    WHERE ai.published_at IS NOT NULL AND (LOWER(ai.name) LIKE ? OR LOWER(ai.short_desc) LIKE ?)
                    ORDER BY ${sortField} ${sortValue}
                    LIMIT ? OFFSET ?
        `;
      const countQuery = `SELECT count(1) as count FROM ai_generatives 
                    WHERE published_at IS NOT NULL AND (LOWER(name) LIKE ? OR LOWER(short_desc) LIKE ?)
        `;
      const [entries, total] = await Promise.all([
        strapi.db.connection.raw(query, [
          `%${keyword.trim().toLowerCase()}%`,
          `%${keyword.trim().toLowerCase()}%`,
          limit,
          (page - 1) * limit,
        ]),

        strapi.db.connection.raw(countQuery, [
          `%${keyword.trim().toLowerCase()}%`,
          `%${keyword.trim().toLowerCase()}%`,
        ]),
      ]);

      return {
        ...createResponse(parseEntries(entries)),
        meta: pagination(parseTotal(total), page, limit),
      };
    },
  })
);
