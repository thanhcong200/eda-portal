const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const jwt = require("jsonwebtoken");
const envConfig = require("../../config/env-config");
const utils = require("@strapi/utils");
const { UnauthorizedError } = utils.errors;
// Load the plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the timezone for Ho Chi Minh City
const hoChiMinhTimezone = "Asia/Ho_Chi_Minh";

// Function to get current time in Ho Chi Minh
const getCurrentTimeInHoChiMinh = () => {
  return dayjs().tz(hoChiMinhTimezone).format("YYYY-MM-DD HH:mm:ss");
};

// Example function to convert a date to Ho Chi Minh timezone
const convertToHoChiMinhTime = (date) => {
  return dayjs(date).tz(hoChiMinhTimezone).format("YYYY-MM-DD HH:mm:ss");
};

const decodeJwtToken = (token) => {
  try {
    return jwt.verify(token, envConfig.JWT_SECRET);
  } catch (error) {
    throw new UnauthorizedError();
  }
};

const pagination = (totalItem, page = 1, limit = 10) => {
  const pageCount = Math.ceil(totalItem / limit);
  return {
    page,
    limit,
    totalItem,
    pageCount,
    hasPreviousPage: page > 1,
    hasNextPage: page < pageCount,
  };
};

const parseTotal = (total) => {
  return +Object.values(total.rows)[0].count;
};

const generateToken = (userId, expiresIn = "30m") => {
  return jwt.sign({ id: userId, sub: userId }, envConfig.JWT_SECRET, {
    expiresIn,
  });
};

const verifyToken = async (token, type) => {
  const decoded = decodeJwtToken(token);
  const isExistToken = await strapi.db
    .query("api::custom-auth.jwt-token")
    .findOne({
      where: {
        token,
        type,
        is_delete: false,
      },
    });
  if (!isExistToken) throw new UnauthorizedError();
  return decoded;
};

const createResponse = (data, message = "Success", status = 200) => {
  return {
    status,
    message,
    data,
  };
};

module.exports = {
  getCurrentTimeInHoChiMinh,
  convertToHoChiMinhTime,
  decodeJwtToken,
  verifyToken,
  createResponse,
  pagination,
  parseTotal,
  generateToken,
  dayjs,
};
