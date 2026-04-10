// ================================
// FILE: backend/controllers/petController.js
// ================================
const Pet = require('../models/Pet');

exports.createPet = async (req, res) => {
  try {
    const pet = await Pet.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPets = async (req, res) => {
  try {
    const { type, breed, minPrice, maxPrice } = req.query;
    let query = {};

    if (type) query.type = type;
    if (breed) query.breed = new RegExp(breed, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const pets = await Pet.find(query).populate('userId', 'name email phone');
    res.json({ success: true, count: pets.length, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('userId', 'name email phone');
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    res.json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePet = async (req, res) => {
  try {
    let pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    if (pet.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    if (pet.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await pet.deleteOne();
    res.json({ success: true, message: 'Pet deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ userId: req.user._id });
    res.json({ success: true, count: pets.length, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPetsForSale = async (req, res) => {
  try {
    const { type, breed, minPrice, maxPrice } = req.query;
    let query = { forSale: true };

    if (type) query.type = type;
    if (breed) query.breed = new RegExp(breed, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const pets = await Pet.find(query).populate('userId', 'name phone');
    res.json({ success: true, count: pets.length, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
