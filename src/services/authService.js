const jwt = require("jsonwebtoken");
const redis = require("../config/redis");
const User = require("../models/userSchema");
const mailService = require("../helpers/Mail/mailService");
const generateSecureOTP = require("../helpers/Otp/otp");
const template = require("../helpers/Template/mailTemp");
const verifySuccessTemplate = require("../helpers/Template/verifySuccessTemp");
const generateAccessToken = require("../helpers/Jwt/generateAccessToken");
const generateRefreshToken = require("../helpers/Jwt/generateRefreshToken");
const destroyAvatarFromCloudinary = require("../helpers/Cloudinary/destroyAvatarFromCloudinary");
const uploadAvatarToCloudinary = require("../helpers/Cloudinary/uploadAvatarToCloudinary");

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const signUpUser = async ({ fullname, email, password, avatar, address }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(409, "user already exist");
  }

  const otpCode = generateSecureOTP();
  const expireAfter = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    fullname,
    email,
    password,
    avatar,
    address,
    otp: otpCode,
    otpExp: expireAfter,
  });

  await mailService({
    email,
    otp: otpCode,
    msg: "Verify OTP to Sign Up",
    sub: "Go N Shop Email Verification",
    template: template(
      otpCode,
      "Verify OTP to Sign Up",
      "Go N Shop Email Verification",
    ),
  });

  return user;
};

const resendOtp = async (email) => {
  const user = await User.findOne({ email }).select("+otp +otpExp");

  if (!user) {
    throw createHttpError(404, "User not found!");
  }

  if (user.isVerified) {
    throw createHttpError(400, "User is already verified");
  }

  const blockKey = `otp:block:${email}`;
  const cooldownKey = `otp:cooldown:${email}`;
  const attemptsKey = `otp:attempts:${email}`;

  const blockedTtl = await redis.ttl(blockKey);
  if (blockedTtl > 0) {
    throw createHttpError(
      429,
      "Too many OTP requests. Try again after 20 minutes",
    );
  }

  const cooldownTtl = await redis.ttl(cooldownKey);
  if (cooldownTtl > 0) {
    throw createHttpError(
      429,
      "Please wait 60 seconds before requesting a new OTP",
    );
  }

  const attempts = await redis.incr(attemptsKey);
  if (attempts === 1) {
    await redis.expire(attemptsKey, 20 * 60);
  }

  if (attempts > 5) {
    await redis.set(blockKey, "1", { EX: 20 * 60 });
    throw createHttpError(
      429,
      "Too many OTP requests. Try again after 20 minutes",
    );
  }

  const newOtp = generateSecureOTP();
  const newExp = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = newOtp;
  user.otpExp = newExp;

  await user.save();
  await redis.set(cooldownKey, "1", { EX: 60 });

  await mailService({
    email: user.email,
    otp: newOtp,
    msg: "Verify OTP to Sign Up",
    sub: "Go N Shop Email Verification",
    template: template(
      newOtp,
      "Verify OTP to Sign Up",
      "Go N Shop Email Verification",
    ),
  });

  return user;
};

const verifyOtp = async ({ email, otp }) => {
  const user = await User.findOne({ email }).select("+otp +otpExp");

  if (!user) {
    throw createHttpError(400, "User not found!");
  }

  if (user.isVerified) {
    throw createHttpError(404, "User is already verified");
  }

  if (user.otp !== String(otp)) {
    throw createHttpError(400, "OTP is invalid");
  }

  if (user.otpExp < new Date()) {
    throw createHttpError(400, "Otp has expired");
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExp = null;
  await user.save();

  await redis.del(`otp:block:${email}`);
  await redis.del(`otp:cooldown:${email}`);
  await redis.del(`otp:attempts:${email}`);

  await mailService({
    email: user.email,
    msg: "Your account has been verified successfully",
    sub: "Go N Shop Account Verified Successfully",
    template: verifySuccessTemplate(user.fullname),
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  if (!user.isVerified) {
    throw createHttpError(400, "User isn't verified");
  }

  if (user.isBanned) {
    throw createHttpError(403, "This account has been banned");
  }

  const isPassCorrect = await user.comparePassword(password);
  if (!isPassCorrect) {
    throw createHttpError(401, "Invalid email or password");
  }

  if (!process.env.JWT_ACCESS_SECRET) {
    throw createHttpError(500, "JWT secret is not configured");
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    throw createHttpError(500, "Refresh secret is not configured");
  }

  return {
    user,
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

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

const getProfile = async (userId) => {
  const user = await User.findById(userId).select(
    "fullname email avatar address role isBanned createdAt updatedAt",
  );

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  return user;
};

const updateProfile = async ({ userId, fullname, file }) => {
  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw createHttpError(404, "User not found");
  }

  const updateData = {};

  if (fullname && fullname.trim()) {
    updateData.fullname = fullname.trim();
  }

  if (file) {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw createHttpError(500, "Cloudinary is not configured");
    }

    const uploadedAvatar = await uploadAvatarToCloudinary(file);
    updateData.avatar = uploadedAvatar.secure_url;
    updateData.avatarPublicId = uploadedAvatar.public_id;
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("fullname email avatar address role isBanned createdAt updatedAt");

  if (file && existingUser.avatarPublicId) {
    await destroyAvatarFromCloudinary(existingUser.avatarPublicId);
  }

  return user;
};

const getUserVerificationStatus = async ({ isVerified, page, limit }) => {
  const filter = {};

  if (typeof isVerified === "boolean") {
    filter.isVerified = isVerified;
  }

  const totalUsers = await User.countDocuments(filter);
  const skip = (page - 1) * limit;
  const users = await User.find(filter)
    .select("fullname email avatar address role isVerified isBanned createdAt")
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalUsers / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  if (typeof isVerified === "boolean") {
    return {
      message: "User verification status fetched successfully",
      appliedFilter: { isVerified },
      count: users.length,
      users,
    };
  }

  const response = {
    message: "User verification status fetched successfully",
    appliedFilter: "all users",
    pagination: {
      totalUsers,
      totalPages,
      currentPage: page,
      limit,
      hasPrevPage,
      hasNextPage,
    },
    users,
  };

  if (hasNextPage) {
    response.pagination.nextPage = page + 1;
  }

  if (hasPrevPage) {
    response.pagination.prevPage = page - 1;
  }

  return response;
};

module.exports = {
  signUpUser,
  resendOtp,
  verifyOtp,
  loginUser,
  refreshAccessToken,
  getProfile,
  updateProfile,
  getUserVerificationStatus,
};
