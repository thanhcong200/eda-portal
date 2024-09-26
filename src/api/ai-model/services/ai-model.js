"use strict";

const {
  createResponse,
  pagination,
  parseTotal,
  parseEntries,
} = require("../../../common/util");

const { AIModelType } = require("../../../common/constant");

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
      type = AIModelType.AI_HUB,
    } = ctx.request.query;

    const query = `SELECT ai.id as id, ai.document_id as document_id, ai.name as name, ai.impact as impact, 
                      ai.purpose as purpose, ai.type as type, ai.logo as logo,
                      f.url as url, f.formats as image,
                      ai.updated_at as updated_at, ai.created_at as created_at, ai.published_at as published_at, 
                      ai.locale as locale 
                    FROM ai_models ai
                    LEFT JOIN files_related_mph fr ON fr.related_id = ai.id AND fr.related_type = 'api::ai-model.ai-model' AND fr.field = 'cover'
                    LEFT JOIN files f ON f.id = fr.file_id 
                    WHERE ai.published_at IS NOT NULL AND ai.type = ? 
                    AND (ai.name LIKE ? OR ai.impact LIKE ? OR ai.purpose LIKE ?)
                    ORDER BY ${sortField} ${sortValue}
                    LIMIT ? OFFSET ?
        `;
    const countQuery = `SELECT count(1) as count FROM ai_models 
                    WHERE published_at IS NOT NULL AND type = ?
        `;
    const [entries, total] = await Promise.all([
      strapi.db.connection.raw(query, [
        type,
        `%${keyword}%`,
        `%${keyword}%`,
        `%${keyword}%`,
        limit,
        (page - 1) * limit,
      ]),
      strapi.db.connection.raw(countQuery, [type]),
    ]);
    return {
      ...createResponse(parseEntries(entries)),
      meta: pagination(parseTotal(total), page, limit),
    };
  },
}));
