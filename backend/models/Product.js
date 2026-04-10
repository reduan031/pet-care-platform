// ================================
// FILE: backend/models/Product.js
// ================================
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['food', 'accessory', 'toy', 'clothing', 'grooming', 'medicine', 'cage', 'other'],
    required: true
  },
  petType: {
    type: String,
    enum: ['cat', 'dog', 'bird', 'pigeon', 'all'],
    required: true
  },
  subCategory: String,
  brand: String,
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  images: {
    type: [String],
    validate: [arr => arr.length > 0, 'At least one image is required']
  },
  specifications: {
    type: Map,
    of: String
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  isSubscriptionAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);