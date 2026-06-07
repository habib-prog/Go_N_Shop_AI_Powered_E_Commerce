const jwt = require('jsonwebtoken');

const verifyAccessToken = (req, res, next) => {
  // Read the access token from the HTTP-only cookie
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    if (!process.env.JWT_ACCESS_SECRET) {
      return res.status(500).json({ error: 'JWT secret is not configured' });
    }

    // Verify the token and attach the decoded payload to the request
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = verifyAccessToken;
