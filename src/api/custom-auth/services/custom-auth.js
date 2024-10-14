"use strict";

/**
 * custom-auth service
 */
const utils = require("@strapi/utils");
const { dayjs, verifyToken, createResponse, generateToken } = require("../../../common/util");
const envConfig = require("../../../../config/env-config");
const { TokenType } = require("../../../common/constant");
const { ApplicationError, ValidationError } = utils.errors;
module.exports = ({ strapi }) => ({
  async login(ctx) {
    const { identifier, password } = ctx.request.body;
    const provider = ctx.params.provider || "local";
    if (!identifier || !password) {
      return ctx.badRequest("Please provide your email and password");
    }

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: {
          provider,
          $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
        },
      });

    if (!user) {
      throw new ValidationError("Invalid identifier or password");
    }

    if (!user.password) {
      throw new ValidationError("Invalid identifier or password");
    }

    if (user.blocked === true) {
      throw new ApplicationError(
        "Your account has been blocked by an administrator"
      );
    }

    // Validate the password
    const validPassword = await strapi.plugins[
      "users-permissions"
    ].services.user.validatePassword(password, user.password);
    if (!validPassword) {
      throw new ValidationError("Invalid identifier or password");
    }

    // Generate a JWT token
    const { accessToken, refreshToken } = await this.renewToken(user.id);
    return createResponse({
      user: {
        id: user.id,
        documentId: user.documentId,
        username: user.username,
        email: user.email,
      },
      jwt: {
        accessToken,
        refreshToken,
      },
    });
  },

  async refreshToken(ctx) {
    const { refreshToken } = ctx.request.body;
    const decoded = await verifyToken(refreshToken, TokenType.REFRESH_TOKEN);
    if (!decoded) return ctx.unauthorized("Invalid token");
    const tokens = await this.renewToken(decoded.sub);
    return createResponse(tokens)
  },

  async logout(ctx) {
    const { accessToken } = ctx.request.body;
    const decoded = await verifyToken(accessToken, TokenType.ACCESS_TOKEN);
    await this.destroyAllToken(decoded.sub);
    return createResponse(null)
  },

  async renewToken(userId) {
    const accessToken = generateToken(
      userId,
      envConfig.JWT_ACCESS_TOKEN_EXPIRE_TIME
    );
    const refreshToken = generateToken(
      userId,
      envConfig.JWT_REFRESH_TOKEN_EXPIRE_TIME
    );
    await this.destroyAllToken(userId)
    await Promise.all([
      strapi.db.query("api::custom-auth.jwt-token").create({
        data: {
          token: accessToken,
          type: TokenType.ACCESS_TOKEN,
          user: userId,
          expired_at: dayjs().add(30, "minute"),
        },
      }),
      ,
      strapi.db.query("api::custom-auth.jwt-token").create({
        data: {
          token: refreshToken,
          type: TokenType.REFRESH_TOKEN,
          user: userId,
          expired_at: dayjs().add(1, "d"),
        },
      }),
    ]);
    return { accessToken, refreshToken };
  },

  async destroyAllToken(userId) {
    const query = `UPDATE "jwt_tokens" SET "is_delete"= true
        WHERE id IN (
            SELECT "jwt_token_id" FROM jwt_tokens_user_lnk
            WHERE user_id = ${userId}
        ) AND is_delete = false
    `;
    await strapi.db.connection.raw(query);
  },
});
