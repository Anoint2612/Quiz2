const jwt = require('jsonwebtoken');

module.exports.protect = function (req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if not token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = { _id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

