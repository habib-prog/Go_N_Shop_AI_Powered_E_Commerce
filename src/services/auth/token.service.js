const jwt = require("jsonwebtoken");
const User = require("../../models/userSchema");
const createHttpError = require("./httpError");
const generateAccessToken = require("../../helpers/Jwt/generateAccessToken");

// Token flow: refresh the access token after validating the refresh token.
const refreshAccessToken = async (refreshToken) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw createHttpError(500, "Refresh secret is not configured");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw createHttpError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  if (user.isBanned) {
    throw createHttpError(403, "This account has been banned");
  }

  if (!user.isVerified) {
    throw createHttpError(400, "User isn't verified");
  }

  return {
    user,
    accessToken: generateAccessToken(user),
  };
};

module.exports = refreshAccessToken;
