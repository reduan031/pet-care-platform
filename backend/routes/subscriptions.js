// ================================
// FILE: backend/routes/subscriptions.js
// ================================
const express = require('express');
const router = express.Router();
const {
  createSubscription,
  getMySubscriptions,
  updateSubscriptionStatus
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createSubscription)
  .get(protect, getMySubscriptions);

router.route('/:id')
  .patch(protect, updateSubscriptionStatus);

module.exports = router;
