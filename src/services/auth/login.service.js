const User = require('../../models/userSchema');
const createHttpError = require('./httpError');
const generateAccessToken = require('../../helpers/Jwt/generateAccessToken');
const generateRefreshToken = require('../../helpers/Jwt/generateRefreshToken');

// Login flow: validate the user and issue access/refresh tokens.
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  if (!user.isVerified) {
    throw createHttpError(400, "User isn't verified");
  }

  if (user.isBanned) {
    throw createHttpError(403, 'This account has been banned');
  }

  const isPassCorrect = await user.comparePassword(password);
  if (!isPassCorrect) {
    throw createHttpError(401, 'Invalid email or password');
  }

  if (!process.env.JWT_ACCESS_SECRET) {
    throw createHttpError(500, 'JWT secret is not configured');
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    throw createHttpError(500, 'Refresh secret is not configured');
  }

  return {
    user,
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

module.exports = loginUser;
