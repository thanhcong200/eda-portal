module.exports = {
  // Server
  HOST: process.env.HOST || "0.0.0.0",
  PORT: process.env.PORT || 1337,

  // Secrets
  APP_KEYS: process.env.APP_KEYS,
  API_TOKEN_SALT: process.env.API_TOKEN_SALT,
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
  TRANSFER_TOKEN_SALT: process.env.TRANSFER_TOKEN_SALT,
  JWT_SECRET: process.env.JWT_SECRET,
  // Database
  DATABASE_CLIENT: process.env.DATABASE_CLIENT || "postgres",
  DATABASE_HOST: process.env.DATABASE_HOST || "localhost",
  DATABASE_PORT: process.env.DATABASE_PORT || 5432,
  DATABASE_NAME: process.env.DATABASE_NAME || "eda",
  DATABASE_USERNAME: process.env.DATABASE_USERNAME || "eda-portal",
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || "eda-portal",
  DATABASE_SSL: process.env.DATABASE_SSL || false,
  DATABASE_FILENAME: process.env.DATABASE_FILENAME || "",

  //   AWS

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_ACCESS_SECRET: process.env.AWS_ACCESS_SECRET,
  AWS_REGION: process.env.AWS_REGION,
  AWS_BUCKET: process.env.AWS_BUCKET,

  // JWT
  JWT_ACCESS_TOKEN_EXPIRE_TIME:
    process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME || "30m",
  JWT_REFRESH_TOKEN_EXPIRE_TIME:
    process.env.JWT_REFRESH_TOKEN_EXPIRE_TIME || "1d",
  
    // SEEDER
    ENABLE_SEEDER: +process.env.ENABLE_SEEDER || 0
};
