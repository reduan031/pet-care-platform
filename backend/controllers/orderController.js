// ================================
// FILE: backend/controllers/orderController.js
// ================================
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, deliveryCharge, discount } = req.body;

    console.log('Create order request:', { user: req.user?._id, items: items?.length, paymentMethod }); // Debug

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    // Check authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      // Handle both item._id and item.product (from different cart structures)
      const productId = item._id || item.product;
      
      console.log('Processing item:', { productId, quantity: item.quantity, name: item.name }); // Debug
      
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Invalid cart item: missing product ID' });
      }
      
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${productId}` });
      }

      if (product.stock < (item.quantity || 1)) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}` 
        });
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity || 1,
        price: product.discountPrice || product.price
      });

      totalAmount += (product.discountPrice || product.price) * (item.quantity || 1);

      product.stock -= (item.quantity || 1);
      await product.save({ validateBeforeSave: false });
    }

    const finalAmount = totalAmount + (deliveryCharge || 0) - (discount || 0);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      deliveryCharge: deliveryCharge || 0,
      discount: discount || 0,
      finalAmount
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Create order error:', error); // Debug
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images')
      .sort('-orderDate');

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'seller') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    if (orderStatus === 'delivered') {
      order.deliveryDate = new Date();
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price images')
      .sort('-orderDate');

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
