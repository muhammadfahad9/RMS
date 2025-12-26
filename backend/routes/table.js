import express from 'express';
import Table from '../models/Table.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create table (admin/manager only)
router.post('/', authenticate, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { number, capacity } = req.body;
    const table = new Table({ number, capacity });
    await table.save();
    res.status(201).json(table);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Table number already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Update table (admin/manager edit number/capacity, waiter updates status)
router.put('/:id', authenticate, authorize('admin', 'manager', 'waiter'), async (req, res) => {
  try {
    let updateData;
    if (req.user.role === 'waiter') {
      const { status } = req.body;
      updateData = { status };
    } else {
      const { number, capacity } = req.body;
      updateData = { number, capacity };
    }
    const table = await Table.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json(table);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Table number already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Delete table (admin/manager only)
router.delete('/:id', authenticate, authorize('admin', 'manager'), async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.json({ message: 'Table deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;