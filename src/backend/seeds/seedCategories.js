// ================================
// FILE: backend/seeds/seedCategories.js
// ================================
const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
  // Cat Categories
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
  },
  // Dog Categories
  {
    name: 'dog-food',
    displayName: 'Dog Food',
    icon: '🍖',
    description: 'Premium nutrition for your canine friends',
    petType: 'dog'
  },
  {
    name: 'dog-toys',
    displayName: 'Dog Toys',
    icon: '🎾',
    description: 'Fun and engaging toys for dogs',
    petType: 'dog'
  },
  {
    name: 'dog-accessories',
    displayName: 'Dog Accessories',
    icon: '🦴',
    description: 'Essential accessories for dog care',
    petType: 'dog'
  },
  {
    name: 'dog-clothing',
    displayName: 'Dog Clothing',
    icon: '👚',
    description: 'Stylish clothing for your dog',
    petType: 'dog'
  },
  {
    name: 'dog-grooming',
    displayName: 'Dog Grooming',
    icon: '✂️',
    description: 'Grooming supplies for dog care',
    petType: 'dog'
  },
  {
    name: 'dog-pharmacy',
    displayName: 'Dog Pharmacy',
    icon: '💉',
    description: 'Health and wellness products for dogs',
    petType: 'dog'
  },
  // Bird Categories
  {
    name: 'bird-food',
    displayName: 'Bird Food',
    icon: '🌾',
    description: 'Premium nutrition for your feathered friends',
    petType: 'bird'
  },
  {
    name: 'bird-toys',
    displayName: 'Bird Toys',
    icon: '🪜',
    description: 'Fun and engaging toys for birds',
    petType: 'bird'
  },
  {
    name: 'bird-accessories',
    displayName: 'Bird Accessories',
    icon: '🪺',
    description: 'Essential accessories for bird care',
    petType: 'bird'
  },
  {
    name: 'bird-grooming',
    displayName: 'Bird Grooming',
    icon: '🪶',
    description: 'Grooming supplies for bird care',
    petType: 'bird'
  },
  {
    name: 'bird-pharmacy',
    displayName: 'Bird Pharmacy',
    icon: '💊',
    description: 'Health and wellness products for birds',
    petType: 'bird'
  },
  // Pigeon Categories
  {
    name: 'pigeon-food',
    displayName: 'Pigeon Food',
    icon: '🌾',
    description: 'Premium nutrition for your pigeons',
    petType: 'pigeon'
  },
  {
    name: 'pigeon-toys',
    displayName: 'Pigeon Toys',
    icon: '🪧',
    description: 'Fun and engaging toys for pigeons',
    petType: 'pigeon'
  },
  {
    name: 'pigeon-accessories',
    displayName: 'Pigeon Accessories',
    icon: '🏠',
    description: 'Essential accessories for pigeon care',
    petType: 'pigeon'
  },
  {
    name: 'pigeon-grooming',
    displayName: 'Pigeon Grooming',
    icon: '🪶',
    description: 'Grooming supplies for pigeon care',
    petType: 'pigeon'
  },
  {
    name: 'pigeon-pharmacy',
    displayName: 'Pigeon Pharmacy',
    icon: '💊',
    description: 'Health and wellness products for pigeons',
    petType: 'pigeon'
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
