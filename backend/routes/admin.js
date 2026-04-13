const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAdminStats,
  getUsers,
  setUserStatus,
  getListings,
  getSocialPosts,
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:userId/status', setUserStatus);
router.get('/listings', getListings);
router.get('/social-posts', getSocialPosts);

module.exports = router;
