// ============================================
// Order Routes — /api/orders
// ============================================
const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, getOrderByReference } = require('../models/orderStore');

// ---- GET /api/orders ----
// Get all orders (admin use)
router.get('/', (req, res) => {
  const orders = getAllOrders();
  // Return newest first
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// ---- GET /api/orders/:orderId ----
// Get a specific order by order ID
router.get('/:orderId', (req, res) => {
  const order = getOrderById(req.params.orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }
  res.json({ success: true, data: order });
});

// ---- GET /api/orders/ref/:reference ----
// Get order by payment reference (used after Paystack redirect)
router.get('/ref/:reference', (req, res) => {
  const order = getOrderByReference(req.params.reference);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }
  res.json({ success: true, data: order });
});

module.exports = router;
