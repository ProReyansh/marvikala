const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      required: true,
      enum: ['flowers', 'keychains', 'bookmarks', 'laddugopaldress', 'homedecor', 'hairaccessories', 'jewellery', 'rakhi', 'custom'],
    },
    image:  { type: String, default: '' },        // kept for backward compat
    images: { type: [String], default: [] },       // multiple images
    inStock:    { type: Boolean, default: true },
    featured:   { type: Boolean, default: false }, // kept for backward compat
    bestseller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    price:         { type: Number, default: null },
    originalPrice: { type: Number, default: null },
    colors:            { type: [mongoose.Schema.Types.Mixed], default: [] },
    primaryImageIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
