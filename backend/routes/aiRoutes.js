const express = require('express');
const router = express.Router();
const { chatWithAI, chatWithAIStream } = require('../controllers/aiController');

router.post('/chat', (req, res) => {
  // Check if stream query parameter is present
  if (req.query.stream === 'true') {
    return chatWithAIStream(req, res);
  }
  return chatWithAI(req, res);
});

module.exports = router;
