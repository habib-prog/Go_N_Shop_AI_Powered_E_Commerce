// Backward-compatible auth service index.
module.exports = {
  ...require("./auth/register.service"),
  loginUser: require("./auth/login.service"),
  refreshAccessToken: require("./auth/token.service"),
  ...require("./auth/profile.service"),
};
