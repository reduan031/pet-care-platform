// ================================
// FILE: backend/models/Category.js
// ================================
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true
  },
  icon: {
    type: String,
    default: '📦'
  },
  description: {
    type: String,
    trim: true
  },
  petType: {
    type: String,
    enum: ['cat', 'dog', 'bird', 'pigeon', 'all'],
    default: 'all'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', categorySchema);
