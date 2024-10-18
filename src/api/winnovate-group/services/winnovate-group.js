"use strict";

const { createResponse, parseEntries } = require("../../../common/util");

/**
 * winnovate-group service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::winnovate-group.winnovate-group",
  ({ strapi }) => ({
    async findAll(ctx) {
      const {
        keyword = "",
        sortField = "created_at",
        sortValue = "DESC",
      } = ctx.request.query;
      const query = ` WITH idea AS (
                            SELECT groups.id as group_id, COUNT(idea.id) as total_idea
                            FROM winnovate_groups groups
                            INNER JOIN winnovate_topics_groups_lnk topic_lnk ON topic_lnk.winnovate_group_id = groups.id
                            INNER JOIN winnovate_topics topic ON topic.id = topic_lnk.winnovate_topic_id AND topic.published_at IS NOT NULL
                            INNER JOIN winnovate_ideas_topic_lnk idea_lnk ON idea_lnk.winnovate_topic_id = topic.id
                            INNER JOIN winnovate_ideas idea ON idea.id = idea_lnk.winnovate_idea_id AND idea.published_at IS NOT NULL
                            WHERE groups.published_at IS NOT NULL
                            GROUP BY groups.id
                        )
                        SELECT groups.id as id, groups.document_id as document_id, groups.name as name, groups.color as color,
                            f.url as url, f.formats as image, CAST(idea.total_idea AS INT) as total_idea
                        FROM winnovate_groups groups
                        LEFT JOIN idea ON idea.group_id = groups.id
                        LEFT JOIN files_related_mph fr ON fr.related_id = groups.id AND fr.related_type = 'api::winnovate-group.winnovate-group' AND fr.field = 'icon'
                        LEFT JOIN files f ON f.id = fr.file_id 
                        WHERE groups.published_at IS NOT NULL AND LOWER(groups.name) LIKE ?
                        ORDER BY groups.${sortField} ${sortValue}
          `;
      const countIdeaQuery = `SELECT COUNT(1) as count FROM winnovate_ideas WHERE published_at IS NOT NULL`;
      const [entries, totalIdea] = await Promise.all([
        strapi.db.connection.raw(query, [`%${keyword.trim().toLowerCase()}%`]),
        strapi.db.connection.raw(countIdeaQuery),
      ]);
      const count = +parseEntries(totalIdea)[0].count;
      return createResponse([
        {
          id: null,
          document_id: null,
          name: "All",
          color: "#FF6A00",
          url: "",
          total_idea: count,
        },
        ...parseEntries(entries),
      ]);
    },
    async findOneById(ctx) {
      const { document_id } = ctx.params;
      const query = `WITH idea AS (
                            SELECT groups.id as group_id, COUNT(idea.id) as total_idea
                            FROM winnovate_groups groups
                            INNER JOIN winnovate_topics_groups_lnk topic_lnk ON topic_lnk.winnovate_group_id = groups.id
                            INNER JOIN winnovate_topics topic ON topic.id = topic_lnk.winnovate_topic_id AND topic.published_at IS NOT NULL
                            INNER JOIN winnovate_ideas_topic_lnk idea_lnk ON idea_lnk.winnovate_topic_id = topic.id
                            INNER JOIN winnovate_ideas idea ON idea.id = idea_lnk.winnovate_idea_id AND idea.published_at IS NOT NULL
                            WHERE groups.published_at IS NOT NULL
                            GROUP BY groups.id
                        )
                        SELECT groups.id as id, groups.document_id as document_id, groups.name as name, groups.color as color,
                            f.url as url, f.formats as image, CAST(idea.total_idea AS INT) as total_idea
                        FROM winnovate_groups groups
                        LEFT JOIN idea ON idea.group_id = groups.id
                        LEFT JOIN files_related_mph fr ON fr.related_id = groups.id AND fr.related_type = 'api::winnovate-group.winnovate-group' AND fr.field = 'icon'
                        LEFT JOIN files f ON f.id = fr.file_id 
                        WHERE groups.published_at IS NOT NULL AND groups.document_id = ?
          `;
      const entries = await strapi.db.connection.raw(query, [document_id]);
      return {
        ...createResponse(parseEntries(entries)[0]),
      };
    },
  })
);
