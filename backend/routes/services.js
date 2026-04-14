// ================================
// FILE: backend/routes/services.js
// ================================
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder for future services routes
router.get('/boarding', protect, (req, res) => {
  res.json({ success: true, message: 'Boarding service route' });
});

router.get('/grooming', protect, (req, res) => {
  res.json({ success: true, message: 'Grooming service route' });
});

router.get('/training', protect, (req, res) => {
  res.json({ success: true, message: 'Training service route' });
});

module.exports = router;