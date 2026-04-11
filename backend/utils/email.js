// ============================================
// Email Notification Utility
// ============================================
const nodemailer = require('nodemailer');

// Create transporter (configure with real credentials in .env)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send order confirmation to customer
async function sendOrderConfirmation(order) {
  // Skip if email not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-password') {
    console.log('[Email] Skipping — email not configured. Order:', order.orderId);
    return false;
  }

  const itemsList = order.items.map(item =>
    `${item.name} x${item.qty} — ₦${(item.price * item.qty).toLocaleString()}`
  ).join('\n    ');

  const mailOptions = {
    from: `"STELLY-BEST VENTURES" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `Order Confirmed — ${order.orderId} | STELLY-BEST VENTURES`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDFAF4; padding: 2rem; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="color: #1E4D2B; margin: 0;">STELLY-BEST VENTURES</h1>
          <p style="color: #6B6560; font-size: 14px;">Int'l Ltd — Delta State, Nigeria</p>
        </div>

        <div style="background: white; padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem;">
          <h2 style="color: #1E4D2B; margin-top: 0;">Thank you for your order! 🎉</h2>
          <p>Hi ${order.customer.firstName},</p>
          <p>We've received your order and it's being processed. Here are the details:</p>

          <div style="background: #F5EDE4; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <strong>Order ID:</strong> ${order.orderId}<br>
            <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-NG', { dateStyle: 'long' })}<br>
            <strong>Payment Method:</strong> ${order.paymentMethod}<br>
            <strong>Status:</strong> ${order.status}
          </div>

          <h3 style="color: #1E4D2B;">Items Ordered:</h3>
          <pre style="background: #FDFAF4; padding: 1rem; border-radius: 8px; font-size: 14px; line-height: 1.8;">
    ${itemsList}
          </pre>

          <div style="text-align: right; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #1E4D2B;">
            <strong style="font-size: 18px; color: #1E4D2B;">Total: ₦${order.total.toLocaleString()}</strong>
          </div>
        </div>

        <div style="background: white; padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem;">
          <h3 style="color: #1E4D2B; margin-top: 0;">Shipping To:</h3>
          <p style="margin: 0; line-height: 1.6;">
            ${order.customer.firstName} ${order.customer.lastName}<br>
            ${order.customer.address}<br>
            ${order.customer.city}, ${order.customer.state || ''}<br>
            ${order.customer.country}<br>
            ${order.customer.zip || ''}
          </p>
        </div>

        ${order.paymentMethod === 'bank' ? `
        <div style="background: #FDF5E4; padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem; border: 1px solid #C8860A;">
          <h3 style="color: #C8860A; margin-top: 0;">🏦 Bank Transfer Details</h3>
          <p><strong>Bank:</strong> Zenith Bank<br>
          <strong>Account Name:</strong> Stelly-Best Ventures<br>
          <strong>Account Number:</strong> 1229379256</p>
          <p style="font-size: 13px; color: #6B6560;">Please include your Order ID (${order.orderId}) as the transfer reference. Your order will be processed once payment is confirmed.</p>
        </div>
        ` : ''}

        <div style="text-align: center; color: #6B6560; font-size: 13px; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.08);">
          <p>Questions? Reply to this email or WhatsApp us at +234 812 930 5407</p>
          <p>© 2019–2026 STELLY-BEST VENTURES Int'l Ltd. Delta State, Nigeria.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('[Email] Order confirmation sent to:', order.customer.email);
    return true;
  } catch (err) {
    console.error('[Email] Failed to send:', err.message);
    return false;
  }
}

// Notify business owner of new order
async function sendOrderNotification(order) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-password') {
    console.log('[Email] Skipping owner notification — email not configured');
    return false;
  }

  const itemsList = order.items.map(item =>
    `• ${item.name} x${item.qty} — ₦${(item.price * item.qty).toLocaleString()}`
  ).join('<br>');

  const mailOptions = {
    from: `"SBV Orders" <${process.env.EMAIL_USER}>`,
    to: 'stellybestventures@gmail.com',
    subject: `🛒 New Order — ${order.orderId} — ₦${order.total.toLocaleString()}`,
    html: `
      <h2>New Order Received!</h2>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Customer:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
      <p><strong>Email:</strong> ${order.customer.email}</p>
      <p><strong>Phone:</strong> ${order.customer.phone}</p>
      <p><strong>Payment:</strong> ${order.paymentMethod}</p>
      <p><strong>Ship To:</strong> ${order.customer.address}, ${order.customer.city}, ${order.customer.country}</p>
      <hr>
      <p><strong>Items:</strong></p>
      <p>${itemsList}</p>
      <hr>
      <h3>Total: ₦${order.total.toLocaleString()}</h3>
      ${order.customer.notes ? `<p><strong>Notes:</strong> ${order.customer.notes}</p>` : ''}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('[Email] Owner notification sent');
    return true;
  } catch (err) {
    console.error('[Email] Owner notification failed:', err.message);
    return false;
  }
}

module.exports = { sendOrderConfirmation, sendOrderNotification };
