// ================================
// FILE: backend/controllers/bookingController.js
// ================================
const Booking = require('../models/Booking');
const Consultation = require('../models/Consultation');

exports.createBooking = async (req, res) => {
  try {
    const booking = await Booking.create({ ...req.body, userId: req.user._id });
    
    // Automatically provision a consultation room stub if booking is specifically for 'vet' remote consultation
    if (req.body.serviceType === 'vet' && req.body.isRemote) {
      await Consultation.create({
        bookingId: booking._id,
        vetId: booking.providerId,
        userId: booking.userId,
        petId: booking.petId,
        roomId: `ROOM_${booking._id}`,
        status: 'scheduled'
      });
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    // Allows both providers and users to fetch their bookings
    const query = req.user.role === 'doctor' || req.user.role === 'sitter' 
      ? { providerId: req.user._id } 
      : { userId: req.user._id };

    const bookings = await Booking.find(query)
      .populate('userId', 'name')
      .populate('providerId', 'name')
      .populate('petId', 'name')
      .sort('date');

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only provider or admin should approve/cancel generally, or user can cancel
    if (booking.providerId.toString() !== req.user._id.toString() && 
        booking.userId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = req.body.status;
    await booking.save();
    
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
