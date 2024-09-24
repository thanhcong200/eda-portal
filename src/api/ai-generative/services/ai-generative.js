"use strict";

const { pagination, parseTotal, createResponse } = require("../../../common/util");

/**
 * ai-generative service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::ai-generative.ai-generative",
  ({ strapi }) => ({
    async findAll(ctx) {
      const {
        sortField = "created_at",
        sortValue = "DESC",
        page = 1,
        limit = 10,
      } = ctx.request.query;
      const query = `SELECT id, document_id, name, short_desc, ref_url, image, updated_at, created_at, published_at, locale 
                    FROM ai_generatives 
                    WHERE published_At IS NOT NULL
                    ORDER BY ${sortField} ${sortValue}
                    LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
      const countQuery = `SELECT count(1) FROM ai_generatives 
                    WHERE published_At IS NOT NULL
        `;
      const [entries, total] = await Promise.all([
        strapi.db.connection.raw(query),
        strapi.db.connection.raw(countQuery),
      ]);

      return { ...createResponse(entries.rows), meta: pagination(parseTotal(total), page, limit) };
    },
  })
);
