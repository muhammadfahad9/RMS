import express from 'express';
import Menu from '../models/Menu.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await Menu.find({ available: true });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create menu item (admin/manager only)
router.post('/', authenticate, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { name, description, price, category, available, image } = req.body;
    const menuItem = new Menu({ name, description, price, category, available, image });
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update menu item (admin/manager only)
router.put('/:id', authenticate, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { name, description, price, category, available, image } = req.body;
    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, available, image },
      { new: true }
    );
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete menu item (admin/manager only)
router.delete('/:id', authenticate, authorize('admin', 'manager'), async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;