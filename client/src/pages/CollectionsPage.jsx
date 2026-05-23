import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ── Default collection catalogue (no featured flag) ──────────────────────────
const DEFAULT_COLLECTIONS = [
  {
    key: 'flowers',
    label: 'Flowers',
    desc: 'Handcrafted crochet bouquets, blooms & arrangements crafted for every occasion and loved one',
    emoji: '🌸',
    imgSeed: 'flowers',
    staticImg: '/images/flower-collection.png',
    accent: '#FFF0F3',
    accentText: '#9C3B5A',
  },
  {
    key: 'homedecor',
    label: 'Home Decor',
    desc: 'Cozy crochet accents — from wall hangings to table runners — to warm up every corner',
    emoji: '🏠',
    imgSeed: 'interior',
    accent: '#F0F4E8',
    accentText: '#3D4A22',
  },
  {
    key: 'jewellery',
    label: 'Jewellery',
    desc: 'Delicate crochet earrings, rings & bracelets — wearable art for everyday elegance',
    emoji: '💍',
    imgSeed: 'jewelry',
    accent: '#F5EDE0',
    accentText: '#7A4C1E',
  },
  {
    key: 'custom',
    label: 'Custom Orders',
    desc: 'Your imagination, our craft. Share your idea and we\'ll create something truly one-of-a-kind',
    emoji: '🎨',
    imgSeed: 'craft',
    accent: '#FFF0F3',
    accentText: '#9C3B5A',
  },
  {
    key: 'laddugopaldress',
    label: 'Laddu Gopal',
    desc: 'Beautiful handcrafted outfits, accessories & sets for your beloved Laddu Gopal',
    emoji: '🕉️',
    imgSeed: 'fabric',
    accent: '#FFF8EC',
    accentText: '#7A5A1E',
  },
  {
    key: 'keychains',
    label: 'Keychains',
    desc: 'Adorable crochet keychains — perfect everyday carry or a thoughtful little gift',
    emoji: '🔑',
    imgSeed: 'keychain',
    accent: '#F5EDE0',
    accentText: '#7A4C1E',
  },
  {
    key: 'bookmarks',
    label: 'Bookmarks',
    desc: 'Charming crochet bookmarks for every book lover — mark your page in style',
    emoji: '🔖',
    imgSeed: 'books',
    accent: '#F0F4E8',
    accentText: '#3D4A22',
  },
  {
    key: 'hairaccessories',
    label: 'Hair Accessories',
    desc: 'Handmade bows, scrunchies & clips to express your personality every single day',
    emoji: '🎀',
    imgSeed: 'ribbon',
    accent: '#FFF0F3',
    accentText: '#9C3B5A',
  },
  {
    key: 'rakhi',
    label: 'Rakhi',
    desc: 'Beautiful handmade Rakhis crafted with love for a cherished, heartfelt celebration',
    emoji: '🪢',
    imgSeed: 'thread',
    accent: '#FFF8EC',
    accentText: '#7A5A1E',
  },
];


