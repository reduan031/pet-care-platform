const Listing = require('../models/Listing');
const { Conversation, Notification } = require('../models/PetSocial');
const { getIO } = require('../utils/socket');

const sanitizeText = (v = '') => String(v).trim();
const spamWords = ['spam', 'scam', 'fake', 'xxx'];

const isSpam = (text = '') => {
  const body = text.toLowerCase();
  return spamWords.some((word) => body.includes(word));
};

exports.createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      listingType,
      petType,
      breed,
      ageMonths,
      price,
      locationText,
      lat,
      lng,
      media,
      petId,
    } = req.body;

    const freeAdoption = listingType === 'adopt' && Number(price || 0) === 0;
    const listing = await Listing.create({
      ownerId: req.user._id,
      petId: petId || undefined,
      title: sanitizeText(title),
      description: sanitizeText(description),
      listingType,
      petType,
      breed: sanitizeText(breed),
      ageMonths: Number(ageMonths) || 0,
      price: Number(price || 0),
      isFreeAdoption: freeAdoption,
      locationText: sanitizeText(locationText),
      location: {
        type: 'Point',
        coordinates: [Number(lng || 90.4125), Number(lat || 23.8103)],
      },
      media: Array.isArray(media) ? media.slice(0, 8) : [],
    });

    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchListings = async (req, res) => {
  try {
    const {
      type,
      petType,
      breed,
      minPrice,
      maxPrice,
      minAge,
      maxAge,
      lat,
      lng,
      radiusKm,
      page = 1,
      limit = 12,
      q,
    } = req.query;

    const query = { status: 'active' };
    if (type) query.listingType = type;
    if (petType) query.petType = petType;
    if (breed) query.breed = new RegExp(breed, 'i');
    if (q) query.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];

    if (minAge || maxAge) {
      query.ageMonths = {};
      if (minAge) query.ageMonths.$gte = Number(minAge);
      if (maxAge) query.ageMonths.$lte = Number(maxAge);
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let mongoQuery = Listing.find(query).populate('ownerId', 'name email phone');
    if (lat && lng && radiusKm) {
      mongoQuery = Listing.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            $maxDistance: Number(radiusKm) * 1000,
          },
        },
      }).populate('ownerId', 'name email phone');
    }

    const pageNum = Number(page);
    const lim = Number(limit);
    const data = await mongoQuery
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * lim)
      .limit(lim);

    res.json({ success: true, page: pageNum, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('ownerId', 'name email phone');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rateSeller = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    const { rating, review } = req.body;
    const cleanReview = sanitizeText(review);
    if (isSpam(cleanReview)) {
      return res.status(400).json({ success: false, message: 'Review rejected by spam filter' });
    }

    listing.ratings.push({
      userId: req.user._id,
      rating: Number(rating),
      review: cleanReview,
    });
    const total = listing.ratings.reduce((acc, item) => acc + item.rating, 0);
    listing.avgRating = Number((total / listing.ratings.length).toFixed(2));
    await listing.save();

    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.messageOwner = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    const participants = [req.user._id.toString(), listing.ownerId.toString()].sort();
    let conversation = await Conversation.findOne({ participants });
    if (!conversation) {
      conversation = await Conversation.create({ participants, lastMessageAt: new Date() });
    }

    const notification = await Notification.create({
      userId: listing.ownerId,
      type: 'message',
      text: 'You received a new inquiry from your listing.',
      data: { listingId: listing._id, conversationId: conversation._id },
    });
    const io = getIO();
    if (io) {
      io.to(`user:${listing.ownerId.toString()}`).emit('notification:new', notification);
      io.to(`conversation:${conversation._id.toString()}`).emit('conversation:updated', {
        conversationId: conversation._id,
      });
    }

    res.json({ success: true, data: { conversationId: conversation._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPaymentIntent = async (req, res) => {
  try {
    // Stub endpoint for Stripe/PayPal wiring.
    const amount = Number(req.body.amount || 0);
    const provider = req.body.provider === 'paypal' ? 'paypal' : 'stripe';
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
    }

    res.json({
      success: true,
      data: {
        provider,
        clientSecret: `demo_${provider}_intent_${Date.now()}`,
        amount,
        currency: 'BDT',
      },
      message: 'Connect provider SDK and server secret key for live payments.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
