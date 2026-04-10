// ================================
// FILE: backend/models/LostFound.js
// ================================
const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] } // [longitude, latitude]
  },
  address: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  },
  photos: [String],
  contactInfo: {
    phone: String,
    email: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

lostFoundSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('LostFound', lostFoundSchema);
