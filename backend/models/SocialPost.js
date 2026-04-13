const mongoose = require('mongoose');

const socialPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PetGroup',
    },
    text: { type: String, trim: true, default: '' },
    media: [{ type: String }],
    mediaType: {
      type: String,
      enum: ['none', 'image', 'video', 'mixed'],
      default: 'none',
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    shares: { type: Number, default: 0 },
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    petReactions: {
      love: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      funny: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      cute: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    isSpamFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SocialPost', socialPostSchema);
