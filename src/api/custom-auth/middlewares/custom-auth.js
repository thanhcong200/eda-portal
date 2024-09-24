// src/middlewares/custom-auth/myMiddleware.js
const { verifyToken } = require("../../../common/util");
const { TokenType } = require("../../../common/constant");

const authUser = async (ctx, next) => {
  const token = ctx.request.headers["authorization"]?.split(" ")[1]; // Assuming Bearer token
  if (!token) {
    return ctx.unauthorized("No token provided");
  }

  try {
    const decoded = await verifyToken(token, TokenType.ACCESS_TOKEN);
    ctx.state.user = decoded; // Attach user info to context for later use
    await next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.log(err)
    return ctx.unauthorized("Invalid token");
  }
};

module.exports = {
  authUser,
};
