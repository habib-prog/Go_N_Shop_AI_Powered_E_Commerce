const {
  signUpSchema,
  loginSchema,
} = require("../helpers/ZodValidators/validator");
const {
  signUpUser,
  resendOtp: resendOtpService,
  verifyOtp: verifyOtpService,
} = require("../services/auth/register.service");
const loginUser = require("../services/auth/login.service");
const refreshAccessTokenService = require("../services/auth/token.service");
const {
  getProfile: getProfileService,
  updateProfile: updateProfileService,
  getUserVerificationStatus: getUserVerificationStatusService,
} = require("../services/auth/profile.service");

const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? "Internal server Error" : error.message || "Error";

  return res.status(statusCode).json({ error: message });
};

const signUp = async (req, res) => {
  const parsed = signUpSchema.safeParse(req.body);

  try {
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation Failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { fullname, email, password, avatar, address } = parsed.data;

    const user = await signUpUser({
      fullname,
      email,
      password,
      avatar,
      address,
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
    return handleError(res, error);
  }
};
const ResendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    await resendOtpService(email);

    return res.status(200).json({
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP failed:", error);
    return handleError(res, error);
  }
};
const otpVerification = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ error: "email and otp is required" });
  try {
    const user = await verifyOtpService({ email, otp });

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
    return handleError(res, error);
  }
};

const logIn = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  try {
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation Failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;

    const { user, accessToken, refreshToken } = await loginUser({
      email,
      password,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
    return handleError(res, error);
  }
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token missing" });
  }

  try {
    const { accessToken: newAccessToken } =
      await refreshAccessTokenService(refreshToken);

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

    return handleError(res, {
      statusCode: error.statusCode || 401,
      message:
        error.statusCode ? error.message : "Invalid or expired refresh token",
    });
  }
};

const profile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const user = await getProfileService(userId);

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Profile fetch failed:", error);
    return handleError(res, error);
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { fullname } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    if (!fullname && !req.file) {
      return res.status(400).json({
        error: "Provide fullname or avatar to update the profile",
      });
    }
    const user = await updateProfileService({
      userId,
      fullname,
      file: req.file,
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Profile update failed:", error);
    return handleError(res, error);
  }
};

const getUserVerificationStatus = async (req, res) => {
  try {
    const isVerified =
      req.query.isVerified === "true"
        ? true
        : req.query.isVerified === "false"
          ? false
          : undefined;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const response = await getUserVerificationStatusService({
      isVerified,
      page,
      limit,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("Fetching verification status failed:", error);
    return handleError(res, error);
  }
};
// Controllers Ended
module.exports = {
  signUp,
  logIn,
  otpVerification,
  ResendOtp,
  refreshAccessToken,
  profile,
  updateProfile,
  getUserVerificationStatus,
};
