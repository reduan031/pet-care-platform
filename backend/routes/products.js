// ================================
// FILE: backend/routes/products.js
// ================================
const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  addReview
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('seller', 'admin'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('seller', 'admin'), updateProduct)
  .delete(protect, authorize('seller', 'admin'), deleteProduct);

router.post('/:id/reviews', protect, addReview);

module.exports = router;
