// ================================
// FILE: backend/models/Pet.js
// ================================
const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Pet name is required']
  },
  type: {
    type: String,
    enum: ['cat', 'dog', 'bird', 'pigeon', 'other', 'rabbit', 'fish'],
    required: true
  },
  breed: String,
  age: {
    years: { type: Number, default: 0 },
    months: { type: Number, default: 0 }
  },
  birthDate: Date,
  gender: {
    type: String,
    enum: ['male', 'female'],
  },
  weight: Number,
  weightUnit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
  color: String,
  microchip: String,
  photos: [String],
  vaccinationRecords: [{
    name: String,
    date: Date,
    nextDue: Date,
    certificate: String // URL
  }],
  medicalHistory: String,
  allergies: [String],
  documents: [String], // URLs
  reminders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reminder'
  }],
  forSale: {
    type: Boolean,
    default: false
  },
  price: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
petSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Pet', petSchema);