// ================================
// FILE: backend/server.js
// Powered by PawVerse
// ================================
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const { setIO } = require('./utils/socket');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
setIO(io);

io.on('connection', (socket) => {
  socket.on('join-user-room', (userId) => {
    if (userId) socket.join(`user:${userId}`);
  });

  socket.on('join-conversation', (conversationId) => {
    if (conversationId) socket.join(`conversation:${conversationId}`);
  });

  socket.on('disconnect', () => {});
});

// Middleware
// Allow base64 image payloads from Add Pet / Lost & Found / Pet Social forms.
app.use(express.json({ limit: '100mb', extended: true }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());

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
app.use('/api/categories', require('./routes/categories'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/pet-social', require('./routes/petSocial'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/lostfound', require('./routes/lostFound'));
app.use('/api/health', require('./routes/health'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/admin', require('./routes/admin'));

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
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});