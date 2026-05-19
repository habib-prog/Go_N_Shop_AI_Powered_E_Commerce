const jwt = require("jsonwebtoken");

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES || "30d",
    },
  );
};

module.exports = generateRefreshToken;
