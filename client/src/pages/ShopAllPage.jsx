import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EnquireModal from '../components/EnquireModal';

const CAT_LABEL = {
  flowers: 'Flowers', keychains: 'Keychains', bookmarks: 'Bookmarks',
  laddugopaldress: 'Laddu Gopal', homedecor: 'Home Decor',
  hairaccessories: 'Hair Accessories', jewellery: 'Jewellery',
  rakhi: 'Rakhi', custom: 'Custom',
};

const CATEGORIES = [
  { key: 'all',             label: 'All' },
  { key: 'flowers',         label: 'Flowers' },
  { key: 'keychains',       label: 'Keychains' },
  { key: 'bookmarks',       label: 'Bookmarks' },
  { key: 'laddugopaldress', label: 'Laddu Gopal' },
  { key: 'homedecor',       label: 'Home Decor' },
  { key: 'hairaccessories', label: 'Hair Accessories' },
  { key: 'jewellery',       label: 'Jewellery' },
  { key: 'rakhi',           label: 'Rakhi' },
  { key: 'custom',          label: 'Custom' },
];

const SORT_OPTIONS = [
  { key: 'default',   label: 'Default' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc',label: 'Price: High to Low' },
  { key: 'name-asc',  label: 'Name: A – Z' },
  { key: 'name-desc', label: 'Name: Z – A' },
];

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getCachedProducts() {
  try {
    const c = sessionStorage.getItem('mk_products');
    return c ? JSON.parse(c) : [];
  } catch { return []; }
}

// ── Icons ──────────────────────────────────────────────
function FilterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="7" y1="12" x2="17" y2="12"/>
      <line x1="10" y1="18" x2="14" y2="18"/>
    </svg>
  );
}

function SortIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M7 12h10M11 18h2"/>
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

