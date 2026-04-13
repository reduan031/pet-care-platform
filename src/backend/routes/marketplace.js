const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createListing,
  searchListings,
  getListing,
  rateSeller,
  messageOwner,
  createPaymentIntent,
} = require('../controllers/marketplaceController');

router.get('/listings', searchListings);
router.post('/listings', protect, createListing);
router.get('/listings/:id', getListing);
router.post('/listings/:id/rate', protect, rateSeller);
router.post('/listings/:id/message-owner', protect, messageOwner);
router.post('/payments/intent', protect, createPaymentIntent);

module.exports = router;
