"use strict";

const {
    createResponse,
    parseEntries,
    parseTotal,
    pagination,
    convertBase64ToJPG,
} = require("../../../common/util");
const axios = require("axios");
const utils = require("@strapi/utils");
const { HttpStatusCode } = require("axios");
const { NotFoundError } = utils.errors;

/**
 * ai-app service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::ai-app.ai-app", ({ strapi }) => ({
    async generate(ctx) {
        const { document_id } = ctx.params;
        const { url } = ctx.request.body;
        const userId = ctx.state.user.id;
        const apiQuery = `SELECT api.*, ai.id as ai_app_id, ai.document_id as ai_app_document_id 
                        FROM ai_apps ai
                      INNER JOIN ai_apps_ai_app_api_lnk api_lnk ON api_lnk.ai_app_id = ai.id
                      INNER JOIN ai_app_apis api ON api.id = api_lnk.ai_app_api_id AND api.published_at IS NOT NULL 
                      WHERE ai.document_id = ? AND ai.published_at IS NOT NULL
                      `;
        const entries = await strapi.db.connection.raw(apiQuery, [document_id]);
        const entryApi = parseEntries(entries)[0];
        if (!entryApi || !Object.keys(entryApi).length) {
            throw new NotFoundError();
        }
        let data;
        let error;

        try {
            const res = await axios({
                timeout: 15*60*1000, // 2 minutes
                method: entryApi.method,
                url: entryApi.endpoint,
                data: {
                    url
                },
                headers: {
                    // ...form.getHeaders(),
                    [entryApi.token_key.trim()]: entryApi.token_value.trim(),
                },
            });
            if (res.status === HttpStatusCode.Ok) {
                data = res.data;
                let i = 1;
                for (const item of Object.keys(data["tables_image"])) {
                    const files = []
                    let j = 1;
                    for (const file of data["tables_image"][`${item}`]) {
                        const fileName = `${entryApi.ai_app_document_id}${new Date().getTime()}${i}${j}.jpg`;
                        const path = await convertBase64ToJPG(file, fileName);
                        files.push(path)
                        j++;
                    }
                    data["tables_image"][`${item}`] = files;
                    i++;
                }

                await strapi.db.query("api::ai-app-history.ai-app-history").create({
                    data: {
                        result: data,
                        origin_url: url,
                        user: ctx.state.user.id, // user ID
                        ai_app: entryApi.ai_app_id, // ai-app ID
                        published_at: new Date(),
                    },
                });

                await strapi.db
                    .connection("ai_apps")
                    .where({ id: entryApi.ai_app_id })
                    .increment({ total_quantity_used: 1 });

            }
        } catch (err) {
            error = JSON.stringify(err);
            console.log(error)
        }

        if (error) {
            return createResponse({ error }, "Error", 400);
        }

        return createResponse({
            ...data,
        });
    },
    async like(ctx) {
        const { document_id } = ctx.params;
        const { quantity } = ctx.request.body;
        const userId = ctx.state.user.id;
        const aiApp = await strapi.db
            .connection("ai_apps")
            .whereRaw("document_id = :document_id AND published_at IS NOT NULL", {
                document_id,
            })
            .first();

        const [isSuccess, userAIAppEntry] = await Promise.all([
            strapi.db
                .connection("ai_apps")
                .where({ id: aiApp.id })
                .increment({ total_like: quantity }),
            strapi.db
                .query("api::user-ai-app.user-ai-app")
                .findOne({
                    where: {
                        ai_app: aiApp.id, // Check if a bookmark already exists for this ai_app
                        user: userId, // Check for the specific user
                    },
                })
        ])

        if (!userAIAppEntry) {
            await strapi.db
                .query("api::user-ai-app.user-ai-app")
                .create({
                    data: {
                        ai_app: aiApp.id, // Relation to the ai-app document ID
                        user: userId, // Relation to the user document ID
                        is_like: quantity > 0 ? true : false, // Set the default value for is_save field
                        publishedAt: new Date(),
                    },
                });
        } else {
            await strapi.db
                .query("api::user-ai-app.user-ai-app")
                .update({
                    where: {
                        ai_app: aiApp.id,  // Match the record by ai_app ID
                        user: userId       // Match the record by user ID (if this is part of your criteria)
                    },
                    data: {
                        is_like: quantity > 0 ? true : false,  // Setting the is_save_bookmark value
                        publishedAt: new Date(),    // Optional: You can remove if Strapi handles it automatically
                    },
                });
        }

        const entry = await strapi.db
            .connection("ai_apps")
            .whereRaw("document_id = :document_id AND published_at IS NOT NULL", {
                document_id,
            })
            .first();
        return createResponse({
            document_id,
            like: entry.like,
            is_success: isSuccess,
        });
    },
    async saveBookmark(ctx) {
        const { document_id } = ctx.params;
        const { is_save_bookmark } = ctx.request.body;
        const userId = ctx.state.user.id;
        const aiApp = await strapi.db
            .connection("ai_apps")
            .whereRaw("document_id = :document_id AND published_at IS NOT NULL", {
                document_id,
            })
            .first();

        let userAIAppEntry = await strapi.db
            .query("api::user-ai-app.user-ai-app")
            .findOne({
                where: {
                    ai_app: aiApp.id, // Check if a bookmark already exists for this ai_app
                    user: userId, // Check for the specific user
                },
            });
        if (!userAIAppEntry) {
            await strapi.db
                .query("api::user-ai-app.user-ai-app")
                .create({
                    data: {
                        ai_app: aiApp.id, // Relation to the ai-app document ID
                        user: userId, // Relation to the user document ID
                        is_save_bookmark, // Set the default value for is_save field
                        publishedAt: new Date(),
                    },
                });
        } else {
            await strapi.db
                .query("api::user-ai-app.user-ai-app")
                .update({
                    where: {
                        ai_app: aiApp.id,  // Match the record by ai_app ID
                        user: userId       // Match the record by user ID (if this is part of your criteria)
                    },
                    data: {
                        is_save_bookmark,  // Setting the is_save_bookmark value
                        publishedAt: new Date(),    // Optional: You can remove if Strapi handles it automatically
                    },
                });
        }
        return createResponse(null)
    },
    async findAll(ctx) {
        const {
            keyword = "",
            sortField = "created_at",
            sortValue = "DESC",
            categoryDocumentId = "",
            page = 1,
            limit = 10,
            isSaveBookmark
        } = ctx.request.query;
        const userId = ctx.state.user.id;
        let condition_query = '';
        if(+isSaveBookmark === 1) {
            condition_query = ` AND user_ai_app.is_save_bookmark = ${true}`
        }
        if(categoryDocumentId) {
            condition_query += ` AND category.document_id = '${categoryDocumentId}'`
        }

        const query = `
                    WITH user_ai_app AS ( SELECT ai_app_lnk.ai_app_id as ai_app_id, user_ai_apps.is_like as is_like, user_ai_apps.is_save_bookmark as is_save_bookmark
                      FROM user_ai_apps 
                      INNER JOIN user_ai_apps_user_lnk user_lnk ON user_lnk.user_ai_app_id = user_ai_apps.id AND user_lnk.user_id = ${userId}
                      INNER JOIN user_ai_apps_ai_app_lnk ai_app_lnk ON ai_app_lnk.user_ai_app_id = user_ai_apps.id
                    )
                      SELECT ai.id as id, ai.document_id as document_id, ai.name as name, ai.short_desc, ai.scope as scope,
                       ai.po as po, ai.bu as bu, ai.impact as impact, f_image.url as url, f_image.formats as image,
                        ai.total_like as total_like, ai.total_quantity_used as total_quantity_used, f_pdf.url as pdf_url, f_pdf.formats as pdf,
                        user_ai_app.is_like as is_like, user_ai_app.is_save_bookmark as is_save_bookmark,
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
                      LEFT JOIN user_ai_app ON user_ai_app.ai_app_id = ai.id
                      WHERE ai.published_at IS NOT NULL AND (LOWER(ai.name) LIKE ? OR LOWER(ai.bu) LIKE ? OR LOWER(ai.scope) LIKE ?)
                      ${condition_query}
                      ORDER BY ai.${sortField} ${sortValue}
                      LIMIT ? OFFSET ?
          `;
        const countQuery = `SELECT count(1) as count
                      FROM ai_apps ai
                      INNER JOIN ai_apps_ai_app_api_lnk api_lnk ON api_lnk.ai_app_id = ai.id
                      INNER JOIN ai_app_apis api ON api.id = api_lnk.ai_app_api_id AND api.published_at IS NOT NULL
                      INNER JOIN ai_apps_ai_app_category_lnk category_lnk ON category_lnk.ai_app_id = ai.id
                      INNER JOIN ai_app_categories category ON category.id = category_lnk.ai_app_category_id AND category.published_at IS NOT NULL
                      WHERE ai.published_at IS NOT NULL AND (LOWER(ai.name) LIKE ? OR LOWER(ai.bu) LIKE ? OR LOWER(ai.scope) LIKE ?)
                      ${categoryDocumentId
                ? ` AND category.document_id = '${categoryDocumentId}'`
                : ""
            }
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
        const userId = ctx.state.user.id;
        const query = `WITH user_ai_app AS ( SELECT ai_app_lnk.ai_app_id as ai_app_id, user_ai_apps.is_like as is_like, user_ai_apps.is_save_bookmark as is_save_bookmark
                      FROM user_ai_apps 
                      INNER JOIN user_ai_apps_user_lnk user_lnk ON user_lnk.user_ai_app_id = user_ai_apps.id AND user_lnk.user_id = ${userId}
                      INNER JOIN user_ai_apps_ai_app_lnk ai_app_lnk ON ai_app_lnk.user_ai_app_id = user_ai_apps.id
                    )
                      SELECT ai.id as id, ai.document_id as document_id, ai.name as name, ai.short_desc, ai.scope as scope,
                       ai.po as po, ai.bu as bu, ai.impact as impact, f_image.url as url, f_image.formats as image,
                        ai.total_like as total_like, ai.total_quantity_used as total_quantity_used, f_pdf.url as pdf_url, f_pdf.formats as pdf,
                        user_ai_app.is_like as is_like, user_ai_app.is_save_bookmark as is_save_bookmark,
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
                      LEFT JOIN user_ai_app ON user_ai_app.ai_app_id = ai.id
                      WHERE ai.published_at IS NOT NULL AND ai.document_id = ?
          `;

        const entries = await strapi.db.connection.raw(query, [document_id]);

        return {
            ...createResponse(parseEntries(entries)[0]),
        };
    }
}));
