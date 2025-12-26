import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Table from '../models/Table.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin/manager only)
router.get('/', authenticate, authorize('admin', 'manager'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hashedPassword, role, phone });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // If deleting a customer, check for open orders
    if (user.role === 'customer') {
      const openOrders = await Order.find({ customer: req.params.id, status: { $ne: 'served' } });
      if (openOrders.length > 0) {
        return res.status(400).json({ message: 'Cannot delete customer with open orders' });
      }
      // Free up their table
      const orders = await Order.find({ customer: req.params.id });
      for (const order of orders) {
        if (order.table) {
          await Table.findByIdAndUpdate(order.table, { status: 'available' });
        }
      }
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;