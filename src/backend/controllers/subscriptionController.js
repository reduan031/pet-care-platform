// ================================
// FILE: backend/controllers/subscriptionController.js
// ================================
const Subscription = require('../models/Subscription');

exports.createSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMySubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user._id }).populate('productId');
    res.json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSubscriptionStatus = async (req, res) => {
  try {
    let subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    subscription.status = req.body.status;
    await subscription.save();

    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
