// ============================================
// Payment Routes — /api/payments
// ============================================
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const paystack = require('../config/paystack');
const { v4: uuidv4 } = require('uuid');
const { saveOrder, updateOrderStatus, getOrderByReference } = require('../models/orderStore');
const { sendOrderConfirmation, sendOrderNotification } = require('../utils/email');

// ---- POST /api/payments/initialize ----
// Frontend calls this to start a Paystack payment
router.post('/initialize', async (req, res) => {
  try {
    const { customer, items, paymentMethod } = req.body;

    // Validate required fields
    if (!customer || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Missing customer details or cart items'
      });
    }

    if (!customer.email || !customer.firstName || !customer.phone || !customer.address || !customer.city || !customer.country) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Calculate total from items (server-side — never trust frontend prices)
    const PRODUCT_PRICES = {
      1: 2500, 2: 2200, 3: 2500, 4: 2200,
      5: 2000, 6: 1500, 7: 1800
    };

    let total = 0;
    const validatedItems = items.map(item => {
      const serverPrice = PRODUCT_PRICES[item.id] || item.price;
      total += serverPrice * item.qty;
      return { ...item, price: serverPrice };
    });

    // Generate unique order ID
    const orderId = 'SBV-' + Date.now().toString(36).toUpperCase() + '-' + uuidv4().slice(0, 4).toUpperCase();
    const reference = 'SBV_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

    // Create order record
    const order = {
      orderId,
      paymentReference: reference,
      paymentMethod: paymentMethod || 'paystack',
      status: paymentMethod === 'bank' ? 'awaiting_transfer' : 'pending',
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName || '',
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state || '',
        country: customer.country,
        zip: customer.zip || '',
        notes: customer.notes || ''
      },
      items: validatedItems,
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save order
    saveOrder(order);

    // If bank transfer, just return order details (no Paystack needed)
    if (paymentMethod === 'bank') {
      // Send emails
      sendOrderConfirmation(order);
      sendOrderNotification(order);

      return res.json({
        success: true,
        message: 'Order placed — awaiting bank transfer',
        data: {
          orderId: order.orderId,
          reference,
          total,
          paymentMethod: 'bank',
          bankDetails: {
            bank: 'Zenith Bank',
            accountName: 'Stelly-Best Ventures',
            accountNumber: '1229379256'
          }
        }
      });
    }

    // Initialize Paystack transaction
    const paystackResponse = await paystack.post('/transaction/initialize', {
      email: customer.email,
      amount: total * 100, // Paystack expects kobo (₦1 = 100 kobo)
      reference,
      currency: 'NGN',
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?payment=success&ref=${reference}`,
      metadata: {
        orderId,
        customer_name: `${customer.firstName} ${customer.lastName}`,
        customer_phone: customer.phone,
        custom_fields: [
          { display_name: 'Order ID', variable_name: 'order_id', value: orderId },
          { display_name: 'Shipping Address', variable_name: 'address', value: `${customer.address}, ${customer.city}, ${customer.country}` }
        ]
      }
    });

    if (paystackResponse.data.status) {
      console.log(`[Payment] Initialized: ${orderId} — ₦${total.toLocaleString()}`);
      return res.json({
        success: true,
        message: 'Payment initialized',
        data: {
          orderId,
          reference,
          total,
          authorization_url: paystackResponse.data.data.authorization_url,
          access_code: paystackResponse.data.data.access_code
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to initialize payment'
      });
    }

  } catch (err) {
    console.error('[Payment] Initialize error:', err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: 'Payment initialization failed. Please try again.'
    });
  }
});

// ---- POST /api/payments/verify/:reference ----
// Frontend calls this after customer returns from Paystack
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await paystack.get(`/transaction/verify/${reference}`);
    const data = response.data.data;

    if (data.status === 'success') {
      // Update order status
      const order = updateOrderStatus(reference, 'paid', {
        paidAt: data.paid_at,
        channel: data.channel,
        paystackId: data.id
      });

      if (order) {
        // Send confirmation emails
        sendOrderConfirmation(order);
        sendOrderNotification(order);
      }

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          orderId: order?.orderId,
          status: 'paid',
          amount: data.amount / 100,
          channel: data.channel,
          paidAt: data.paid_at
        }
      });
    } else {
      return res.json({
        success: false,
        message: `Payment status: ${data.status}`,
        data: { status: data.status }
      });
    }

  } catch (err) {
    console.error('[Payment] Verify error:', err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

// ---- POST /api/payments/webhook ----
// Paystack sends payment events here automatically
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(req.body)
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      console.log('[Webhook] Invalid signature — rejected');
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(req.body);
    console.log(`[Webhook] Event received: ${event.event}`);

    // Handle successful charge
    if (event.event === 'charge.success') {
      const data = event.data;
      const reference = data.reference;

      const order = updateOrderStatus(reference, 'paid', {
        paidAt: data.paid_at,
        channel: data.channel,
        paystackId: data.id
      });

      if (order) {
        console.log(`[Webhook] Order ${order.orderId} marked as paid — ₦${data.amount / 100}`);
        sendOrderConfirmation(order);
        sendOrderNotification(order);
      }
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).send('OK');

  } catch (err) {
    console.error('[Webhook] Error:', err.message);
    res.status(200).send('OK'); // Still respond 200 to prevent Paystack retries
  }
});

module.exports = router;
