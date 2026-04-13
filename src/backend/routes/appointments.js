// ================================
// FILE: backend/routes/appointments.js
// ================================
const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getMyAppointments
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, createAppointment)
  .get(protect, authorize('doctor', 'admin'), getAppointments);

router.get('/my-appointments', protect, getMyAppointments);

router.route('/:id')
  .get(protect, getAppointment)
  .put(protect, authorize('doctor', 'admin'), updateAppointment)
  .delete(protect, cancelAppointment);

module.exports = router;