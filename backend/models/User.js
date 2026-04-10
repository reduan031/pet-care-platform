// ================================
// FILE: backend/models/User.js
// ================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'seller', 'doctor', 'admin'],
    default: 'user'
  },
  addresses: [{
    addressType: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    street: String,
    city: String,
    area: String,
    zipCode: String,
    lat: Number,
    lng: Number,
    isDefault: { type: Boolean, default: false }
  }],
  location: { lat: Number, lng: Number },
  notificationPreferences: { 
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  language: { type: String, enum: ['en', 'bn', 'hi'], default: 'en' },
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  profilePhoto: { type: String, default: 'default-avatar.png' },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema)