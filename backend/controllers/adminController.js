const User = require('../models/User');
const Pet = require('../models/Pet');
const Listing = require('../models/Listing');
const SocialPost = require('../models/SocialPost');
const { PetGroup, PetEvent } = require('../models/PetSocial');

exports.getAdminStats = async (_req, res) => {
  try {
    const [users, pets, listings, posts, groups, events] = await Promise.all([
      User.countDocuments({}),
      Pet.countDocuments({}),
      Listing.countDocuments({}),
      SocialPost.countDocuments({}),
      PetGroup.countDocuments({}),
      PetEvent.countDocuments({}),
    ]);

    res.json({
      success: true,
      data: { users, pets, listings, posts, groups, events },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUsers = async (_req, res) => {
  try {
    const users = await User.find({}).select('name email role phone isActive createdAt').sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.setUserStatus = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive: !!req.body.isActive },
      { new: true }
    ).select('name email isActive');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getListings = async (_req, res) => {
  try {
    const listings = await Listing.find({}).populate('ownerId', 'name email').sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSocialPosts = async (_req, res) => {
  try {
    const posts = await SocialPost.find({}).populate('authorId', 'name').sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
