"use strict";

const { createResponse, parseEntries } = require("../../../common/util");

/**
 * winnovate-bu service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::winnovate-bu.winnovate-bu",
  ({ strapi }) => ({
    async findAll(ctx) {
      const {
        keyword = "",
        sortField = "created_at",
        sortValue = "DESC",
      } = ctx.request.query;
      const query = `SELECT id, document_id, name FROM winnovate_bus
                        WHERE published_at IS NOT NULL AND LOWER(name) LIKE ?
                        ORDER BY ${sortField} ${sortValue}
        `;
      const entries = await strapi.db.connection.raw(query, [
        `%${keyword.trim().toLowerCase()}%`,
      ]);
      return createResponse(parseEntries(entries));
    },
    async findOneById(ctx) {
      const { document_id } = ctx.params;
      const query = `SELECT id, document_id, name FROM winnovate_bus
                        WHERE published_at IS NOT NULL AND document_id = ?
        `;
      const entries = await strapi.db.connection.raw(query, [document_id]);
      return {
        ...createResponse(parseEntries(entries)[0]),
      };
    },
  })
);
