const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    avatar: { type: String, default: '' },   // single letter, auto-derived from name
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    date:   { type: String, default: '' },   // e.g. "March 2025" — human-readable
    text:   { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
