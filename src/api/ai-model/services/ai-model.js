"use strict";

const {
  createResponse,
  pagination,
  parseTotal,
} = require("../../../common/util");

/**
 * ai-model service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::ai-model.ai-model", ({ strapi }) => ({
  async findAll(ctx) {
    const {
      keyword = "",
      sortField = "created_at",
      sortValue = "DESC",
      page = 1,
      limit = 10,
    } = ctx.request.query;
    const query = `SELECT id, document_id, name, impact, purpose, metrics, type, logo,
                    updated_at, created_at, published_at, locale 
                    FROM ai_models 
                    WHERE published_At IS NOT NULL
                    ORDER BY ${sortField} ${sortValue}
                    LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
    const countQuery = `SELECT count(1) FROM ai_models 
                    WHERE published_At IS NOT NULL
        `;
    const [entries, total] = await Promise.all([
      strapi.db.connection.raw(query),
      strapi.db.connection.raw(countQuery),
    ]);

    return {
      ...createResponse(entries.rows),
      meta: pagination(parseTotal(total), page, limit),
    };
  },
}));
