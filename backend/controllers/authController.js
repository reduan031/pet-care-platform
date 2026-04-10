// ================================
// FILE: backend/controllers/authController.js
// ================================
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    let addresses = [];
    if (req.body.address) {
      addresses.push({
        addressType: 'home',
        city: req.body.address,
        isDefault: true
      });
    }

    const user = await User.create({ name, email, password, phone, role, addresses });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.sendOtp = async (req, res) => {
  // To be implemented: Twilio/Email OTP logic
  res.json({ success: true, message: 'OTP sent to provided contact' });
};

exports.verifyOtp = async (req, res) => {
  // To be implemented: Verify OTP logic
  res.json({ success: true, message: 'OTP verified successfully' });
};

exports.forgotPassword = async (req, res) => {
  // To be implemented: Generate reset token and send email
  res.json({ success: true, message: 'Password reset link sent' });
};

exports.resetPassword = async (req, res) => {
  // To be implemented: Validate token and update password
  res.json({ success: true, message: 'Password reset successfully' });
};
