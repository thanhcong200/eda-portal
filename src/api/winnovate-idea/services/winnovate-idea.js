"use strict";

const { createResponse, parseEntries, pagination, parseTotal } = require("../../../common/util");

/**
 * winnovate-idea service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::winnovate-idea.winnovate-idea",
  ({ strapi }) => ({
    async findAll(ctx) {
      const {
        keyword = "",
        groupDocumentId = "",
        topicDocumentId = "",
        buDocumentId = "",
        isSaveBookmark = '',
        sortField = "created_at",
        sortValue = "DESC",
        page = 1,
        limit = 10,
      } = ctx.request.query;
      const userId = ctx.state.user.id;
      const query = `WITH idea_ids AS (
                        SELECT DISTINCT(idea.id) as id FROM winnovate_ideas idea
                        INNER JOIN winnovate_ideas_topic_lnk topic_lnk ON topic_lnk.winnovate_idea_id = idea.id
                        INNER JOIN winnovate_topics topic ON topic.id = topic_lnk.winnovate_topic_id AND topic.published_at IS NOT NULL 
                          ${topicDocumentId ? ` AND topic.document_id = '${topicDocumentId}' `: ""}
                        INNER JOIN winnovate_topics_groups_lnk group_lnk ON group_lnk.winnovate_topic_id = topic.id
                        INNER JOIN winnovate_groups groups  ON groups.id = group_lnk.winnovate_group_id AND groups.published_at IS NOT NULL 
                          ${groupDocumentId? ` AND groups.document_id = '${groupDocumentId}' `: ""}
                        INNER JOIN winnovate_ideas_bu_lnk bu_lnk ON bu_lnk.winnovate_idea_id = idea.id
                        INNER JOIN winnovate_bus bu ON bu.id = bu_lnk.winnovate_bu_id  AND bu.published_at IS NOT NULL 
                          ${buDocumentId ? ` AND bu.document_id = '${buDocumentId}' `: ""}
                        WHERE idea.published_at IS NOT NULL
                      ),
                      idea_bookmark AS (
                        SELECT idea_lnk.winnovate_idea_id as idea_id, bookmark.is_save as is_save 
                        FROM winnovate_idea_bookmarks bookmark 
                        INNER JOIN winnovate_idea_bookmarks_idea_lnk idea_lnk ON idea_lnk.winnovate_idea_bookmark_id = bookmark.id
                        INNER JOIN winnovate_idea_bookmarks_user_lnk user_lnk ON user_lnk.winnovate_idea_bookmark_id = idea_lnk.winnovate_idea_bookmark_id AND user_lnk.user_id = ${userId}
                        WHERE bookmark.published_at IS NOT NULL
                      )
                      SELECT idea.*, idea_bookmark.is_save as is_save_bookmark, topic.name as topic, bu.name as bu
                      FROM winnovate_ideas idea
                      LEFT JOIN idea_bookmark ON idea_bookmark.idea_id = idea.id
                      LEFT JOIN winnovate_ideas_topic_lnk topic_lnk ON topic_lnk.winnovate_idea_id = idea.id
                      LEFT JOIN winnovate_topics topic ON topic.id = topic_lnk.winnovate_topic_id AND topic.published_at IS NOT NULL
                      LEFT JOIN winnovate_ideas_bu_lnk bu_lnk ON bu_lnk.winnovate_idea_id = idea.id
                      LEFT JOIN winnovate_bus bu ON bu.id = bu_lnk.winnovate_bu_id AND bu.published_at IS NOT NULL
                      WHERE idea.id IN (SELECT id FROM idea_ids) AND LOWER(idea.name) LIKE ? ${isSaveBookmark == '1' ? ` AND idea_bookmark.is_save = ${true}` : ""}
                      ORDER BY idea.priority ASC, idea.score DESC, idea.${sortField} ${sortValue}
                      LIMIT ? OFFSET ?

      `;
      const countQuery  = `WITH idea_ids AS (
                            SELECT DISTINCT(idea.id) as id FROM winnovate_ideas idea
                            INNER JOIN winnovate_ideas_topic_lnk topic_lnk ON topic_lnk.winnovate_idea_id = idea.id
                            INNER JOIN winnovate_topics topic ON topic.id = topic_lnk.winnovate_topic_id AND topic.published_at IS NOT NULL 
                              ${topicDocumentId ? ` AND topic.document_id = '${topicDocumentId}' `: ""}
                            INNER JOIN winnovate_topics_groups_lnk group_lnk ON group_lnk.winnovate_topic_id = topic.id
                            INNER JOIN winnovate_groups groups  ON groups.id = group_lnk.winnovate_group_id AND groups.published_at IS NOT NULL 
                              ${groupDocumentId? ` AND groups.document_id = '${groupDocumentId}' `: ""}
                            INNER JOIN winnovate_ideas_bu_lnk bu_lnk ON bu_lnk.winnovate_idea_id = idea.id
                            INNER JOIN winnovate_bus bu ON bu.id = bu_lnk.winnovate_bu_id  AND bu.published_at IS NOT NULL 
                              ${buDocumentId ? ` AND bu.document_id = '${buDocumentId}' `: ""}
                            WHERE idea.published_at IS NOT NULL
                          ),
                          idea_bookmark AS (
                            SELECT idea_lnk.winnovate_idea_id as idea_id, bookmark.is_save as is_save 
                            FROM winnovate_idea_bookmarks bookmark 
                            INNER JOIN winnovate_idea_bookmarks_idea_lnk idea_lnk ON idea_lnk.winnovate_idea_bookmark_id = bookmark.id
                            INNER JOIN winnovate_idea_bookmarks_user_lnk user_lnk ON user_lnk.winnovate_idea_bookmark_id = idea_lnk.winnovate_idea_bookmark_id AND user_lnk.user_id = ${userId}
                            WHERE bookmark.published_at IS NOT NULL
                          )
                          SELECT COUNT(1) AS count
                          FROM winnovate_ideas idea
                          LEFT JOIN idea_bookmark ON idea_bookmark.idea_id = idea.id
                          WHERE idea.id IN (SELECT id FROM idea_ids) AND LOWER(idea.name) LIKE ? ${isSaveBookmark == '1' ? ` AND idea_bookmark.is_save = ${true}` : ""}
                    `;
      const [entries, total] = await Promise.all([
        strapi.db.connection.raw(query, [`%${keyword.trim().toLowerCase()}%`, limit, (page-1)*limit]),
        strapi.db.connection.raw(countQuery, [`%${keyword.trim().toLowerCase()}%`])
      ]);
      return {
        ...createResponse(parseEntries(entries)),
        meta: pagination(parseTotal(total), page, limit),
    };
    },
    async findGroup(ctx) {
      const query = `
        SELECT id, document_id, name FROM winnovate_groups
        WHERE published_at IS NOT NULL
        `;
      const entries = await strapi.db.connection.raw(query);
      return createResponse(parseEntries(entries));
    },
    async findBU(ctx) {
      const query = `
        SELECT id, document_id, name FROM winnovate_bus
        WHERE published_at IS NOT NULL
        `;
      const entries = await strapi.db.connection.raw(query);
      return createResponse(parseEntries(entries));
    },
    async findTopic(ctx) {
      const { groupDocumentId = "" } = ctx.request.query;
      const query = `
        SELECT topic.id AS id, topic.document_id AS document_id, topic.name as name 
        FROM winnovate_topics topic
        INNER JOIN winnovate_topics_groups_lnk group_lnk ON group_lnk.winnovate_topic_id = topic.id
        INNER JOIN winnovate_groups groups ON groups.id = group_lnk.winnovate_group_id 
                AND groups.published_at IS NOT NULL ${
                  groupDocumentId
                    ? `AND groups.document_id = '${groupDocumentId}' `
                    : ""
                }
        WHERE topic.published_at IS NOT NULL
        GROUP BY topic.id, topic.document_id, topic.name
        `;
      const entries = await strapi.db.connection.raw(query);
      return createResponse(parseEntries(entries));
    },
    async findOneById(ctx) {
      const { document_id } = ctx.params;
      const query = `SELECT * FROM winnovate_ideas 
                    WHERE document_id = ? AND published_at IS NOT NULL 
      `
      const entries = await strapi.db.connection.raw(query, [document_id]);
      return createResponse(parseEntries(entries)[0])
    },
    async saveBookmark(ctx) {
      const userId = ctx.state.user.id;
      const { document_id } = ctx.params;
      const { is_save_bookmark } = ctx.request.body;
      const entry = await strapi.db.connection.raw(
        `SELECT * FROM winnovate_ideas WHERE document_id = ? AND published_at IS NOT NULL`,
        [document_id]
      );
      const idea = parseEntries(entry)[0];
      if (!is_save_bookmark) {
        await Promise.all([
          strapi.db
            .query("api::winnovate-idea-bookmark.winnovate-idea-bookmark")
            .delete({
              where: {
                idea: idea.id,
                user: userId,
                published_at: { $ne: null },
              },
            }),
          strapi.db
            .query("api::winnovate-idea-bookmark.winnovate-idea-bookmark")
            .delete({
              where: {
                idea: idea.id,
                user: userId,
                published_at: { $eq: null },
              },
            }),
        ]);

        return createResponse({ isSuccess: 1 });
      }
      let bookmark = await strapi.db
        .query("api::winnovate-idea-bookmark.winnovate-idea-bookmark")
        .findOne({
          where: {
            idea: idea.id,
            user: userId,
          },
        });

      if (!bookmark) {
        bookmark = await strapi.entityService.create(
          "api::winnovate-idea-bookmark.winnovate-idea-bookmark",
          {
            data: {
              idea: idea.id,
              user: userId,
            },
          }
        );
      }

      return createResponse({ isSuccess: 1 });
    },
  })
);
