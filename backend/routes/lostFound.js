// ================================
// FILE: backend/routes/lostFound.js
// ================================
const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReport,
  updateReportStatus
} = require('../controllers/lostFoundController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getReports)
  .post(protect, createReport);

router.route('/:id')
  .get(getReport)
  .patch(protect, updateReportStatus); // typically used to mark 'resolved'

module.exports = router;
