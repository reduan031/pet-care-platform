const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    listingType: {
      type: String,
      enum: ['sell', 'boarding', 'adopt'],
      required: true,
    },
    petType: {
      type: String,
      enum: ['cat', 'dog', 'bird', 'pigeon', 'rabbit', 'fish', 'other'],
      required: true,
    },
    breed: { type: String, trim: true },
    ageMonths: { type: Number, min: 0, default: 0 },
    price: { type: Number, min: 0, default: 0 },
    isFreeAdoption: { type: Boolean, default: false },
    locationText: { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [90.4125, 23.8103], // [lng, lat]
      },
    },
    media: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'paused', 'closed'],
      default: 'active',
    },
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        review: { type: String, trim: true, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    avgRating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { timestamps: true }
);

listingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Listing', listingSchema);
