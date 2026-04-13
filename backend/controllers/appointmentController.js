// ================================
// FILE: backend/controllers/appointmentController.js
// ================================
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');
const User = require('../models/User');

exports.createAppointment = async (req, res) => {
  try {
    const { pet, doctor, appointmentType, date, timeSlot, symptoms, fee } = req.body;

    const petExists = await Pet.findById(pet);
    if (!petExists) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Check if pet has userId (owner) and user is authorized
    if (!petExists.userId) {
      return res.status(403).json({ success: false, message: 'Pet has no owner assigned' });
    }
    if (petExists.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized - not your pet' });
    }

    // Doctor is optional - can be name string or ObjectId
    // If provided but not a valid ObjectId, treat as doctorName (free text)
    let doctorId = null;
    let doctorName = null;
    
    if (doctor && doctor.trim()) {
      // Check if doctor looks like a MongoDB ObjectId (24 hex chars)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(doctor.trim());
      
      if (isObjectId) {
        // It's an ObjectId - validate as user
        const doctorExists = await User.findById(doctor.trim());
        if (doctorExists && doctorExists.role === 'doctor') {
          doctorId = doctor.trim();
          // Check for existing appointment with this doctor
          const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            date,
            timeSlot,
            status: { $ne: 'cancelled' }
          });
          if (existingAppointment) {
            return res.status(400).json({ success: false, message: 'Time slot already booked' });
          }
        }
      } else {
        // It's a name - store as doctorName
        doctorName = doctor.trim();
      }
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      pet,
      doctor: doctorId,
      doctorName,
      appointmentType,
      date,
      timeSlot,
      symptoms,
      fee
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('user', 'name email phone')
      .populate('pet', 'name type breed')
      .populate('doctor', 'name email phone');

    res.status(201).json({ success: true, data: populatedAppointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('user', 'name email phone')
      .populate('pet', 'name type breed')
      .populate('doctor', 'name email phone')
      .sort('-date');

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('pet', 'name type breed age weight')
      .populate('doctor', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (
      appointment.user._id.toString() !== req.user._id.toString() &&
      appointment.doctor._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { status, diagnosis, prescription, notes } = req.body;

    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.doctor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (status) appointment.status = status;
    if (diagnosis) appointment.diagnosis = diagnosis;
    if (prescription) appointment.prescription = prescription;
    if (notes) appointment.notes = notes;

    if (status === 'completed') {
      const pet = await Pet.findById(appointment.pet);
      if (pet && diagnosis) {
        pet.medicalHistory.push({
          condition: appointment.symptoms,
          diagnosis: diagnosis,
          treatment: prescription ? prescription.map(p => p.medicine).join(', ') : '',
          date: new Date(),
          doctor: req.user._id
        });
        await pet.save();
      }
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('user', 'name email phone')
      .populate('pet', 'name type breed')
      .populate('doctor', 'name email phone');

    res.json({ success: true, data: updatedAppointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (
      appointment.user.toString() !== req.user._id.toString() &&
      appointment.doctor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('pet', 'name type breed')
      .populate('doctor', 'name email phone')
      .sort('-date');

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};