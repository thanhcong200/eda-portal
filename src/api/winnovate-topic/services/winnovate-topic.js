"use strict";

const { createResponse, parseEntries } = require("../../../common/util");

/**
 * winnovate-topic service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::winnovate-topic.winnovate-topic",
  ({ strapi }) => ({
    async findAll(ctx) {
      const {
        keyword = "",
        groupDocumentId = "",
        sortField = "created_at",
        sortValue = "DESC",
      } = ctx.request.query;
      const totalIdea = await this.getTotalIdeaByGroupDocumentId(groupDocumentId);

      const query = `WITH topic_ids AS (
                          SELECT t.id as id FROM winnovate_topics t
                          INNER JOIN winnovate_topics_groups_lnk group_lnk ON group_lnk.winnovate_topic_id = t.id
                          INNER JOIN winnovate_groups groups ON groups.id = group_lnk.winnovate_group_id 
                                    AND groups.published_at IS NOT NULL ${groupDocumentId ? `AND groups.document_id = '${groupDocumentId}' ` : ""}
                          WHERE t.published_at IS NOT NULL
	                        GROUP BY t.id
                        ),
                        idea AS (
                            SELECT topic.id as topic_id, COUNT(idea.id) as total_idea
                            FROM winnovate_groups groups
                            INNER JOIN winnovate_topics_groups_lnk topic_lnk ON topic_lnk.winnovate_group_id = groups.id
                            INNER JOIN winnovate_topics topic ON topic.id = topic_lnk.winnovate_topic_id AND topic.published_at IS NOT NULL
                            INNER JOIN winnovate_ideas_topic_lnk idea_lnk ON idea_lnk.winnovate_topic_id = topic.id
                            INNER JOIN winnovate_ideas idea ON idea.id = idea_lnk.winnovate_idea_id AND idea.published_at IS NOT NULL
                            WHERE groups.published_at IS NOT NULL ${groupDocumentId ? `AND groups.document_id = '${groupDocumentId}' ` : ""}
                            GROUP BY topic.id
                        )
                    SELECT topic.id as id, topic.document_id as document_id, topic.name as name, topic.color as color,
                      CAST(idea.total_idea AS INT) as total_idea, 
                      ROUND(CAST(idea.total_idea AS INT)*100.0/${totalIdea}, 2) AS idea_pct
                    FROM winnovate_topics topic
                    INNER JOIN topic_ids ON topic_ids.id = topic.id 
                    LEFT JOIN idea ON idea.topic_id = topic.id
                    WHERE topic.published_at IS NOT NULL AND LOWER(topic.name) LIKE ?
                    ORDER BY ${sortField} ${sortValue}
          `;

      const entries = await strapi.db.connection.raw(query, [
        `%${keyword.trim().toLowerCase()}%`,
      ]);
      return createResponse(parseEntries(entries));
    },
    async findOneById(ctx) {
      const { document_id } = ctx.params;
      const query = `
                    SELECT topic.id as id, topic.document_id as document_id, topic.name as name, topic.color as color
                    FROM winnovate_topics topic
                    WHERE topic.published_at IS NOT NULL AND topic.document_id = ?
          `;
      const entries = await strapi.db.connection.raw(query, [document_id]);
      return {
        ...createResponse(parseEntries(entries)[0]),
      };
    },
    async getTotalIdeaByGroupDocumentId(groupDocumentId) {
      const countIdeaEntries = await strapi.db.connection.raw(
        `
        SELECT COUNT(idea.id) as count
        FROM winnovate_groups groups
        INNER JOIN winnovate_topics_groups_lnk topic_lnk ON topic_lnk.winnovate_group_id = groups.id
        INNER JOIN winnovate_topics topic ON topic.id = topic_lnk.winnovate_topic_id AND topic.published_at IS NOT NULL
        INNER JOIN winnovate_ideas_topic_lnk idea_lnk ON idea_lnk.winnovate_topic_id = topic.id
        INNER JOIN winnovate_ideas idea ON idea.id = idea_lnk.winnovate_idea_id AND idea.published_at IS NOT NULL
        WHERE groups.published_at IS NOT NULL ${groupDocumentId ? `AND groups.document_id = '${groupDocumentId}' ` : ""}
        `
      );
      return +parseEntries(countIdeaEntries)[0].count;
    }
  })
);
