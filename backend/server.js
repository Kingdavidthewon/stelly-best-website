// ============================================
// STELLY-BEST VENTURES — Backend Server
// ============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const paymentRoutes = require('./routes/payments');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON bodies (but NOT for webhook — that needs raw body)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next(); // Skip JSON parsing for webhook (needs raw body for verification)
  } else {
    express.json()(req, res, next);
  }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---- API Routes ----
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'STELLY-BEST VENTURES API',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ---- Start Server ----
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║  STELLY-BEST VENTURES Server Running    ║
  ║  Port: ${PORT}                              ║
  ║  Mode: ${process.env.NODE_ENV || 'development'}                     ║
  ║  Paystack: ${process.env.PAYSTACK_SECRET_KEY ? 'Connected ✓' : 'Not configured ✗'}              ║
  ╚══════════════════════════════════════════╝
  `);
});
