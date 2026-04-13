// ================================
// FILE: backend/routes/orders.js
// ================================
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getMyOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, createOrder)
  .get(protect, authorize('admin', 'seller'), getOrders);

router.get('/my-orders', protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrder)
  .put(protect, authorize('admin', 'seller'), updateOrderStatus);

module.exports = router;
