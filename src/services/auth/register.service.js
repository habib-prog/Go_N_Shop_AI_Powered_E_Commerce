const User = require('../../models/userSchema');
const mailService = require('../../helpers/Mail/mailService');
const generateSecureOTP = require('../../helpers/Otp/otp');
const template = require('../../helpers/Template/mailTemp');
const verifySuccessTemplate = require('../../helpers/Template/verifySuccessTemp');
const redis = require('../../config/redis');
const createHttpError = require('./httpError');

// Registration flow: create user, generate OTP, and send verification email.
const signUpUser = async ({ fullname, email, password, avatar, address }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(409, 'user already exist');
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
    msg: 'Verify OTP to Sign Up',
    sub: 'Go N Shop Email Verification',
    template: template(
      otpCode,
      'Verify OTP to Sign Up',
      'Go N Shop Email Verification'
    ),
  });

  return user;
};

// OTP resend flow: apply cooldown/blocking and issue a fresh OTP.
const resendOtp = async (email) => {
  const user = await User.findOne({ email }).select('+otp +otpExp');

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  if (user.isVerified) {
    throw createHttpError(400, 'User is already verified');
  }

  const blockKey = `otp:block:${email}`;
  const cooldownKey = `otp:cooldown:${email}`;
  const attemptsKey = `otp:attempts:${email}`;

  const blockedTtl = await redis.ttl(blockKey);
  if (blockedTtl > 0) {
    throw createHttpError(
      429,
      'Too many OTP requests. Try again after 20 minutes'
    );
  }

  const cooldownTtl = await redis.ttl(cooldownKey);
  if (cooldownTtl > 0) {
    throw createHttpError(
      429,
      'Please wait 60 seconds before requesting a new OTP'
    );
  }

  const attempts = await redis.incr(attemptsKey);
  if (attempts === 1) {
    await redis.expire(attemptsKey, 20 * 60);
  }

  if (attempts > 5) {
    await redis.set(blockKey, '1', { EX: 20 * 60 });
    throw createHttpError(
      429,
      'Too many OTP requests. Try again after 20 minutes'
    );
  }

  const newOtp = generateSecureOTP();
  const newExp = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = newOtp;
  user.otpExp = newExp;

  await user.save();
  await redis.set(cooldownKey, '1', { EX: 60 });

  await mailService({
    email: user.email,
    otp: newOtp,
    msg: 'Verify OTP to Sign Up',
    sub: 'Go N Shop Email Verification',
    template: template(
      newOtp,
      'Verify OTP to Sign Up',
      'Go N Shop Email Verification'
    ),
  });

  return user;
};

// OTP verification flow: mark the user verified and clear OTP tracking data.
const verifyOtp = async ({ email, otp }) => {
  const user = await User.findOne({ email }).select('+otp +otpExp');

  if (!user) {
    throw createHttpError(400, 'User not found!');
  }

  if (user.isVerified) {
    throw createHttpError(404, 'User is already verified');
  }

  if (user.otp !== String(otp)) {
    throw createHttpError(400, 'OTP is invalid');
  }

  if (user.otpExp < new Date()) {
    throw createHttpError(400, 'Otp has expired');
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
    msg: 'Your account has been verified successfully',
    sub: 'Go N Shop Account Verified Successfully',
    template: verifySuccessTemplate(user.fullname),
  });

  return user;
};

module.exports = {
  signUpUser,
  resendOtp,
  verifyOtp,
};
