// ================================
// FILE: backend/routes/services.js
// ================================
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder for future services routes
router.get('/boarding', (req, res) => {
  res.json({ success: true, message: 'Boarding service route' });
});

router.get('/grooming', (req, res) => {
  res.json({ success: true, message: 'Grooming service route' });
});

router.get('/training', (req, res) => {
  res.json({ success: true, message: 'Training service route' });
});

module.exports = router;