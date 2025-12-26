import express from 'express';
import Review from '../models/Review.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all reviews for a menu item
router.get('/menu/:menuId', async (req, res) => {
  try {
    const reviews = await Review.find({ menuItem: req.params.menuId })
      .populate('customer', 'name')
      .populate('repliedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a review (customer only)
router.post('/', authenticate, async (req, res) => {
  try {
    const { menuItem, rating, comment } = req.body;
    
    // Check if user already reviewed this item
    const existingReview = await Review.findOne({ 
      menuItem, 
      customer: req.user.id 
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this item' });
    }
    
    const review = new Review({
      menuItem,
      customer: req.user.id,
      rating,
      comment
    });
    
    await review.save();
    await review.populate('customer', 'name');
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a review
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the user owns this review
    if (review.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    review.rating = rating;
    review.comment = comment;
    await review.save();
    await review.populate('customer', 'name');
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a review (only by the customer who created it)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Only the customer who created the review can delete it
    if (review.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add reply to review (admin/manager only)
router.put('/:id/reply', authenticate, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    review.reply = reply;
    review.repliedBy = req.user.id;
    await review.save();
    await review.populate('customer', 'name');
    await review.populate('repliedBy', 'name role');
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
