"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const token_1 = require("../services/token");
const socket_io_1 = require("socket.io");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !items.length) {
            return res.status(400).json({ error: 'Order must contain items' });
        }
        let subtotal = 0;
        const orderItems = [];
        for (const item of items) {
            const product = await Product_1.default.findById(item.productId);
            if (!product)
                return res.status(400).json({ error: `Product not found: ${item.productId}` });
            if (!product.available)
                return res.status(400).json({ error: `Product unavailable: ${product.name}` });
            const price = product.price;
            const quantity = item.quantity;
            subtotal += price * quantity;
            orderItems.push({
                productId: product._id,
                name: product.name,
                quantity,
                price,
            });
        }
        const { tokenNumber, tokenDate } = await (0, token_1.getNextToken)();
        const order = new Order_1.default({
            tokenNumber,
            tokenDate,
            items: orderItems,
            subtotal,
            total: subtotal,
            status: 'NEW',
        });
        await order.save();
        const io = req.app.get('io');
        if (io) {
            io.emit('order:created', order);
        }
        res.status(201).json(order);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/', async (req, res) => {
    try {
        const orders = await Order_1.default.find().sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/today', async (req, res) => {
    try {
        const now = new Date();
        const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
        const dateFormatter = new Intl.DateTimeFormat('en-CA', options);
        const dateParts = dateFormatter.formatToParts(now);
        const year = dateParts.find((p) => p.type === 'year')?.value;
        const month = dateParts.find((p) => p.type === 'month')?.value;
        const day = dateParts.find((p) => p.type === 'day')?.value;
        const today = `${year}-${month}-${day}`;
        const orders = await Order_1.default.find({ tokenDate: today }).sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/token/:token', async (req, res) => {
    try {
        const now = new Date();
        const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
        const dateFormatter = new Intl.DateTimeFormat('en-CA', options);
        const dateParts = dateFormatter.formatToParts(now);
        const year = dateParts.find((p) => p.type === 'year')?.value;
        const month = dateParts.find((p) => p.type === 'month')?.value;
        const day = dateParts.find((p) => p.type === 'day')?.value;
        const today = `${year}-${month}-${day}`;
        const order = await Order_1.default.findOne({ tokenNumber: Number(req.params.token), tokenDate: today });
        if (!order)
            return res.status(404).json({ error: 'Order not found for today' });
        res.json(order);
    }
    catch (err) {
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
        const order = await Order_1.default.findById(req.params.id);
        if (!order)
            return res.status(404).json({ error: 'Order not found' });
        // Validate state transition
        const currentStatus = order.status;
        const allowedTransitions = {
            'NEW': ['PREPARING', 'CANCELLED'],
            'PREPARING': ['READY', 'CANCELLED'],
            'READY': ['DELIVERED']
        };
        if (!allowedTransitions[currentStatus]?.includes(status)) {
            return res.status(400).json({ error: `Cannot transition from ${currentStatus} to ${status}` });
        }
        order.status = status;
        const now = new Date();
        if (status === 'PREPARING')
            order.preparingAt = now;
        if (status === 'READY')
            order.readyAt = now;
        if (status === 'DELIVERED')
            order.deliveredAt = now;
        if (status === 'CANCELLED')
            order.cancelledAt = now;
        await order.save();
        const io = req.app.get('io');
        if (io) {
            io.emit('order:status-updated', order);
        }
        res.json(order);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map