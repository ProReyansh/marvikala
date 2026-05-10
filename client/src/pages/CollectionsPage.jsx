import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ── Collection catalogue ─────────────────────────────────────────────────────
const COLLECTIONS = [
  {
    key: 'flowers',
    label: 'Flowers',
    desc: 'Handcrafted crochet bouquets, blooms & arrangements crafted for every occasion and loved one',
    emoji: '🌸',
    featured: true,
    imgSeed: 'flowers',
    accent: '#FFF0F3',
    accentText: '#9C3B5A',
  },
  {
    key: 'homedecor',
    label: 'Home Decor',
    desc: 'Cozy crochet accents — from wall hangings to table runners — to warm up every corner',
    emoji: '🏠',
    featured: true,
    imgSeed: 'interior',
    accent: '#F0F4E8',
    accentText: '#3D4A22',
  },
  {
    key: 'jewellery',
    label: 'Jewellery',
    desc: 'Delicate crochet earrings, rings & bracelets — wearable art for everyday elegance',
    emoji: '💍',
    featured: true,
    imgSeed: 'jewelry',
    accent: '#F5EDE0',
    accentText: '#7A4C1E',
  },
  {
    key: 'custom',
    label: 'Custom Orders',
    desc: 'Your imagination, our craft. Share your idea and we\'ll create something truly one-of-a-kind',
    emoji: '🎨',
    featured: true,
    imgSeed: 'craft',
    accent: '#FFF0F3',
    accentText: '#9C3B5A',
  },
  {
    key: 'laddugopaldress',
    label: 'Laddu Gopal',
    desc: 'Beautiful handcrafted outfits, accessories & sets for your beloved Laddu Gopal',
    emoji: '🕉️',
    featured: true,
    imgSeed: 'fabric',
    accent: '#FFF8EC',
    accentText: '#7A5A1E',
  },
  {
    key: 'keychains',
    label: 'Keychains',
    desc: 'Adorable crochet keychains — perfect everyday carry or a thoughtful little gift',
    emoji: '🔑',
    featured: false,
    imgSeed: 'keychain',
    accent: '#F5EDE0',
    accentText: '#7A4C1E',
  },
  {
    key: 'bookmarks',
    label: 'Bookmarks',
    desc: 'Charming crochet bookmarks for every book lover — mark your page in style',
    emoji: '🔖',
    featured: false,
    imgSeed: 'books',
    accent: '#F0F4E8',
    accentText: '#3D4A22',
  },
  {
    key: 'hairaccessories',
    label: 'Hair Accessories',
    desc: 'Handmade bows, scrunchies & clips to express your personality every single day',
    emoji: '🎀',
    featured: false,
    imgSeed: 'ribbon',
    accent: '#FFF0F3',
    accentText: '#9C3B5A',
  },
  {
    key: 'rakhi',
    label: 'Rakhi',
    desc: 'Beautiful handmade Rakhis crafted with love for a cherished, heartfelt celebration',
    emoji: '🪢',
    featured: false,
    imgSeed: 'thread',
    accent: '#FFF8EC',
    accentText: '#7A5A1E',
  },
];

const HERO_COLLECTION = COLLECTIONS.find(c => c.key === 'flowers');

const FILTERS = [
  { key: 'all',      label: 'All Collections' },
  { key: 'featured', label: '✦ Featured' },
];

const SORTS = [
  { key: 'default', label: 'Curated' },
  { key: 'az',      label: 'A – Z' },
  { key: 'za',      label: 'Z – A' },
  { key: 'count',   label: 'Most Products' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
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
        {col.featured && (
          <span className="coll-card-featured-badge" aria-label="Featured collection">✦ Featured</span>
        )}
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CollectionsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(getCachedProducts);
  const [loading, setLoading]   = useState(() => getCachedProducts().length === 0);
  const [exiting, setExiting]   = useState(false);
  const [filter, setFilter]     = useState('all');
  const [sort, setSort]         = useState('default');
  const [sortOpen, setSortOpen] = useState(false);

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

  function goHome() { setExiting(true); setTimeout(() => navigate('/'), 230); }

  // Count products per collection
  const countMap = useMemo(() => {
    const m = {};
    products.forEach(p => {
      m[p.category] = (m[p.category] || 0) + 1;
    });
    return m;
  }, [products]);

  const totalProducts = products.length;

  // Filtered + sorted list
  const displayed = useMemo(() => {
    let list = filter === 'featured' ? COLLECTIONS.filter(c => c.featured) : [...COLLECTIONS];
    switch (sort) {
      case 'az':    list = [...list].sort((a, b) => a.label.localeCompare(b.label)); break;
      case 'za':    list = [...list].sort((a, b) => b.label.localeCompare(a.label)); break;
      case 'count': list = [...list].sort((a, b) => (countMap[b.key] || 0) - (countMap[a.key] || 0)); break;
      default:      break;
    }
    return list;
  }, [filter, sort, countMap]);

  const activeSortLabel = SORTS.find(s => s.key === sort)?.label || 'Curated';

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
            <button className="coll-hero-shop-btn" onClick={() => navigate('/shop')}>
              Shop All Products <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="coll-hero-decoration" aria-hidden="true">
            <span className="coll-deco-blob coll-deco-blob-1" />
            <span className="coll-deco-blob coll-deco-blob-2" />
            <span className="coll-deco-emoji">🌸</span>
          </div>
        </section>

        {/* ══ FEATURED BANNER ═══════════════════════════════════════════════ */}
        <section
          className="coll-featured-banner"
          onClick={() => navigate(`/collection/${HERO_COLLECTION.key}`)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate(`/collection/${HERO_COLLECTION.key}`)}
          aria-label={`Featured: ${HERO_COLLECTION.label} collection`}
          style={{
            backgroundImage: `url(https://picsum.photos/seed/${HERO_COLLECTION.imgSeed}/1200/500)`,
          }}
        >
          {/* Gradient overlay */}
          <div className="coll-banner-overlay" aria-hidden="true" />

          <div className="coll-banner-content">
            <span className="coll-banner-label">✦ Most Loved Collection</span>
            <h2 className="coll-banner-title">{HERO_COLLECTION.label}</h2>
            <p className="coll-banner-desc">{HERO_COLLECTION.desc}</p>
            <div className="coll-banner-cta">
              <span>Explore Collection</span>
              <span className="coll-banner-arrow" aria-hidden="true">→</span>
            </div>
          </div>
        </section>

        {/* ══ CONTROLS ══════════════════════════════════════════════════════ */}
        <div className="coll-controls">
          {/* Filter pills */}
          <div className="coll-filter-pills" role="group" aria-label="Filter collections">
            {FILTERS.map(f => (
              <button
                key={f.key}
                className={`coll-pill${filter === f.key ? ' active' : ''}`}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
              >
                {f.label}
              </button>
            ))}
          </div>

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

        {/* ══ BOTTOM CTA ════════════════════════════════════════════════════ */}
        <div className="coll-bottom-cta">
          <div className="coll-bottom-cta-inner">
            <span className="coll-bottom-cta-emoji" aria-hidden="true">🎨</span>
            <h3 className="coll-bottom-cta-title">Don't see what you're looking for?</h3>
            <p className="coll-bottom-cta-sub">
              We take custom orders! Share your idea and we'll craft it just for you.
            </p>
            <a
              href="https://wa.me/919769238160?text=Hi! I'd like to place a custom order with Marvikala."
              className="coll-bottom-cta-btn"
              target="_blank"
              rel="noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }} aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Request a Custom Order
            </a>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
}
