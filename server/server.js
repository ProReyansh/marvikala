require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const productRoutes   = require('./routes/products');
const authRoutes      = require('./routes/auth');
const settingsRoutes  = require('./routes/settings');
const workshopRoutes  = require('./routes/workshops');
const reviewRoutes    = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/products',  productRoutes);
app.use('/api/auth',      authRoutes);
app.use('/api/settings',  settingsRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/reviews',   reviewRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Prevent Render free tier spin-down by pinging self every 10 minutes
setInterval(() => {
  fetch('https://marvikala-api.onrender.com/api/health').catch(() => {});
}, 10 * 60 * 1000);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
