const express = require('express');
const router  = express.Router();
const Review  = require('../models/Review');
const authMiddleware = require('../middleware/auth');

// GET all reviews (public — shown on product pages)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new review (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, rating, text, date } = req.body;
    if (!name || !text) return res.status(400).json({ message: 'Name and review text are required' });
    const avatar = (name || '?').trim()[0].toUpperCase();
    const review = new Review({ name: name.trim(), avatar, rating: Number(rating) || 5, text: text.trim(), date: (date || '').trim() });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update review (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, rating, text, date } = req.body;
    const avatar = (name || '?').trim()[0].toUpperCase();
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { name: (name || '').trim(), avatar, rating: Number(rating) || 5, text: (text || '').trim(), date: (date || '').trim() },
      { new: true, runValidators: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE review (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
