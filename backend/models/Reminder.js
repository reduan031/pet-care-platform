// ================================
// FILE: backend/models/Reminder.js
// ================================
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet' // Optional, if the reminder is tied to a specific pet
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['system', 'booking', 'vaccination', 'medication', 'custom'],
    default: 'system'
  },
  dueDate: {
    type: Date, // When the system should trigger the notification
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'cancelled'],
    default: 'pending'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reminder', reminderSchema);