// ── Bottom Sheet ───────────────────────────────────────
function BottomSheet({ open, onClose, title, children }) {
  // Close on back-swipe / overlay tap
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <>
      <div className={`sa-sheet-overlay${open ? ' open' : ''}`} onClick={onClose} aria-hidden="true" />
      <div className={`sa-sheet${open ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sa-sheet-handle" />
        <div className="sa-sheet-title">{title}</div>
        <div className="sa-sheet-body">{children}</div>
      </div>
    </>
  );
}

// ── Product Card ───────────────────────────────────────
function ShopCard({ product, onEnquire }) {
  const navigate = useNavigate();
  const imgSrc = (() => {
    const imgs = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
    if (!imgs[0]) return null;
    return imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`;
  })();

  return (
    <div
      className="sa-card"
      onClick={() => navigate(`/product/${slugify(product.name)}`, { state: { product } })}
    >
      <div className="sa-card-img">
        {imgSrc ? <img src={imgSrc} alt={product.name} /> : <span className="sa-card-placeholder">🧶</span>}
        {(product.bestseller || product.featured) && (
          <span className="sa-card-badge">Bestseller</span>
        )}
        {!product.inStock && <div className="sa-card-oos">Out of Stock</div>}
      </div>
      <div className="sa-card-body">
        <div className="sa-card-cat">{CAT_LABEL[product.category] || product.category}</div>
        <div className="sa-card-name">{product.name}</div>
        {(product.price || product.originalPrice) && (
          <div className="sa-card-price-row">
            {product.originalPrice && <span className="sa-card-price-orig">₹{product.originalPrice}</span>}
            {product.price && <span className="sa-card-price-sale">₹{product.price}</span>}
          </div>
        )}
        <button
          className="sa-card-btn"
          disabled={!product.inStock}
          onClick={(e) => {
            e.stopPropagation();
            if (product.inStock) onEnquire(product);
          }}
        >
          {product.inStock ? 'Enquire Now' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function ShopAllPage() {
  const navigate = useNavigate();

  const [products, setProducts]           = useState(getCachedProducts);
  const [loading, setLoading]             = useState(() => getCachedProducts().length === 0);
  const [searchQuery, setSearchQuery]     = useState('');
  const [enquireProduct, setEnquireProduct] = useState(null);

  const [activeFilter, setActiveFilter]   = useState('all');
  const [activeSort, setActiveSort]       = useState('default');
  const [filterOpen, setFilterOpen]       = useState(false);
  const [sortOpen, setSortOpen]           = useState(false);

  useEffect(() => {
    document.title = 'Shop All — Marvikala';
    axios.get('/api/products')
      .then(res => {
        setProducts(res.data);
        try { sessionStorage.setItem('mk_products', JSON.stringify(res.data)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleSearch(q) {
    setSearchQuery(q);
    try { sessionStorage.setItem('mk_search', q); } catch {}
    navigate('/');
  }

  // Filter
  const filtered = activeFilter === 'all'
    ? products
    : products.filter(p => p.category === activeFilter);

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (activeSort) {
      case 'price-asc':  return (a.price || 0) - (b.price || 0);
      case 'price-desc': return (b.price || 0) - (a.price || 0);
      case 'name-asc':   return a.name.localeCompare(b.name);
      case 'name-desc':  return b.name.localeCompare(a.name);
      default:           return 0;
    }
  });

  const filterLabel = activeFilter === 'all' ? 'All' : (CAT_LABEL[activeFilter] || activeFilter);
  const sortLabel   = SORT_OPTIONS.find(o => o.key === activeSort)?.label || 'Sort';
  const hasFilter   = activeFilter !== 'all';
  const hasSort     = activeSort !== 'default';

  return (
    <>
      {/* TOP RIBBON */}
      <div className="top-ribbon">
        <div className="top-ribbon-track">
          <span>📍 Based in Mumbai</span>
          <span className="ribbon-sep">|</span>
          <span>🚛 Free delivery over ₹999</span>
          <span className="ribbon-sep">|</span>
          <span>🌍 Shipping Pan India</span>
          <span className="ribbon-gap">✦</span>
          <span>📍 Based in Mumbai</span>
          <span className="ribbon-sep">|</span>
          <span>🚛 Free delivery over ₹999</span>
          <span className="ribbon-sep">|</span>
          <span>🌍 Shipping Pan India</span>
          <span className="ribbon-gap">✦</span>
        </div>
      </div>

      <Navbar searchQuery={searchQuery} onSearch={handleSearch} />

      <div className="sa-page">

        {/* ── Header Row ── */}
        <div className="sa-header-row">
          <h1 className="sa-title">Shop All</h1>
          <button className="sa-back-btn" onClick={() => navigate('/')}>
            ← Home
          </button>
        </div>

        {/* ── Controls Row ── */}
        <div className="sa-controls-row">
          <button
            className={`sa-ctrl-btn${hasFilter ? ' active' : ''}`}
            onClick={() => { setFilterOpen(true); setSortOpen(false); }}
          >
            <FilterIcon />
            <span>{hasFilter ? filterLabel : 'Filter'}</span>
            <ChevronDown />
          </button>
          <button
            className={`sa-ctrl-btn${hasSort ? ' active' : ''}`}
            onClick={() => { setSortOpen(true); setFilterOpen(false); }}
          >
            <SortIcon />
            <span>{hasSort ? sortLabel : 'Sort'}</span>
            <ChevronDown />
          </button>

          {/* Result count */}
          <span className="sa-count">{sorted.length} item{sorted.length !== 1 ? 's' : ''}</span>
        </div>

        {/* ── Active chips ── */}
        {(hasFilter || hasSort) && (
          <div className="sa-chips-row">
            {hasFilter && (
              <button className="sa-chip" onClick={() => setActiveFilter('all')}>
                {filterLabel} ✕
              </button>
            )}
            {hasSort && (
              <button className="sa-chip" onClick={() => setActiveSort('default')}>
                {sortLabel} ✕
              </button>
            )}
          </div>
        )}

        {/* ── Product Grid ── */}
        {loading ? (
          <div className="sa-loading">
            <div className="spinner" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="sa-empty">
            <div className="sa-empty-icon">🧶</div>
            <p>No products found</p>
          </div>
        ) : (
          <div className="sa-grid" key={`${activeFilter}-${activeSort}`}>
            {sorted.map(p => (
              <ShopCard key={p._id} product={p} onEnquire={setEnquireProduct} />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* ── FILTER BOTTOM SHEET ── */}
      <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter by Category">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`sa-sheet-option${activeFilter === cat.key ? ' selected' : ''}`}
            onClick={() => { setActiveFilter(cat.key); setFilterOpen(false); }}
          >
            <span>{cat.label}</span>
            {activeFilter === cat.key && <CheckIcon />}
          </button>
        ))}
      </BottomSheet>

      {/* ── SORT BOTTOM SHEET ── */}
      <BottomSheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            className={`sa-sheet-option${activeSort === opt.key ? ' selected' : ''}`}
            onClick={() => { setActiveSort(opt.key); setSortOpen(false); }}
          >
            <span>{opt.label}</span>
            {activeSort === opt.key && <CheckIcon />}
          </button>
        ))}
      </BottomSheet>

      {/* ── ENQUIRE MODAL ── */}
      {enquireProduct && (
        <EnquireModal product={enquireProduct} onClose={() => setEnquireProduct(null)} />
      )}
    </>
  );
}
