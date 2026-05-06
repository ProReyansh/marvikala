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
    image: { type: String, default: '' },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
