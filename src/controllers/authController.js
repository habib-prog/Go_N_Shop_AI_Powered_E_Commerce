const mailService = require("../helpers/Mail/mailService");
const generateSecureOTP = require("../helpers/Otp/otp");
const template = require("../helpers/Template/mailTemp");
const verifySuccessTemplate = require("../helpers/Template/verifySuccessTemp");
const jwt = require("jsonwebtoken");
const generateAccessToken = require("../helpers/Jwt/generateAccessToken");
const generateRefreshToken = require("../helpers/Jwt/generateRefreshToken");
const {
  signUpSchema,
  loginSchema,
} = require("../helpers/ZodValidators/validator");
const User = require("../models/userSchema");

const signUp = async (req, res) => {
  const parsed = signUpSchema.safeParse(req.body);
  try {
    //   Checking input data Using ZOD
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation Failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { fullname, email, password, avatar, address } = parsed.data;

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(409).json({ error: "user already exist" });
    // Generate OTP
    const OtpCode = generateSecureOTP();

    //  otp expiry time

    const expireAfter = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      fullname,
      email,
      password,
      avatar,
      address,
      otp: OtpCode,
      otpExp: expireAfter,
    });
    await mailService({
      email,
      otp: OtpCode,
      msg: "Verify OTP to Sign Up",
      sub: "Go N Shop Email Verification",
      template: template(
        OtpCode,
        "Verify OTP to Sign Up",
        "Go N Shop Email Verification",
      ),
    });
    return res.status(201).json({
      message: "Sign Up successfull",
      user: {
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Sign up failed:", error);
    return res.status(500).json({ error: "Internal server Error" });
  }
};
const ResendOtp = async (req, res) => {
  const { email } = req.body;
  // Make sure the request includes the user's email
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // Load the user with hidden OTP-related tracking fields
    const user = await User.findOne({ email }).select(
      "+otp +otpExp +lastOtpSentAt +otpResendCount +otpBlockedUntil",
    );
    if (!user) return res.status(404).json({ error: "User not found!" });

    // Do not resend OTP if the account is already verified
    if (user.isVerified)
      return res.status(400).json({ error: "User is already verified" });

    const Now = new Date();

    // Block resend requests while the temporary lock is active
    if (user.otpBlockedUntil && user.otpBlockedUntil > Now)
      return res.status(429).json({
        error: "Too many OTP requests. Try again after 20 minutes",
      });

    // Reset block state after the lock period has expired
    if (user.otpBlockedUntil && user.otpBlockedUntil <= Now) {
      user.otpBlockedUntil = null;
      user.otpResendCount = 0;
    }

    // Prevent repeated requests within the cooldown window - 60 Seconds
    if (user.lastOtpSentAt && Now - user.lastOtpSentAt < 60 * 1000) {
      return res.status(429).json({
        error: "Please wait 60 seconds before requesting a new OTP",
      });

      // Lock the user if resend attempts exceed the allowed limit
      if (user.otpResendCount >= 5) {
        user.otpBlockedUntil = new Date(Date.now() + 20 * 60 * 1000);
        user.otpResendCount = 0;
        await user.save();

        return res.status(429).json({
          error: "Too many OTP requests. Try again after 20 minutes",
        });
      }
    }

    // Generate a new OTP and refresh its expiry time
    const newOTP = generateSecureOTP();
    const newEXP = new Date(Date.now() + 10 * 60 * 1000);

    // Update OTP and resend tracking values
    user.otp = newOTP;
    user.otpExp = newEXP;
    user.lastOtpSentAt = Now;
    user.otpResendCount += 1;
    await user.save();

    // Send the new OTP to the user's email
    await mailService({
      email: user.email,
      otp: newOTP,
      msg: "Verify OTP to Sign Up",
      sub: "Go N Shop Email Verification",
      template: template(
        newOTP,
        "Verify OTP to Sign Up",
        "Go N Shop Email Verification",
      ),
    });

    return res.status(200).json({
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP failed:", error);
    return res.status(500).json({ error: "Internal server Error" });
  }
};
const otpVerification = async (req, res) => {
  const { email, otp } = req.body;
  // Ensure both email and OTP are provided in the request
  if (!email || !otp)
    return res.status(400).json({ error: "email and otp is required" });
  try {
    // Fetch the user along with hidden OTP fields
    const user = await User.findOne({ email }).select("+otp +otpExp");
    if (!user) return res.status(400).json({ error: "User not found!" });

    // Stop verification if the account is already verified
    if (user.isVerified)
      return res.status(404).json({ error: "User is already verified" });

    // Compare the stored OTP with the submitted one
    if (user.otp !== String(otp))
      return res.status(400).json({ error: "OTP is invalid" });

    // Reject the request if the OTP has expired
    if (user.otpExp < new Date())
      return res.status(400).json({ error: "Otp has expired" });

    // Mark the user as verified and clear OTP-related fields
    user.isVerified = true;
    user.otp = null;
    user.otpExp = null;
    await user.save();

    // Send a confirmation email after successful verification
    await mailService({
      email: user.email,
      msg: "Your account has been verified successfully",
      sub: "Go N Shop Account Verified Successfully",
      template: verifySuccessTemplate(user.fullname),
    });
    return res.status(200).json({
      message: "Email verification successful!",
      user: {
        fullname: user.fullname,
        email: user.email,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("OTP Verification failed:", error);
    return res.status(500).json({ error: "Internal server Error" });
  }
};

const logIn = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  try {
    // Validate login input using Zod before querying the database
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation Failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;

    // Load the user with the hidden password field for password comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    // Prevent login before email verification is completed
    if (!user.isVerified)
      return res.status(400).json({ error: "User isn't verified" });

    // Stop banned users from accessing the account
    if (user.isBanned)
      return res.status(403).json({ error: "This account has been banned" });

    // Compare the provided password with the hashed password in database
    const isPassCorrect = await user.comparePassword(password);
    if (!isPassCorrect)
      return res.status(401).json({ error: "Invalid email or password" });

    // Make sure the JWT secret exists before generating a token
    if (!process.env.JWT_ACCESS_SECRET) {
      return res.status(500).json({ error: "JWT secret is not configured" });
    }

    // Make sure the refresh secret exists before generating a token
    if (!process.env.JWT_REFRESH_SECRET) {
      return res.status(500).json({ error: "Refresh secret is not configured" });
    }

    // Generate access and refresh tokens from reusable helpers
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save the access token in an HTTP-only cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Save the refresh token in a separate HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
        address: user.address,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ error: "Internal server Error" });
  }
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token missing" });
  }

  try {
    // Make sure the refresh secret exists before token verification
    if (!process.env.JWT_REFRESH_SECRET) {
      return res
        .status(500)
        .json({ error: "Refresh secret is not configured" });
    }

    // Verify the refresh token from cookie
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Load the user again to avoid issuing tokens for deleted users
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isBanned)
      return res.status(403).json({ error: "This account has been banned" });

    if (!user.isVerified)
      return res.status(400).json({ error: "User isn't verified" });

    // Issue a fresh access token and replace the old cookie
    const newAccessToken = generateAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh token failed:", error);

    // Clear auth cookies when the refresh token is no longer usable
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

module.exports = {
  signUp,
  logIn,
  otpVerification,
  ResendOtp,
  refreshAccessToken,
};
