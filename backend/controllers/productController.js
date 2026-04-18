// ================================
// FILE: backend/controllers/productController.js
// ================================
const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    console.log('User:', req.user);
    const product = await Product.create({ ...req.body, sellerId: req.user._id });
    console.log('Product created successfully:', product);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error details:', error.message);
    console.error('Validation errors:', error.errors);
    res.status(500).json({ success: false, message: error.message, details: error.errors });
  }
};

exports.getProducts = async (req, res) => {
  try {
    console.log('Getting products with query:', req.query);
    const { category, petType, minPrice, maxPrice, search } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (petType) query.petType = { $in: [petType, 'all'] };
    if (search) query.$text = { $search: search };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query).populate('sellerId', 'name email');
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'name email phone');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.rating.count = product.reviews.length;
    product.rating.average = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};