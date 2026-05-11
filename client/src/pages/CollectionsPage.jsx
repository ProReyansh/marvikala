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

const SORTS = [
  { key: 'az',    label: 'A – Z' },
  { key: 'za',    label: 'Z – A' },
  { key: 'count', label: 'Most Products' },
];

// ── localStorage helpers ──────────────────────────────────────────────────────
function getMostLovedKey() {
  try { return localStorage.getItem('mk_most_loved_collection') || 'flowers'; } catch { return 'flowers'; }
}

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

function getCollectionCoverImg(products, key, seed) {
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
          <span className="coll-card-emoji" aria-hidden="true">{col.emoji}</span>
          <div className="coll-card-title-group">
            <h3 className="coll-card-label">{col.label}</h3>
            {count > 0 && (
              <span className="coll-card-count">{count} item{count !== 1 ? 's' : ''}</span>
            )}
          </div>
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
  const [exiting, setExiting]   = useState(false);
  const [sort, setSort]         = useState('az');
  const [sortOpen, setSortOpen] = useState(false);

  // Read admin settings from localStorage
  const [mostLovedKey]        = useState(getMostLovedKey);
  const [storedCollections]   = useState(getStoredCollections);
  const COLLECTIONS = storedCollections || DEFAULT_COLLECTIONS;
  const heroCollection = COLLECTIONS.find(c => c.key === mostLovedKey) || COLLECTIONS[0];

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

  const totalProducts = products.length;

  // Sorted list
  const displayed = useMemo(() => {
    let list = [...COLLECTIONS];
    switch (sort) {
      case 'az':    list = [...list].sort((a, b) => a.label.localeCompare(b.label)); break;
      case 'za':    list = [...list].sort((a, b) => b.label.localeCompare(a.label)); break;
      case 'count': list = [...list].sort((a, b) => (countMap[b.key] || 0) - (countMap[a.key] || 0)); break;
      default:      break;
    }
    return list;
  }, [sort, countMap, COLLECTIONS]);

  const activeSortLabel = SORTS.find(s => s.key === sort)?.label || 'Sort';

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

      <div className={`coll-page${exiting ? ' page-exiting' : ''}`}>

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section className="coll-hero" aria-label="Collections hero">
          <div className="coll-hero-content">
            <p className="coll-hero-overline">✦ Handmade with Love</p>
            <h1 className="coll-hero-title">Our Collections</h1>
            <p className="coll-hero-sub">
              Every piece in our collections is crafted stitch by stitch in our Mumbai studio.
              Explore categories curated with care, warmth, and artisan pride.
            </p>
            <div className="coll-hero-chips">
              <span className="coll-hero-chip">
                <span className="coll-hero-chip-num">{COLLECTIONS.length}</span> Collections
              </span>
              <span className="coll-hero-chip-sep" aria-hidden="true">·</span>
              {loading ? (
                <span className="coll-hero-chip">
                  <span className="skeleton-box" style={{ display: 'inline-block', width: 24, height: 14, borderRadius: 4 }} /> Products
                </span>
              ) : (
                <span className="coll-hero-chip">
                  <span className="coll-hero-chip-num">{totalProducts}+</span> Products
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="coll-back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
              <button className="coll-hero-shop-btn" onClick={() => navigate('/shop')}>
                Shop All Products <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
          <div className="coll-hero-decoration" aria-hidden="true">
            <span className="coll-deco-blob coll-deco-blob-1" />
            <span className="coll-deco-blob coll-deco-blob-2" />
            <span className="coll-deco-emoji">🌸</span>
          </div>
        </section>

        {/* ══ MOST LOVED BANNER ═══════════════════════════════════════════════ */}
        <section
          className="coll-featured-banner"
          onClick={() => navigate(`/collection/${heroCollection.key}`)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate(`/collection/${heroCollection.key}`)}
          aria-label={`Most Loved: ${heroCollection.label} collection`}
          style={{
            backgroundImage: `url(https://picsum.photos/seed/${heroCollection.imgSeed}/1200/500)`,
          }}
        >
          <div className="coll-banner-overlay" aria-hidden="true" />
          <div className="coll-banner-content">
            <span className="coll-banner-label">✦ Most Loved Collection</span>
            <h2 className="coll-banner-title">{heroCollection.label}</h2>
            <p className="coll-banner-desc">{heroCollection.desc}</p>
            <div className="coll-banner-cta">
              <span>Explore Collection</span>
              <span className="coll-banner-arrow" aria-hidden="true">→</span>
            </div>
          </div>
        </section>

        {/* ══ ALL COLLECTIONS HEADING ═══════════════════════════════════════ */}
        <div className="coll-all-heading-wrap">
          <h2 className="coll-all-heading">All Collections</h2>
        </div>

        {/* ══ SORT CONTROLS ══════════════════════════════════════════════════ */}
        <div className="coll-controls">
          <div style={{ flex: 1 }} />

          {/* Sort dropdown */}
          <div className="coll-sort-wrap">
            <button
              className="coll-sort-btn"
              onClick={() => setSortOpen(o => !o)}
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 6h18M7 12h10M11 18h2"/>
              </svg>
              {activeSortLabel}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`coll-sort-chevron${sortOpen ? ' open' : ''}`} aria-hidden="true">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {sortOpen && (
              <>
                <div className="coll-sort-backdrop" onClick={() => setSortOpen(false)} aria-hidden="true" />
                <div className="coll-sort-menu" role="listbox" aria-label="Sort options">
                  {SORTS.map(s => (
                    <button
                      key={s.key}
                      className={`coll-sort-option${sort === s.key ? ' active' : ''}`}
                      onClick={() => { setSort(s.key); setSortOpen(false); }}
                      role="option"
                      aria-selected={sort === s.key}
                    >
                      {s.label}
                      {sort === s.key && <span className="coll-sort-tick" aria-hidden="true">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Count */}
          <span className="coll-count-label">
            {displayed.length} collection{displayed.length !== 1 ? 's' : ''}
          </span>
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
