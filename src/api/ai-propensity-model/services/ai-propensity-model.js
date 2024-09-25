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
                     p.impact as impact,
                    p.updated_at as updated_at, p.created_at as created_at, p.published_at as published_at, 
                    p.locale as locale 
                    FROM ai_propensity_models p
                    INNER JOIN ai_propensity_models_ai_model_lnk lnk ON lnk.ai_propensity_model_id = p.id AND lnk.ai_model_id = ${+aiModelId}
                    WHERE p.published_At IS NOT NULL
                    ORDER BY ${sortField} ${sortValue}
                    LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
      const countQuery = `SELECT count(1) 
                            FROM ai_propensity_models p
                        INNER JOIN ai_propensity_models_ai_model_lnk lnk ON lnk.ai_propensity_model_id = p.id AND lnk.ai_model_id = ${2}
                        WHERE p.published_At IS NOT NULL
        `;
      const [entries, total] = await Promise.all([
        strapi.db.connection.raw(query),
        strapi.db.connection.raw(countQuery),
      ]);

      return {
        ...createResponse(...parseEntries(entries)),
        meta: pagination(parseTotal(total), page, limit),
      };
    },
  })
);
