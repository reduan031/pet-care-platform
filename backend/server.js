// ================================
// FILE: backend/server.js
// Powered by PawVerse
// ================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    
    // Initialize background cron services
    const { initScheduler } = require('./services/scheduler');
    initScheduler();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/products', require('./routes/products'));
app.use('/api/services', require('./routes/services'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/lostfound', require('./routes/lostFound'));
app.use('/api/health', require('./routes/health'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Pet Care Platform API Running' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});