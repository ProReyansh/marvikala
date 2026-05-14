/**
 * seedNewArrivals.js
 * Marks the first 4 products in the DB as newArrival = true.
 * Run once: node seedNewArrivals.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const products = await Product.find().sort({ createdAt: 1 }).limit(4);
  if (products.length === 0) { console.log('No products found.'); await mongoose.disconnect(); return; }
  await Product.updateMany({ _id: { $in: products.map(p => p._id) } }, { newArrival: true });
  console.log(`✓ Marked ${products.length} products as New Arrivals.`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
