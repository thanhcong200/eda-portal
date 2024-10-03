'use strict';

const { createResponse, parseEntries, parseTotal, pagination, dayjs, convertRGBToPng } = require('../../../common/util');
const fs = require("fs");
const axios = require('axios');
const FormData = require('form-data');
const utils = require("@strapi/utils");
const { HttpStatusCode } = require('axios');
const { NotFoundError } = utils.errors;


/**
 * ai-app service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::ai-app.ai-app', ({ strapi }) => ({
    async generate(ctx) {
        const { document_id } = ctx.params;
        const { url } = ctx.request.body;
        const apiQuery = `SELECT api.*, ai.id as ai_app_id, ai.document_id as ai_app_document_id FROM ai_apps ai
                      INNER JOIN ai_apps_ai_app_api_lnk api_lnk ON api_lnk.ai_app_id = ai.id
                      INNER JOIN ai_app_apis api ON api.id = api_lnk.ai_app_api_id AND api.published_at IS NOT NULL 
                      WHERE ai.document_id = ? AND ai.published_at IS NOT NULL
                      `
        const entries = await strapi.db.connection.raw(apiQuery, [document_id]);
        const entryApi = parseEntries(entries)[0];
        if (!entryApi || !Object.keys(entryApi).length) {
            throw new NotFoundError();
        }
        const form = new FormData();
        form.append('file', fs.createReadStream('public' + url));
        let data;
        let error;
        try {
            const res = await axios({
                method: entryApi.method,
                url: entryApi.endpoint,
                data: form,
                headers: {
                    ...form.getHeaders(),
                    [entryApi.token_key]: entryApi.token_value
                }
            });
            if (res.status === HttpStatusCode.Ok) {
                data = res.data;
                const filePaths = [];
                let i = 1;
                for(const item of Object.keys(data['tables_image'])) {
                    const fileName = `${entryApi.ai_app_document_id}${dayjs().get('millisecond')}${i}`;
                    const path = await convertRGBToPng(data['tables_image'][`${item}`][0], fileName);
                    filePaths.push(path);
                    i++;
                }
                console.log(ctx.state.user.id, entryApi.ai_app_id)
                data['tables_image'] = filePaths;
                await strapi.db.query('api::ai-app-history.ai-app-history').create({
                    data: {
                        result: data,
                        file_url: url,
                        user: ctx.state.user.id, // user ID
                        ai_app: entryApi.ai_app_id, // ai-app ID
                        published_at: new Date()
                    },
                });
            }

        } catch (err) {
            error = JSON.stringify(err)
        }

        if (error) {
            return createResponse({ error }, "Error", 400)
        }

        return createResponse({
            ...data
        })
    },
    async findAll(ctx) {
        const {
            keyword = "",
            sortField = "created_at",
            sortValue = "DESC",
            categoryDocumentId = "",
            page = 1,
            limit = 10,
        } = ctx.request.query;

        const query = `SELECT ai.id as id, ai.document_id as document_id, ai.name as name, ai.short_desc, ai.scope as scope,
                       ai.po as po, ai.bu as bu, ai.impact as impact, f_image.url as url, f_image.formats as image,
                        f_pdf.url as pdf_url, f_pdf.formats as pdf,
                      ai.updated_at as updated_at, ai.created_at as created_at, ai.published_at as published_at, 
                      ai.locale as locale 
                      FROM ai_apps ai
                      INNER JOIN ai_apps_ai_app_api_lnk api_lnk ON api_lnk.ai_app_id = ai.id
                      INNER JOIN ai_app_apis api ON api.id = api_lnk.ai_app_api_id AND api.published_at IS NOT NULL
                      INNER JOIN ai_apps_ai_app_category_lnk category_lnk ON category_lnk.ai_app_id = ai.id
                      INNER JOIN ai_app_categories category ON category.id = category_lnk.ai_app_category_id AND category.published_at IS NOT NULL
                      LEFT JOIN files_related_mph fr_image ON fr_image.related_id = ai.id AND fr_image.related_type = 'api::ai-app.ai-app' AND fr_image.field = 'image'
                      LEFT JOIN files_related_mph fr_pdf ON fr_pdf.related_id = ai.id AND fr_pdf.related_type = 'api::ai-app.ai-app' AND fr_pdf.field = 'pdf'
                      LEFT JOIN files f_image ON f_image.id = fr_image.file_id 
                      LEFT JOIN files f_pdf ON f_pdf.id = fr_pdf.file_id 
                      WHERE ai.published_at IS NOT NULL AND (LOWER(ai.name) LIKE ? OR LOWER(ai.bu) LIKE ? OR LOWER(ai.scope) LIKE ?)
                      ${categoryDocumentId ? ` AND category.document_id = '${categoryDocumentId}'` : ''}
                      ORDER BY ${sortField} ${sortValue}
                      LIMIT ? OFFSET ?
          `;
        const countQuery = `SELECT count(1) as count
                      FROM ai_apps ai
                      INNER JOIN ai_apps_ai_app_api_lnk api_lnk ON api_lnk.ai_app_id = ai.id
                      INNER JOIN ai_app_apis api ON api.id = api_lnk.ai_app_api_id AND api.published_at IS NOT NULL
                      INNER JOIN ai_apps_ai_app_category_lnk category_lnk ON category_lnk.ai_app_id = ai.id
                      INNER JOIN ai_app_categories category ON category.id = category_lnk.ai_app_category_id AND category.published_at IS NOT NULL
                      WHERE ai.published_at IS NOT NULL AND (LOWER(ai.name) LIKE ? OR LOWER(ai.bu) LIKE ? OR LOWER(ai.scope) LIKE ?)
                      ${categoryDocumentId ? ` AND category.document_id = '${categoryDocumentId}'` : ''}
          `;
        const [entries, total] = await Promise.all([
            strapi.db.connection.raw(query, [
                `%${keyword.trim().toLowerCase()}%`,
                `%${keyword.trim().toLowerCase()}%`,
                `%${keyword.trim().toLowerCase()}%`,
                limit,
                (page - 1) * limit,
            ]),

            strapi.db.connection.raw(countQuery, [
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
        const query = `SELECT ai.id as id, ai.document_id as document_id, ai.name as name, ai.short_desc, ai.scope as scope,
                       ai.po as po, ai.bu as bu, ai.impact as impact, f_image.url as url, f_image.formats as image,
                        f_pdf.url as pdf_url, f_pdf.formats as pdf,
                      ai.updated_at as updated_at, ai.created_at as created_at, ai.published_at as published_at, 
                      ai.locale as locale 
                      FROM ai_apps ai
                      INNER JOIN ai_apps_ai_app_api_lnk api_lnk ON api_lnk.ai_app_id = ai.id
                      INNER JOIN ai_app_apis api ON api.id = api_lnk.ai_app_api_id AND api.published_at IS NOT NULL
                      INNER JOIN ai_apps_ai_app_category_lnk category_lnk ON category_lnk.ai_app_id = ai.id
                      INNER JOIN ai_app_categories category ON category.id = category_lnk.ai_app_category_id AND category.published_at IS NOT NULL
                      LEFT JOIN files_related_mph fr_image ON fr_image.related_id = ai.id AND fr_image.related_type = 'api::ai-app.ai-app' AND fr_image.field = 'image'
                      LEFT JOIN files_related_mph fr_pdf ON fr_pdf.related_id = ai.id AND fr_pdf.related_type = 'api::ai-app.ai-app' AND fr_pdf.field = 'pdf'
                      LEFT JOIN files f_image ON f_image.id = fr_image.file_id 
                      LEFT JOIN files f_pdf ON f_pdf.id = fr_pdf.file_id 
                      WHERE ai.published_at IS NOT NULL AND ai.document_id = ?
          `;

        const entries = await strapi.db.connection.raw(query, [document_id]);

        return {
            ...createResponse(parseEntries(entries)[0]),
        };
    },
}));
