const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { chatWithAI, chatWithAIStream } = require('../controllers/aiController');

// Optional auth: attaches user if token present, but doesn't block unauthenticated requests
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid - continue without user
    }
  }
  next();
};

router.post('/chat', optionalAuth, (req, res) => {
  // Check if stream query parameter is present
  if (req.query.stream === 'true') {
    return chatWithAIStream(req, res);
  }
  return chatWithAI(req, res);
});

module.exports = router;
