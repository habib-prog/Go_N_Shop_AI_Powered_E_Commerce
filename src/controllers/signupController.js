const { signUpSchema } = require('../helpers/ZodValidators/validator');
const {
  signUpUser,
  resendOtp: resendOtpService,
  verifyOtp: verifyOtpService,
} = require('../services/auth/register.service');

const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? 'Internal server Error' : error.message || 'Error';

  return res.status(statusCode).json({ error: message });
};

// Signup flow: create the account and send OTP.
const signUp = async (req, res) => {
  const parsed = signUpSchema.safeParse(req.body);

  try {
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation Failed',
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
      message: 'Sign Up successfull',
      user: {
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
        address: user.address,
      },
    });
  } catch (error) {
    console.error('Sign up failed:', error);
    return handleError(res, error);
  }
};

// OTP flow: resend a verification code for signup.
const ResendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    await resendOtpService(email);

    return res.status(200).json({
      message: 'OTP resent successfully',
    });
  } catch (error) {
    console.error('Resend OTP failed:', error);
    return handleError(res, error);
  }
};

// OTP flow: verify the email using the submitted code.
const otpVerification = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ error: 'email and otp is required' });

  try {
    const user = await verifyOtpService({ email, otp });

    return res.status(200).json({
      message: 'Email verification successful!',
      user: {
        fullname: user.fullname,
        email: user.email,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error('OTP Verification failed:', error);
    return handleError(res, error);
  }
};

module.exports = {
  signUp,
  ResendOtp,
  otpVerification,
};