// ── localStorage helpers ──────────────────────────────────────────────────────
function getStoredCollections() {
  try {
    const c = localStorage.getItem('mk_custom_collections');
    if (c) {
      const arr = JSON.parse(c);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch {}
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function imgUrl(src) {
  if (!src) return null;
  return src.startsWith('http') ? src : `/uploads/${src}`;
}

function getCachedProducts() {
  try { const c = sessionStorage.getItem('mk_products'); return c ? JSON.parse(c) : []; }
  catch { return []; }
}

// Static cover images — always take priority regardless of product data or localStorage overrides
const STATIC_COVER_IMGS = {
  flowers:          '/images/flower-collection.png',
  keychains:        '/images/keychain-collection.png',
  bookmarks:        '/images/bookmarks-collection.png',
  laddugopaldress:  '/images/laddugopaldress-collection.png',
  jewellery:        '/images/jewellery-collection.png',
  homedecor:        '/images/homedecor-collection.png',
  hairaccessories:  '/images/hairaccessories-collection.png',
  rakhi:            '/images/rakhi-collection.png',
};

function getCollectionCoverImg(products, key, seed, colImg) {
  if (STATIC_COVER_IMGS[key]) return STATIC_COVER_IMGS[key];
  if (colImg) return colImg; // admin-selected image for this collection
  const pool = products.filter(p => p.category === key);
  const pick = pool.find(p => p.bestseller || p.featured) || pool[0];
  if (pick) {
    const imgs = pick.images?.length > 0 ? pick.images : (pick.image ? [pick.image] : []);
    if (imgs[0]) return imgUrl(imgs[0]);
  }
  return `https://picsum.photos/seed/${seed}/600/450`;
}

// ── Components ────────────────────────────────────────────────────────────────
function CollectionCard({ col, count, coverImg, index }) {
  const navigate = useNavigate();

  return (
    <div
      className="coll-card"
      onClick={() => navigate(`/collection/${col.key}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/collection/${col.key}`)}
      aria-label={`Explore ${col.label} collection`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image */}
      <div className="coll-card-img-wrap">
        <div
          className="coll-card-img"
          style={{ backgroundImage: `url(${coverImg})` }}
          role="img"
          aria-label={col.label}
        />
        <div className="coll-card-img-overlay" aria-hidden="true" />
      </div>

      {/* Body */}
      <div className="coll-card-body">
        <div className="coll-card-top">
          <h3 className="coll-card-label">{col.label}</h3>
        </div>
        <p className="coll-card-desc">{col.desc}</p>
        <div className="coll-card-cta">
          <span>Explore Collection</span>
          <span className="coll-card-arrow" aria-hidden="true">→</span>
        </div>
      </div>
    </div>
  );
}

function CollectionCardSkeleton() {
  return (
    <div className="coll-card coll-card-skeleton">
      <div className="coll-card-img-wrap">
        <div className="skeleton-box" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
      </div>
      <div className="coll-card-body">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <div className="skeleton-box" style={{ width: 32, height: 32, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-box" style={{ width: '60%', height: 14, marginBottom: 6 }} />
            <div className="skeleton-box" style={{ width: '30%', height: 11 }} />
          </div>
        </div>
        <div className="skeleton-box" style={{ width: '100%', height: 12, marginBottom: 6 }} />
        <div className="skeleton-box" style={{ width: '80%', height: 12 }} />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CollectionsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(getCachedProducts);
  const [loading, setLoading]   = useState(() => getCachedProducts().length === 0);

  // Read admin settings from localStorage
  const [storedCollections] = useState(getStoredCollections);
  const COLLECTIONS = storedCollections || DEFAULT_COLLECTIONS;

  useEffect(() => {
    document.title = 'Collections — Marvikala';
    axios.get('/api/products')
      .then(res => {
        setProducts(res.data);
        try { sessionStorage.setItem('mk_products', JSON.stringify(res.data)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Count products per collection
  const countMap = useMemo(() => {
    const m = {};
    products.forEach(p => {
      m[p.category] = (m[p.category] || 0) + 1;
    });
    return m;
  }, [products]);

  // Display in default catalogue order
  const displayed = COLLECTIONS;

  return (
    <>
      {/* Ribbon */}
      <div className="top-ribbon">
        <div className="top-ribbon-track">
          <span>📍 Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span>🚛 Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span>🌍 Shipping Pan India</span><span className="ribbon-gap">✦</span>
          <span>📍 Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span>🚛 Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span>🌍 Shipping Pan India</span><span className="ribbon-gap">✦</span>
        </div>
      </div>

      <Navbar searchQuery="" onSearch={() => {}} />

      <div className="coll-page">

        {/* ══ HEADER ROW ═════════════════════════════════════════════════════ */}
        <div className="sa-header-row coll-back-row">
          <h1 className="sa-title">Our Collections</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        {/* ══ INTRO ══════════════════════════════════════════════════════════ */}
        <div className="coll-intro">
          <p className="coll-intro-sub">
            Every piece is crafted stitch by stitch in our Mumbai studio — made with care, warmth, and artisan pride.
          </p>
        </div>


        {/* ══ GRID ══════════════════════════════════════════════════════════ */}
        <div className="coll-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CollectionCardSkeleton key={i} />)
            : displayed.map((col, i) => (
                <CollectionCard
                  key={col.key}
                  col={col}
                  count={countMap[col.key] || 0}
                  coverImg={getCollectionCoverImg(products, col.key, col.imgSeed)}
                  index={i}
                />
              ))}
        </div>

      </div>

      <Footer />
    </>
  );
}
