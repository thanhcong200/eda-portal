"use strict";

const {
  createResponse,
  pagination,
  parseTotal,
  parseEntries,
} = require("../../../common/util");

/**
 * ai-propensity-model service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::ai-propensity-model.ai-propensity-model",
  ({ strapi }) => ({
    async findAll(ctx) {
      const {
        keyword = "",
        sortField = "created_at",
        sortValue = "DESC",
        page = 1,
        limit = 10,
      } = ctx.request.query;
      const { aiModelId } = ctx.params;
      const query = `SELECT p.id as id, p.document_id as document_id, p.name as name, p.scope as scope,
                     p.pdf_url as pdf_url, p.po as po, p.ai_app_url as ai_app_url,
                     p.image as image, p.html_url as html_url, p.client as client, p.prosensity_status as prosensity_status,
                     p.impact as impact, f.url as url, f.formats as icon,
                    p.updated_at as updated_at, p.created_at as created_at, p.published_at as published_at, 
                    p.locale as locale 
                    FROM ai_propensity_models p
                    INNER JOIN ai_propensity_models_ai_models_lnk lnk ON lnk.ai_propensity_model_id = p.id AND lnk.ai_model_id = ?
                    LEFT JOIN files_related_mph fr ON fr.related_id = p.id AND fr.related_type = 'api::ai-propensity-model.ai-propensity-model' AND fr.field = 'icon'
                    LEFT JOIN files f ON f.id = fr.file_id 
                    WHERE p.published_at IS NOT NULL AND (LOWER(p.name) LIKE ? OR LOWER(p.client) LIKE ? OR LOWER(p.scope) LIKE ?)
                    ORDER BY ${sortField} ${sortValue}
                    LIMIT ? OFFSET ?
        `;
      const countQuery = `SELECT count(1) as count
                            FROM ai_propensity_models p
                        INNER JOIN ai_propensity_models_ai_models_lnk lnk ON lnk.ai_propensity_model_id = p.id AND lnk.ai_model_id = ?
                        WHERE p.published_at IS NOT NULL AND (LOWER(p.name) LIKE ? OR LOWER(p.client) LIKE ? OR LOWER(p.scope) LIKE ?)
        `;
      const [entries, total] = await Promise.all([
        strapi.db.connection.raw(query, [
          +aiModelId,
          `%${keyword.toLowerCase()}%`,
          `%${keyword.toLowerCase()}%`,
          `%${keyword.toLowerCase()}%`,
          limit,
          (page - 1) * limit,
        ]),
        strapi.db.connection.raw(countQuery, [
          +aiModelId,
          `%${keyword.toLowerCase()}%`,
          `%${keyword.toLowerCase()}%`,
          `%${keyword.toLowerCase()}%`,
        ]),
      ]);

      return {
        ...createResponse(parseEntries(entries)),
        meta: pagination(parseTotal(total), page, limit),
      };
    },
    async findOneById(ctx) {
      const { id } = ctx.params;
      const query = `SELECT p.id as id, p.document_id as document_id, p.name as name, p.scope as scope,
                     p.pdf_url as pdf_url, p.po as po, p.ai_app_url as ai_app_url,
                     p.image as image, p.html_url as html_url, p.client as client, p.prosensity_status as prosensity_status,
                     p.impact as impact, f.url as url, f.formats as icon,
                    p.updated_at as updated_at, p.created_at as created_at, p.published_at as published_at, 
                    p.locale as locale 
                    FROM ai_propensity_models p
                    INNER JOIN ai_propensity_models_ai_models_lnk lnk ON lnk.ai_propensity_model_id = p.id
                    LEFT JOIN files_related_mph fr ON fr.related_id = p.id AND fr.related_type = 'api::ai-propensity-model.ai-propensity-model' AND fr.field = 'icon'
                    LEFT JOIN files f ON f.id = fr.file_id 
                    WHERE p.id = ?
        `;

      const entries = await strapi.db.connection.raw(query, [+id]);

      return {
        ...createResponse(parseEntries(entries)[0]),
      };
    },
  })
);
