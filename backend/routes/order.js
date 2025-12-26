import express from 'express';
import Order from '../models/Order.js';
import Menu from '../models/Menu.js';
import Table from '../models/Table.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create order (authenticated users)
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, table } = req.body;
    let totalPrice = 0;

    // Fetch customer details
    const customer = await User.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check table availability if provided
    if (table) {
      const tableDoc = await Table.findById(table);
      if (!tableDoc) {
        return res.status(400).json({ message: 'Table not found' });
      }
      if (tableDoc.status !== 'available') {
        return res.status(400).json({ message: 'Table not available' });
      }
    }

    // Calculate total price
    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItem);
      if (!menuItem || !menuItem.available) {
        return res.status(400).json({ message: `Menu item ${item.menuItem} not available` });
      }
      totalPrice += menuItem.price * item.quantity;
    }

    const order = new Order({
      customer: req.user.id,
      customerName: customer.name,
      items,
      totalPrice,
      table,
    });

    await order.save();

    // Update table status to occupied if table was selected
    if (table) {
      await Table.findByIdAndUpdate(table, { status: 'occupied' });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get orders
router.get('/', authenticate, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'customer') {
      orders = await Order.find({ customer: req.user.id }).populate('items.menuItem').populate('table').sort({ createdAt: -1 });
    } else if (req.user.role === 'waiter') {
      orders = await Order.find({ assignedWaiter: req.user.id, status: { $ne: 'served' } }).populate('customer', 'name _id').populate('items.menuItem').populate('table').populate('assignedWaiter', 'name _id').populate('assignedChef', 'name _id').sort({ createdAt: -1 });
    } else if (req.user.role === 'chef') {
      orders = await Order.find({ assignedChef: req.user.id, status: { $ne: 'served' } }).populate('customer', 'name _id').populate('items.menuItem').populate('table').populate('assignedWaiter', 'name _id').populate('assignedChef', 'name _id').sort({ createdAt: -1 });
    } else {
      // Admin/manager can see all orders
      orders = await Order.find().populate('customer', 'name _id').populate('items.menuItem').populate('table').populate('assignedWaiter', 'name _id').populate('assignedChef', 'name _id').sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (staff only)
router.put('/:id/status', authenticate, authorize('admin', 'manager', 'chef', 'waiter'), async (req, res) => {
  try {
    const { status, assignedWaiter, assignedChef } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'customer') return res.status(403).json({ message: 'Unauthorized' });
    if (req.user.role === 'waiter' && status !== 'served') return res.status(403).json({ message: 'Waiters can only mark as served' });
    if (req.user.role === 'waiter' && status === 'served' && order.status !== 'ready') return res.status(403).json({ message: 'Order must be ready to mark as served' });
    if (req.user.role === 'chef' && !['preparing', 'ready'].includes(status)) return res.status(403).json({ message: 'Chefs can only update to preparing or ready' });
    // Admins and managers can assign staff but not change status directly

    if (status) {
      order.status = status;
    }
    if (assignedWaiter) order.assignedWaiter = assignedWaiter;
    if (assignedChef) order.assignedChef = assignedChef;
    await order.save();

    // Free table when order is served
    if (status === 'served' && order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'available' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete order (customer or admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Free table if order is not served
    if (order.table && order.status !== 'served') {
      await Table.findByIdAndUpdate(order.table, { status: 'available' });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;