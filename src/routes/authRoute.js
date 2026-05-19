const express = require("express");
const verifyAccessToken = require("../middleware/verifyAccessToken");
const {
  signUp,
  logIn,
  otpVerification,
  ResendOtp,
  refreshAccessToken,
  profile,
} = require("../controllers/authController");
const router = express.Router();
router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/refresh-token", refreshAccessToken);
router.get("/profile", verifyAccessToken, profile);
router.post("/otpVerify", otpVerification);
router.post("/resendotp", ResendOtp);

module.exports = router;
