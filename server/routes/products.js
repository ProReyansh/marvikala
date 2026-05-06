const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'marvikala',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Public: get all products
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: add product
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, inStock, featured } = req.body;
    const product = new Product({
      name,
      description,
      category,
      image: req.file ? req.file.path : '',
      inStock: inStock === 'true' || inStock === true,
      featured: featured === 'true' || featured === true,
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: update product
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, inStock, featured } = req.body;
    const update = {
      name,
      description,
      category,
      inStock: inStock === 'true' || inStock === true,
      featured: featured === 'true' || featured === true,
    };
    if (req.file) {
      update.image = req.file.path;
      // delete old image from Cloudinary
      const old = await Product.findById(req.params.id);
      if (old?.image && old.image.includes('cloudinary')) {
        const publicId = old.image.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.image && product.image.includes('cloudinary')) {
      const publicId = product.image.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
