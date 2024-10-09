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
      const { ai_model_document_id } = ctx.params;
      const entryAIModel =  await strapi.db
      .connection("ai_models")
      .whereRaw("document_id = :ai_model_document_id AND published_at IS NOT NULL", {
        ai_model_document_id,
      })
      .first();
      const aiModelId = entryAIModel.id;
      const query = `SELECT p.id as id, p.document_id as document_id, p.name as name, p.scope as scope,
                     p.po as po, f_pdf.url as pdf_url, f_pdf.formats as pdf,
                     p.html_url as html_url, p.bu as bu, p.prosensity_status as prosensity_status,
                     p.impact as impact, f_icon.url as url, f_icon.formats as icon,
                    p.updated_at as updated_at, p.created_at as created_at, p.published_at as published_at, 
                    p.locale as locale 
                    FROM ai_propensity_models p
                    INNER JOIN ai_propensity_models_ai_models_lnk lnk ON lnk.ai_propensity_model_id = p.id AND lnk.ai_model_id = ?
                    LEFT JOIN files_related_mph fr_icon ON fr_icon.related_id = p.id AND fr_icon.related_type = 'api::ai-propensity-model.ai-propensity-model' AND fr_icon.field = 'icon'
                    LEFT JOIN files_related_mph fr_pdf ON fr_pdf.related_id = p.id AND fr_pdf.related_type = 'api::ai-propensity-model.ai-propensity-model' AND fr_pdf.field = 'pdf'
                    LEFT JOIN files f_icon ON f_icon.id = fr_icon.file_id 
                    LEFT JOIN files f_pdf ON f_pdf.id = fr_pdf.file_id 
                    WHERE p.published_at IS NOT NULL AND (LOWER(p.name) LIKE ? OR LOWER(p.bu) LIKE ? OR LOWER(p.scope) LIKE ?)
                    ORDER BY ${sortField} ${sortValue}
                    LIMIT ? OFFSET ?
        `;
      const countQuery = `SELECT count(1) as count
                            FROM ai_propensity_models p
                        INNER JOIN ai_propensity_models_ai_models_lnk lnk ON lnk.ai_propensity_model_id = p.id AND lnk.ai_model_id = ?
                        WHERE p.published_at IS NOT NULL AND (LOWER(p.name) LIKE ? OR LOWER(p.bu) LIKE ? OR LOWER(p.scope) LIKE ?)
        `;
      const [entries, total] = await Promise.all([
        strapi.db.connection.raw(query, [
          aiModelId,
          `%${keyword.trim().toLowerCase()}%`,
          `%${keyword.trim().toLowerCase()}%`,
          `%${keyword.trim().toLowerCase()}%`,
          limit,
          (page - 1) * limit,
        ]),
        strapi.db.connection.raw(countQuery, [
          aiModelId,
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
      const { document_id } = ctx.params;
      const entryAIPropensityModel =  await strapi.db
      .connection("ai_propensity_models")
      .whereRaw("document_id = :document_id AND published_at IS NOT NULL", {
        document_id,
      })
      .first();
      const query = `SELECT p.id as id, p.document_id as document_id, p.name as name, p.scope as scope,
                     p.po as po, f_pdf.url as pdf_url, f_pdf.formats as pdf,
                     p.html_url as html_url, p.bu as bu, p.prosensity_status as prosensity_status,
                     p.impact as impact, f_icon.url as url, f_icon.formats as icon,
                    p.updated_at as updated_at, p.created_at as created_at, p.published_at as published_at, 
                    p.locale as locale 
                    FROM ai_propensity_models p
                    INNER JOIN ai_propensity_models_ai_models_lnk lnk ON lnk.ai_propensity_model_id = p.id
                    LEFT JOIN files_related_mph fr_icon ON fr_icon.related_id = p.id AND fr_icon.related_type = 'api::ai-propensity-model.ai-propensity-model' AND fr_icon.field = 'icon'
                    LEFT JOIN files_related_mph fr_pdf ON fr_pdf.related_id = p.id AND fr_pdf.related_type = 'api::ai-propensity-model.ai-propensity-model' AND fr_pdf.field = 'pdf'
                    LEFT JOIN files f_icon ON f_icon.id = fr_icon.file_id 
                    LEFT JOIN files f_pdf ON f_pdf.id = fr_pdf.file_id 
                    WHERE p.id = ?
        `;

      const entries = await strapi.db.connection.raw(query, [entryAIPropensityModel.id]);

      return {
        ...createResponse(parseEntries(entries)[0]),
      };
    },
  })
);
