/**
 * seedWorkshops.js
 * Run once to populate MongoDB with the default workshop data.
 * Usage: node seedWorkshops.js
 *
 * Safe to re-run — skips seeding if workshops already exist in the DB.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Workshop = require('./models/Workshop');

const WORKSHOPS = [
  {
    title: 'Beginner Crochet — Flowers & Keychain',
    description:
      'Perfect for absolute beginners! Learn the basic crochet stitches and create your very own crochet flower and a cute keychain to take home.',
    duration: '3 hours',
    level: 'Beginner',
    date: new Date('2026-05-25T11:00:00'),
    seatsLeft: 4,
    totalSeats: 10,
    includes: [
      'All materials provided',
      'Take-home kit',
      'Light refreshments',
      'Certificate of completion',
    ],
    price: '₹799',
    emoji: '🌸',
    color: '#FFF0F3',
    badge: 'Most Popular',
    upcoming: true,
    order: 1,
  },
  {
    title: 'Amigurumi — Mini Stuffed Animals',
    description:
      "Dive into the magical world of amigurumi! Create adorable little crocheted stuffed animals. You'll take home the cutest little creature you made yourself.",
    duration: '4 hours',
    level: 'Beginner–Intermediate',
    date: new Date('2026-06-08T11:00:00'),
    seatsLeft: 7,
    totalSeats: 10,
    includes: [
      'All yarn & stuffing provided',
      'Pattern booklet',
      'Crochet hook to keep',
      'Take-home amigurumi',
    ],
    price: '₹1,199',
    emoji: '🐻',
    color: '#F5EDE0',
    badge: '',
    upcoming: true,
    order: 2,
  },
  {
    title: 'Crochet Jewellery Masterclass',
    description:
      'Learn to create delicate crochet jewellery — earrings, bracelets, and rings using fine thread and beads. Perfect for those who love intricate work.',
    duration: '3.5 hours',
    level: 'Intermediate',
    date: new Date('2026-06-22T14:00:00'),
    seatsLeft: 6,
    totalSeats: 8,
    includes: [
      'Fine thread & beads kit',
      'Jewellery tools',
      'Gift box for your pieces',
      'Recipe card for re-creating at home',
    ],
    price: '₹999',
    emoji: '💍',
    color: '#F0F4E8',
    badge: 'New',
    upcoming: true,
    order: 3,
  },
  {
    title: 'Festive Crochet — Rakhis & Decor',
    description:
      'A seasonal workshop to create beautiful handmade Rakhis and festive home decor. Bring creativity and leave with gorgeous handmade festival pieces.',
    duration: '2.5 hours',
    level: 'All Levels',
    date: new Date('2026-08-03T11:00:00'),
    seatsLeft: 8,
    totalSeats: 12,
    includes: [
      'All festive materials',
      'Gift packaging',
      'Personalisation options',
      'Chai & snacks',
    ],
    price: '₹699',
    emoji: '🪢',
    color: '#FFF8EC',
    badge: 'Seasonal',
    upcoming: true,
    order: 4,
  },
  {
    title: 'Spring Flowers Workshop',
    description:
      'A lovely spring edition where participants made beautiful crochet bouquets and flower crowns.',
    duration: '3 hours',
    level: 'Beginner',
    date: new Date('2026-03-15T11:00:00'),
    seatsLeft: 0,
    totalSeats: 10,
    includes: [],
    price: '₹799',
    emoji: '🌷',
    color: '#FEF0F0',
    badge: '',
    upcoming: false,
    order: 5,
  },
  {
    title: "Valentine's Crochet Hearts",
    description:
      "A special Valentine's Day session creating heart keychains, bookmarks and small bouquets as gifts.",
    duration: '2.5 hours',
    level: 'All Levels',
    date: new Date('2026-02-14T15:00:00'),
    seatsLeft: 0,
    totalSeats: 12,
    includes: [],
    price: '₹649',
    emoji: '❤️',
    color: '#FFF0F0',
    badge: '',
    upcoming: false,
    order: 6,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await Workshop.countDocuments();
  if (existing > 0) {
    console.log(`Skipping seed — ${existing} workshop(s) already exist in the database.`);
    await mongoose.disconnect();
    return;
  }

  await Workshop.insertMany(WORKSHOPS);
  console.log(`✓ Seeded ${WORKSHOPS.length} workshops successfully.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
