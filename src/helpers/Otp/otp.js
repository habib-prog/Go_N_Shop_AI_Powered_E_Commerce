const crypto = require('crypto');

function generateSecureOTP() {
  // Generates a cryptographically secure random integer between 100000 and 999999
  return crypto.randomInt(100000, 999999).toString();
}

module.exports = generateSecureOTP;
