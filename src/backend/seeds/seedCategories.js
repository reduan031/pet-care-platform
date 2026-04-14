// ================================
// FILE: backend/seeds/seedCategories.js
// ================================
const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
  {
    name: 'cat-food',
    displayName: 'Cat Food',
    icon: '🍽️',
    description: 'Premium nutrition for your feline friends',
    petType: 'cat'
  },
  {
    name: 'cat-toys',
    displayName: 'Cat Toys',
    icon: '🧸',
    description: 'Fun and engaging toys for cats',
    petType: 'cat'
  },
  {
    name: 'cat-accessories',
    displayName: 'Cat Accessories',
    icon: '🎀',
    description: 'Essential accessories for cat care',
    petType: 'cat'
  },
  {
    name: 'cat-clothing',
    displayName: 'Cat Clothing',
    icon: '👕',
    description: 'Stylish clothing for your cat',
    petType: 'cat'
  },
  {
    name: 'cat-grooming',
    displayName: 'Cat Grooming',
    icon: '🧼',
    description: 'Grooming supplies for cat care',
    petType: 'cat'
  },
  {
    name: 'cat-pharmacy',
    displayName: 'Cat Pharmacy',
    icon: '💊',
    description: 'Health and wellness products for cats',
    petType: 'cat'
  }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing categories');

    // Insert new categories
    await Category.insertMany(categories);
    console.log('✅ Categories seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
