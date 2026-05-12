const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const heroStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'marvikala/hero',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 2400, crop: 'limit' }],
  },
});

const heroUpload = multer({
  storage: heroStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// GET /api/settings/hero-image — public
router.get('/hero-image', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'heroImage' });
    res.json({ url: setting?.value || '' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/settings/hero-image — admin only
router.post('/hero-image', authMiddleware, heroUpload.single('image'), async (req, res) => {
  try {
    const url = req.file?.path;
    if (!url) return res.status(400).json({ message: 'No image uploaded' });
    await Settings.findOneAndUpdate(
      { key: 'heroImage' },
      { value: url },
      { upsert: true, new: true }
    );
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// DELETE /api/settings/hero-image — revert to default
router.delete('/hero-image', authMiddleware, async (req, res) => {
  try {
    await Settings.deleteOne({ key: 'heroImage' });
    res.json({ url: '' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
