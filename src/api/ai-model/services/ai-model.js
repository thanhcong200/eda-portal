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
                    AND (LOWER(ai.name) LIKE ? OR LOWER(ai.impact) LIKE ? OR LOWER(ai.purpose) LIKE ?)
                    ORDER BY ${sortField} ${sortValue}
                    LIMIT ? OFFSET ?
        `;
    const countQuery = `SELECT count(1) as count FROM ai_models 
                    WHERE published_at IS NOT NULL AND type = ? AND (LOWER(name) LIKE ? OR LOWER(impact) LIKE ? OR LOWER(purpose) LIKE ?)
        `;
    const [entries, total] = await Promise.all([
      strapi.db.connection.raw(query, [
        type,
        `%${keyword.trim().toLowerCase()}%`,
        `%${keyword.trim().toLowerCase()}%`,
        `%${keyword.trim().toLowerCase()}%`,
        limit,
        (page - 1) * limit,
      ]),
      strapi.db.connection.raw(countQuery, [
        type,
        `%${keyword.trim().toLowerCase()}%`,
        `%${keyword.trim().toLowerCase()}%`,
        `%${keyword.trim().toLowerCase()}%`,
      ]),
    ]);
    return {
      ...createResponse(parseEntries(entries)),
      meta: pagination(parseTotal(total), page, limit),
    };
  },
  async findOneById(ctx) {
    const { id } = ctx.params;
    const query = `SELECT ai.id as id, ai.document_id as document_id, ai.name as name, ai.impact as impact, 
                      ai.purpose as purpose, ai.type as type, ai.logo as logo,
                      f.url as url, f.formats as image,
                      ai.updated_at as updated_at, ai.created_at as created_at, ai.published_at as published_at, 
                      ai.locale as locale 
                    FROM ai_models ai
                    LEFT JOIN files_related_mph fr ON fr.related_id = ai.id AND fr.related_type = 'api::ai-model.ai-model' AND fr.field = 'cover'
                    LEFT JOIN files f ON f.id = fr.file_id 
                    WHERE ai.published_at IS NOT NULL AND ai.id = ?
        `;

    const entry = await strapi.db.connection.raw(query, [+id]);
    return createResponse(parseEntries(entry)[0]);
  },
}));
