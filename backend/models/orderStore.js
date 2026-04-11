// ============================================
// Simple Order Store (File-based)
// ============================================
// This stores orders in a JSON file for simplicity.
// When traffic grows, migrate to PostgreSQL or MongoDB.
// ============================================
const fs = require('fs');
const path = require('path');

const ORDERS_FILE = path.join(__dirname, '..', 'data', 'orders.json');
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure orders file exists
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
}

function getAllOrders() {
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading orders:', err.message);
    return [];
  }
}

function getOrderById(orderId) {
  const orders = getAllOrders();
  return orders.find(o => o.orderId === orderId) || null;
}

function getOrderByReference(reference) {
  const orders = getAllOrders();
  return orders.find(o => o.paymentReference === reference) || null;
}

function saveOrder(order) {
  const orders = getAllOrders();
  orders.push(order);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  return order;
}

function updateOrderStatus(reference, status, paymentData = {}) {
  const orders = getAllOrders();
  const index = orders.findIndex(o => o.paymentReference === reference);
  if (index === -1) return null;

  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  if (paymentData.paidAt) orders[index].paidAt = paymentData.paidAt;
  if (paymentData.channel) orders[index].paymentChannel = paymentData.channel;
  if (paymentData.paystackId) orders[index].paystackId = paymentData.paystackId;

  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  return orders[index];
}

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderByReference,
  saveOrder,
  updateOrderStatus
};
