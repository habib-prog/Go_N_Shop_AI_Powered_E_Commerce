const express = require("express");
const {
  signUp,
  logIn,
  otpVerification,
  ResendOtp,
} = require("../controllers/authController");
const router = express.Router();
router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/otpVerify", otpVerification);
router.post("/resendotp", ResendOtp);

module.exports = router;
