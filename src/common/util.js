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

const verifyToken = async (token, type) => {
  const decoded = decodeJwtToken(token);
  const isExistToken = await strapi.db
    .query("api::custom-auth.jwt-token")
    .findOne({
      where: {
        token,
        type,
        is_delete: false
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
  dayjs,
};
