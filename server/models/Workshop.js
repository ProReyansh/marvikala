const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  duration:    { type: String, default: '' },
  level:       { type: String, default: 'All Levels' },
  date:        { type: Date, required: true },
  seatsLeft:   { type: Number, default: 10 },
  totalSeats:  { type: Number, default: 10 },
  includes:    { type: [String], default: [] },
  price:       { type: String, default: '' },
  emoji:       { type: String, default: '🧶' },
  color:       { type: String, default: '#F5F0E8' },
  badge:       { type: String, default: '' },
  upcoming:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Workshop', workshopSchema);
