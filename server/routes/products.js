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
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
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

function getPublicId(url) {
  return url.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
}

// Public: get all products
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const products = await Product.find(filter).sort({ bestseller: -1, featured: -1, createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: get single product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: add product (up to 5 images)
router.post('/', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const { name, description, category, inStock, bestseller } = req.body;
    const images = req.files ? req.files.map(f => f.path) : [];
    const product = new Product({
      name, description, category,
      image:  images[0] || '',
      images,
      inStock:    inStock    === 'true' || inStock    === true,
      bestseller: bestseller === 'true' || bestseller === true,
      featured:   bestseller === 'true' || bestseller === true,
      newArrival: req.body.newArrival === 'true' || req.body.newArrival === true,
      price:             req.body.price         ? Number(req.body.price)         : null,
      originalPrice:     req.body.originalPrice ? Number(req.body.originalPrice) : null,
      colors:              (() => { try { return JSON.parse(req.body.colors || '[]'); } catch { return []; } })(),
      primaryImageIndex:   req.body.primaryImageIndex != null ? Number(req.body.primaryImageIndex) : 0,
      primaryImageIndices: (() => { try { return JSON.parse(req.body.primaryImageIndices || '[]'); } catch { return []; } })(),
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: update product
router.put('/:id', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const { name, description, category, inStock, bestseller, existingImages } = req.body;
    let keptImages = [];
    try { keptImages = JSON.parse(existingImages || '[]'); } catch { keptImages = []; }
    const newImages = req.files ? req.files.map(f => f.path) : [];
    const allImages = [...keptImages, ...newImages];

    // delete removed images from Cloudinary
    const old = await Product.findById(req.params.id);
    if (old) {
      const oldUrls = old.images.length > 0 ? old.images : (old.image ? [old.image] : []);
      for (const url of oldUrls) {
        if (url && url.includes('cloudinary') && !keptImages.includes(url)) {
          await cloudinary.uploader.destroy(getPublicId(url)).catch(() => {});
        }
      }
    }

    const update = {
      name, description, category,
      images: allImages,
      image:  allImages[0] || '',
      inStock:    inStock    === 'true' || inStock    === true,
      bestseller: bestseller === 'true' || bestseller === true,
      featured:   bestseller === 'true' || bestseller === true,
      newArrival: req.body.newArrival === 'true' || req.body.newArrival === true,
      price:             req.body.price         ? Number(req.body.price)         : null,
      originalPrice:     req.body.originalPrice ? Number(req.body.originalPrice) : null,
      colors:              (() => { try { return JSON.parse(req.body.colors || '[]'); } catch { return []; } })(),
      primaryImageIndex:   req.body.primaryImageIndex != null ? Number(req.body.primaryImageIndex) : 0,
      primaryImageIndices: (() => { try { return JSON.parse(req.body.primaryImageIndices || '[]'); } catch { return []; } })(),
    };

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
    const urls = product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
    for (const url of urls) {
      if (url && url.includes('cloudinary')) {
        await cloudinary.uploader.destroy(getPublicId(url)).catch(() => {});
      }
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: toggle newArrival without re-uploading images
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { newArrival: req.body.newArrival === true || req.body.newArrival === 'true' },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
