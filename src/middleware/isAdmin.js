const User = require('../models/userSchema');

const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    // Load the current user to confirm the latest role from database
    const user = await User.findById(userId).select('role isBanned');
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.isBanned) {
      return res.status(403).json({ error: 'This account has been banned' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only' });
    }

    next();
  } catch (error) {
    console.error('Admin check failed:', error);
    return res.status(500).json({ error: 'Internal server Error' });
  }
};

module.exports = isAdmin;
