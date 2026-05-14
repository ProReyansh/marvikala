const express = require('express');
const Workshop = require('../models/Workshop');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/workshops — public
router.get('/', async (req, res) => {
  try {
    const workshops = await Workshop.find().sort({ order: 1, date: 1 });
    res.json(workshops);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/workshops — admin only
router.post('/', authMiddleware, async (req, res) => {
  try {
    const ws = await Workshop.create(req.body);
    res.status(201).json(ws);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Invalid data' });
  }
});

// PUT /api/workshops/:id — admin only
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const ws = await Workshop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ws) return res.status(404).json({ message: 'Workshop not found' });
    res.json(ws);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Invalid data' });
  }
});

// DELETE /api/workshops/:id — admin only
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const ws = await Workshop.findByIdAndDelete(req.params.id);
    if (!ws) return res.status(404).json({ message: 'Workshop not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
