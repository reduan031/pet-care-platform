// ================================
// FILE: backend/seeds/seedCategories.js
// ================================
const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const PET_TYPES = [
  { id: 'dog', name: 'Dog', icon: '🐶' },
  { id: 'cat', name: 'Cat', icon: '🐱' },
  { id: 'bird', name: 'Bird', icon: '🦜' },
  { id: 'fish', name: 'Fish', icon: '🐠' },
  { id: 'rabbit', name: 'Rabbit', icon: '🐰' },
  { id: 'horse', name: 'Horse', icon: '🐴' }
];

const CATEGORIES = [
  { id: 'food', displayName: 'Food', icon: '🍽️', description: 'Premium nutrition for your pet' },
  { id: 'accessories', displayName: 'Accessories', icon: '🎀', description: 'Collars, beds, leashes, and more' },
  { id: 'pharmacy', displayName: 'Pharmacy / Medicine', icon: '💊', description: 'Dewormers, vitamins, first aid' },
  { id: 'grooming', displayName: 'Grooming', icon: '🧼', description: 'Grooming supplies for your pet' },
  { id: 'housing', displayName: 'Housing / Bedding', icon: '🏠', description: 'Homes, cages, tanks, bedding' },
  { id: 'toys', displayName: 'Toys', icon: '🧸', description: 'Fun and engaging toys' },
  { id: 'training', displayName: 'Training', icon: '🎓', description: 'Pads, clickers, sprays' },
  { id: 'health', displayName: 'Health & Wellness', icon: '💪', description: 'Supplements, dental care, wellness' }
];

const generateCategories = () => {
  const categories = [];
  
  PET_TYPES.forEach(pet => {
    CATEGORIES.forEach(category => {
      categories.push({
        name: `${pet.id}-${category.id}`,
        displayName: category.displayName,
        icon: category.icon,
        description: `${category.description} - ${pet.name}`,
        petType: pet.id
      });
    });
  });
  
  return categories;
};

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing categories');

    // Insert new categories
    const categories = generateCategories();
    await Category.insertMany(categories);
    console.log(`✅ Categories seeded successfully: ${categories.length} categories for ${PET_TYPES.length} pet types`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
