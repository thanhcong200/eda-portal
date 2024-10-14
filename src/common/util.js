const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const jwt = require("jsonwebtoken");
const envConfig = require("../../config/env-config");
const utils = require("@strapi/utils");
const fs = require('fs');
const https = require('https');
const { PNG } = require('pngjs');

const { UnauthorizedError} = utils.errors;
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
  try {
    return +Object.values(total.rows)[0].count;
  } catch (err) {
    return +total[0].count;
  }
};

const parseEntries = (entries) => {
  if (entries?.rows) return entries.rows;
  return entries;
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
  if (!isExistToken) return false;
  return decoded;
};

const createResponse = (data, message = "Success", status = 200) => {
  return {
    status,
    message,
    data,
  };
};

const downloadFile = (url, downloadPath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(downloadPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(downloadPath));
      });
    }).on('error', (err) => {
      fs.unlink(downloadPath, () => reject(err));
    });
  });
};

const convertRGBToPng = async (data, fileName) => {
  const width = data[0].length;
  const height = data.length;
  
  // Create a new PNG instance
  const png = new PNG({
    width: width,
    height: height
  });
  
  // Populate the PNG buffer with pixel data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2; // Calculate the index for the buffer
      const [r, g, b] = data[y][x]; // Get the RGB values
  
      png.data[idx] = r;     // Red
      png.data[idx + 1] = g; // Green
      png.data[idx + 2] = b; // Blue
      png.data[idx + 3] = 255; // Alpha (opacity), 255 = fully opaque
    }
  }
  
  // Save the PNG to disk
  await png.pack().pipe(fs.createWriteStream(`public/uploads/${fileName}`));
  return `/uploads/${fileName}`;
}

const convertBase64ToJPG = async(data, fileName) => {
  try {
    // Remove the Base64 URL prefix if present (e.g., data:image/jpeg;base64,)
    const base64Data = data.replace(/^data:image\/jpeg;base64,/, "");

    // Create a buffer from the Base64 string
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Write the buffer to a file, using await for async operation
    await fs.promises.writeFile(`public/uploads/${fileName}`, imageBuffer);

    console.log("JPG file created successfully:", `public/uploads/${fileName}`);
  } catch (err) {
    console.error("Error writing the JPG file:", err);
  }
  // fs.writeFileSync(`public/uploads/${fileName}`, Buffer.from(data).toString('base64'));
  return `/uploads/${fileName}`;
}




module.exports = {
  getCurrentTimeInHoChiMinh,
  convertToHoChiMinhTime,
  decodeJwtToken,
  verifyToken,
  createResponse,
  pagination,
  parseTotal,
  generateToken,
  parseEntries,
  downloadFile,
  convertRGBToPng,
  convertBase64ToJPG,
  dayjs,
};
