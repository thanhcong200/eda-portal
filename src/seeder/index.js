const reader = require("xlsx");

const saveGroups = async (strapi, data) => {
  const groups = [
    ...new Set(data.filter((ele) => ele.group).map((ele) => ele.group)),
  ].map((group) => {
    return {
      name: group,
      color: "#FF5733",
    };
  });
  const { count, ids } = await strapi.db
    .query("api::winnovate-group.winnovate-group")
    .createMany({
      data: groups.map((group) => ({
        ...group,
        publishedAt: null,
      })),
    });
};

const saveTopics = async (strapi, data) => {
  const groups = await strapi.db
    .query("api::winnovate-group.winnovate-group")
    .findMany({where: { publishedAt: { $eq: null } }});
  const groupMap = new Map();
  groups.map((ele) => groupMap.set(ele.name, ele.id));
  const topics = [
    ...new Set(data.filter((ele) => ele.topic).map((ele) => ele.topic)),
  ].map((topic) => {
    return {
      name: topic,
      color: "#FF5733",
      groups: [
        ...new Set(
          data
            .filter((ele) => ele.group && ele.topic == topic)
            .map((ele) => groupMap.get(ele.group))
        ),
      ],
    };
  });
  for (const topic of topics) {
    await strapi.db.query("api::winnovate-topic.winnovate-topic").create({
      data: {
        name: topic.name,
        color: topic.color,
        groups: topic.groups, // Include group IDs to associate
        publishedAt: null,
      },
    });
  }
};

const saveIdeas = async (strapi, data) => {
  const [topics, category] = await Promise.all([
    strapi.db.query("api::winnovate-topic.winnovate-topic").findMany({where: { publishedAt: { $eq: null } }}),
    strapi.db
      .query("api::winnovate-category.winnovate-category")
      .findOne({ where: { publishedAt: { $eq: null } } }),
  ]);
  const topicMap = new Map();
  topics.map((ele) => topicMap.set(ele.name, ele.id));
  for (const idea of data) {
    if (!idea.name) continue;
    await strapi.db.query("api::winnovate-idea.winnovate-idea").create({
      data: {
        name: idea.name,
        email: idea.email,
        score: idea.score,
        target_customer: idea.target_customer,
        desc_target_customer: idea.desc_target_customer,
        problem_statement: idea.problem_statement,
        idea_owner: idea.idea_owner,
        pdf_url: idea.pdf_url,
        solution: idea.solution,
        priority: idea.priority,
        publishedAt: null,
        category: category.id, // ID of the category
        topic: topicMap.get(idea.topic), // ID of the topic
        bu: 1, // ID of the business unit
      },
    });
  }
};

const readDataFromWinnovateFile = async (strapi) => {
  const file = reader.readFile("src/seeder/data/WINNOVATE.xlsx");
  let data = [];
  const sheets = file.SheetNames;
  for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
    temp.forEach((res) => {
      const row = {
        group: res["Group"],
        topic: res["Chủ đề"],
        bu: res["BU"],
        name: res["Name of your idea"],
        email: res["Email"],
        score: res["Score"],
        target_customer: res["Khách hàng mục tiêu"],
        desc_target_customer: res["Mô tả chi tiết khách hàng mục tiêu"],
        solution: res["Giải pháp và trải nghiệm khách hàng"],
        problem_statement: res["Vấn đề giải quyết"],
        idea_owner: res["Idea owner"],
        pdf_url: res["Link PDF"],
        priority: res["Priority"],
      };

      data.push(row);
    });
  }

  await saveGroups(strapi, data);
  await saveTopics(strapi, data);
  await saveIdeas(strapi, data);
};

module.exports = {
  readDataFromWinnovateFile,
};
