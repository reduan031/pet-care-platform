// ================================
// FILE: backend/routes/bookings.js
// ================================
const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createBooking)
  .get(protect, getMyBookings);

router.route('/:id')
  .patch(protect, updateBookingStatus);

module.exports = router;
