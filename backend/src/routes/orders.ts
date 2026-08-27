import { Router } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { getNextToken } from '../services/token';
import { Server } from 'socket.io';
import nodemailer from 'nodemailer';
import path from 'path';
import dns from 'dns';

// Fix for Render/Docker environments where IPv6 is not routed properly
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { items, customerPhone, paymentMethod = 'UPI', discountPercentage = 0 } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ error: `Product not found: ${item.productId}` });
      if (!product.available) return res.status(400).json({ error: `Product unavailable: ${product.name}` });

      const customizations = item.customizations || [];
      
      let extraPriceSum = 0;
      const validCustomizations: { name: string; extraPrice: number }[] = [];

      for (const reqCust of customizations) {
        const custName = typeof reqCust === 'string' ? reqCust : reqCust.name;
        const matchingOption = product.customizationOptions?.find((o: any) => o.name === custName);
        if (matchingOption) {
          extraPriceSum += matchingOption.extraPrice || 0;
          validCustomizations.push({ name: matchingOption.name, extraPrice: matchingOption.extraPrice || 0 });
        } else {
          // Check if it's an optional ADD-ON product
          const addOnProduct = await Product.findOne({ name: custName, category: 'ADD-ONS' });
          if (addOnProduct) {
            extraPriceSum += addOnProduct.price;
            validCustomizations.push({ name: custName, extraPrice: addOnProduct.price });
          } else {
            validCustomizations.push({ name: custName, extraPrice: 0 });
          }
        }
      }

      const finalPrice = product.price + extraPriceSum;
      const quantity = item.quantity;
      subtotal += finalPrice * quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity,
        price: finalPrice,
        customizations: validCustomizations,
        category: product.category,
      });
    }

    const { tokenNumber, tokenDate } = await getNextToken();

    const discountAmount = Math.round(subtotal * (discountPercentage / 100));
    const total = subtotal - discountAmount;

    const order = new Order({
      tokenNumber,
      tokenDate,
      paymentMethod,
      customerPhone,
      items: orderItems,
      subtotal,
      discountPercentage,
      discountAmount,
      total,
      status: 'NEW',
    });

    await order.save();

    const io: Server = req.app.get('io');
    if (io) {
      io.emit('order:created', order);
    }

    res.status(201).json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/today', async (req, res) => {
  try {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
    const dateFormatter = new Intl.DateTimeFormat('en-CA', options);
    const dateParts = dateFormatter.formatToParts(now);
    const year = dateParts.find((p) => p.type === 'year')?.value;
    const month = dateParts.find((p) => p.type === 'month')?.value;
    const day = dateParts.find((p) => p.type === 'day')?.value;
    const today = `${year}-${month}-${day}`;

    const orders = await Order.find({ tokenDate: today }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
    const dateFormatter = new Intl.DateTimeFormat('en-CA', options);
    const dateParts = dateFormatter.formatToParts(now);
    const year = dateParts.find((p) => p.type === 'year')?.value;
    const month = dateParts.find((p) => p.type === 'month')?.value;
    const day = dateParts.find((p) => p.type === 'day')?.value;
    const today = `${year}-${month}-${day}`;
    
    // Yesterday
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayParts = dateFormatter.formatToParts(yesterdayDate);
    const yYear = yesterdayParts.find((p) => p.type === 'year')?.value;
    const yMonth = yesterdayParts.find((p) => p.type === 'month')?.value;
    const yDay = yesterdayParts.find((p) => p.type === 'day')?.value;
    const yesterday = `${yYear}-${yMonth}-${yDay}`;

    const todayOrders = await Order.find({ tokenDate: today, status: { $ne: 'CANCELLED' } });
    const yesterdayOrders = await Order.find({ tokenDate: yesterday, status: { $ne: 'CANCELLED' } });

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.total, 0);
    
    const todayAOV = todayOrders.length ? todayRevenue / todayOrders.length : 0;
    const yesterdayAOV = yesterdayOrders.length ? yesterdayRevenue / yesterdayOrders.length : 0;

    // Top products
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    todayOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += (item.price * item.quantity);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Hourly sales for today
    const hourlySales = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      revenue: 0,
      orders: 0
    }));
    
    todayOrders.forEach(order => {
      const orderHour = new Date(order.createdAt).getHours();
      // Ensure we map correctly in UTC vs IST if needed, but since we use basic getHours it's server time based.
      if (orderHour >= 0 && orderHour < 24) {
        hourlySales[orderHour].revenue += order.total;
        hourlySales[orderHour].orders += 1;
      }
    });

    // Calculate total units sold excluding addons
    let todayUnitsSold = 0;
    todayOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (item.category !== 'ADD-ONS') {
          todayUnitsSold += item.quantity;
        }
      });
    });

    let cashOrders = 0;
    let upiOrders = 0;
    let cashRevenue = 0;
    let upiRevenue = 0;

    todayOrders.forEach(order => {
      // @ts-ignore - Handle possible lack of paymentMethod in older records by defaulting to CASH
      if (order.paymentMethod === 'UPI') {
        upiOrders += 1;
        upiRevenue += order.total;
      } else {
        cashOrders += 1;
        cashRevenue += order.total;
      }
    });

    res.json({
      today: {
        revenue: todayRevenue,
        orders: todayOrders.length,
        aov: todayAOV,
        unitsSold: todayUnitsSold
      },
      yesterday: {
        revenue: yesterdayRevenue,
        orders: yesterdayOrders.length,
        aov: yesterdayAOV
      },
      paymentMetrics: {
        cash: { orders: cashOrders, revenue: cashRevenue },
        upi: { orders: upiOrders, revenue: upiRevenue }
      },
      topProducts,
      hourlySales: hourlySales.filter(h => h.orders > 0 || parseInt(h.hour) >= 8 && parseInt(h.hour) <= 22) // Filter relevant hours
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/token/:token', async (req, res) => {
  try {
    const order = await Order.findOne({ tokenNumber: Number(req.params.token) }).sort({ createdAt: -1 });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['NEW', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Validate state transition
    const currentStatus = order.status;
    const allowedTransitions: Record<string, string[]> = {
      'NEW': ['PREPARING', 'CANCELLED'],
      'PREPARING': ['READY', 'CANCELLED'],
      'READY': ['DELIVERED']
    };

    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({ error: `Cannot transition from ${currentStatus} to ${status}` });
    }

    order.status = status;
    const now = new Date();
    if (status === 'PREPARING') order.preparingAt = now;
    if (status === 'READY') order.readyAt = now;
    if (status === 'DELIVERED') order.deliveredAt = now;
    if (status === 'CANCELLED') order.cancelledAt = now;

    await order.save();

    const io: Server = req.app.get('io');
    if (io) {
      io.emit('order:status-updated', order);
    }

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/email-invoice', async (req, res) => {
  try {
    const { email, orderId, pdfBase64, tokenNumber } = req.body;
    if (!email || !pdfBase64) {
      return res.status(400).json({ error: 'Email and PDF data are required' });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ error: 'Email service is not configured on the server. Please check .env settings.' });
    }

    // Manually force IPv4 resolution since Render struggles with IPv6
    const dns = require('dns');
    const { promisify } = require('util');
    const resolve4 = promisify(dns.resolve4);
    
    let smtpHost = 'smtp.gmail.com';
    try {
      const ips = await resolve4('smtp.gmail.com');
      if (ips && ips.length > 0) {
        smtpHost = ips[0];
      }
    } catch (e) {
      console.error('Failed to resolve smtp.gmail.com IPv4', e);
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: 587, // Try STARTTLS on 587 if 465 is blocked by Google/Render
      secure: false, // Must be false for 587
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.replace(/\s+/g, '') // Strip spaces from App Password
      },
      tls: {
        servername: 'smtp.gmail.com', // Required when connecting via IP address
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      socketTimeout: 15000
    });

    const base64Data = pdfBase64.includes('base64,') ? pdfBase64.split('base64,')[1] : pdfBase64;
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    const mailOptions = {
      from: `"Waffle Circle" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Receipt from Waffle Circle (Order #${String(tokenNumber).padStart(3, '0')})`,
      html: `
        <div style="background-color: #000000; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #333333; border-radius: 12px; overflow: hidden;">
            
            <div style="text-align: center; padding: 40px 20px; border-bottom: 1px solid #222222;">
              <img src="https://raw.githubusercontent.com/soumyajitnandi0/ordering-sys/main/frontend/public/logo.jpeg" alt="Waffle Circle Logo" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid #E6B462; margin-bottom: 20px; display: inline-block; object-fit: cover;"/>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 4px;">WAFFLE CIRCLE</h1>
              <p style="color: #E6B462; margin: 10px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">Premium Waffle & Mocktail Counter</p>
            </div>
            
            <div style="padding: 40px 30px; color: #dddddd; line-height: 1.8; font-size: 15px;">
              <h2 style="color: #E6B462; margin-top: 0; font-weight: 400; font-size: 22px; letter-spacing: 1px;">Thank You for Your Visit</h2>
              <p>Dear Guest,</p>
              <p>Thank you for choosing Waffle Circle. It was our absolute privilege to serve you. We are deeply committed to delivering an exceptional culinary experience, and we sincerely hope you enjoyed our premium offerings.</p>
              <p>For your records, please find attached your receipt for <strong>Order #${String(tokenNumber).padStart(3, '0')}</strong>.</p>
              <p>We eagerly look forward to welcoming you back soon.</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed #333333;">
                <p style="margin: 0; color: #aaaaaa; font-size: 14px;">Warmest regards,</p>
                <p style="margin: 5px 0 0 0; color: #ffffff; font-weight: bold; font-size: 16px; letter-spacing: 1px;">Waffle Circle Management</p>
              </div>
            </div>
            
            <div style="background-color: #0a0a0a; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Join our community</p>
              <p style="margin: 8px 0 0 0;">
                <a href="https://instagram.com/waffle.circle" style="color: #E6B462; text-decoration: none; font-weight: bold; font-size: 13px; letter-spacing: 1px;">INSTAGRAM: @WAFFLE.CIRCLE</a>
              </p>
            </div>
            
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `WaffleCircle_Receipt_${tokenNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
