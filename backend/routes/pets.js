// ================================
// FILE: backend/routes/pets.js
// ================================
const express = require('express');
const router = express.Router();
const {
  createPet,
  getPets,
  getPet,
  updatePet,
  deletePet,
  getMyPets,
  getPetsForSale
} = require('../controllers/petController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getPets)
  .post(protect, createPet);

router.get('/my-pets', protect, getMyPets);
router.get('/for-sale', getPetsForSale);

router.route('/:id')
  .get(getPet)
  .put(protect, updatePet)
  .delete(protect, deletePet);

module.exports = router;