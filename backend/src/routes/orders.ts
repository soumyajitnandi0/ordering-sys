import { Router } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { getNextToken } from '../services/token';
import { Server } from 'socket.io';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { items, customerPhone, paymentMethod = 'UPI' } = req.body;
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
          validCustomizations.push({ name: custName, extraPrice: 0 });
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

    const order = new Order({
      tokenNumber,
      tokenDate,
      paymentMethod,
      customerPhone,
      items: orderItems,
      subtotal,
      total: subtotal,
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
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
    const dateFormatter = new Intl.DateTimeFormat('en-CA', options);
    const dateParts = dateFormatter.formatToParts(now);
    const year = dateParts.find((p) => p.type === 'year')?.value;
    const month = dateParts.find((p) => p.type === 'month')?.value;
    const day = dateParts.find((p) => p.type === 'day')?.value;
    const today = `${year}-${month}-${day}`;

    const order = await Order.findOne({ tokenNumber: Number(req.params.token), tokenDate: today });
    if (!order) return res.status(404).json({ error: 'Order not found for today' });
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

export default router;
