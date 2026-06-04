const express = require("express");
const verifyAccessToken = require("../middleware/verifyAccessToken");
const isAdmin = require("../middleware/isAdmin");
const uploadAvatar = require("../middleware/uploadAvatar");
const {
  signUp,
  logIn,
  otpVerification,
  ResendOtp,
  refreshAccessToken,
  profile,
  updateProfile,
  getUserVerificationStatus,
} = require("../controllers/authController");
const router = express.Router();
router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/refresh-token", refreshAccessToken);
router.get("/profile", verifyAccessToken, profile);
router.get(
  "/admin/user-verification-status",
  verifyAccessToken,
  isAdmin,
  getUserVerificationStatus,
);
router.patch(
  "/profile",
  verifyAccessToken,
  uploadAvatar.single("avatar"),
  updateProfile,
);
router.post("/otpverify", otpVerification);
router.post("/resendotp", ResendOtp);

module.exports = router;
