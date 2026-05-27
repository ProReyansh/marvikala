import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { useCart } from '../context/CartContext';

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
  { key: 'default',    label: 'Default' },
  { key: 'popularity', label: 'Popularity' },
  { key: 'price-asc',  label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
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
function ShopCard({ product }) {
  const navigate = useNavigate();
  const { items, addToCart, updateQty, removeFromCart } = useCart();
  const [activeVariant, setActiveVariant] = useState(null);

  const variants = (product.colors || []).filter(c => typeof c === 'object' && c?.color);
  const cv = activeVariant !== null ? variants[activeVariant] : null;

  const cartKey = cv ? `${product._id}_v${activeVariant}` : product._id;
  const cartItem = items.find(i => i._id === cartKey);
  const qty = cartItem?.qty || 0;

  const displayPrice         = (cv?.price)         || product.price;
  const displayOriginalPrice = (cv?.originalPrice) || product.originalPrice;

  const imgSrc = (() => {
    const imgs = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
    const baseIdx = product.primaryImageIndex || 0;
    const src = cv ? (imgs[cv.imageIndex ?? baseIdx] || imgs[baseIdx]) : (imgs[baseIdx] || imgs[0]);
    if (!src) return null;
    return src.startsWith('http') ? src : `/uploads/${src}`;
  })();

  const getCartProduct = () => {
    if (!cv) return product;
    const imgs = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
    const baseIdx = product.primaryImageIndex || 0;
    return { ...product, _id: cartKey, name: cv.name || product.name, price: cv.price || product.price, originalPrice: cv.originalPrice || product.originalPrice, images: [imgs[cv.imageIndex ?? baseIdx] || imgs[baseIdx]].filter(Boolean), variantIndex: activeVariant, parentId: product._id };
  };

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${slugify(product.name)}`, { state: { product, activeVariant } })}
    >
      <div className="product-img">
        {imgSrc && <img src={imgSrc} alt={cv?.name || product.name} />}
        {product.newArrival ? (
          <span className="product-badge new-arrival-badge">New</span>
        ) : (product.bestseller || product.featured) ? (
          <span className="product-badge bestseller-badge">Bestseller</span>
        ) : null}
        {!product.inStock && <div className="out-of-stock-overlay">Made to Order</div>}
        {product.inStock && (
          qty === 0 ? (
            <button className="pc-cart-icon-btn" onClick={e => { e.stopPropagation(); addToCart(getCartProduct()); }} aria-label="Add to cart">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </button>
          ) : (
            <div className="pc-cart-icon-ctrl" onClick={e => e.stopPropagation()}>
              <button onClick={() => qty <= 1 ? removeFromCart(cartKey) : updateQty(cartKey, qty - 1)}>−</button>
              <span>{qty}</span>
              <button onClick={() => updateQty(cartKey, qty + 1)}>+</button>
            </div>
          )
        )}
      </div>
      <div className="product-info">
        <div className="product-name">{cv?.name || product.name}</div>
        <div className="product-cat">{CAT_LABEL[product.category] || product.category}</div>
        {(displayPrice || displayOriginalPrice) && (
          <div className="product-price-row">
            {displayPrice         && <span className="price-sale">₹{displayPrice}</span>}
            {displayOriginalPrice && <span className="price-original">₹{displayOriginalPrice}</span>}
            {displayPrice && displayOriginalPrice && displayOriginalPrice > displayPrice && (
              <span className="price-discount-pill">{Math.round((1 - displayPrice / displayOriginalPrice) * 100)}% off</span>
            )}
          </div>
        )}
        {product.colors?.length > 0 && (
          <div className="product-colors" onClick={e => e.stopPropagation()}>
            {product.colors.slice(0, 4).map((c, i) => {
              const isObj = typeof c === 'object' && c?.color;
              const hex = isObj ? c.color : c;
              const isActive = activeVariant === i;
              return (
                <span
                  key={i}
                  className={`product-color-dot${isObj ? ' pc-dot-clickable' : ''}${isActive ? ' pc-dot-active' : ''}`}
                  style={{ background: hex }}
                  onClick={isObj ? () => setActiveVariant(isActive ? null : i) : undefined}
                  title={isObj && c.name ? c.name : hex}
                />
              );
            })}
          </div>
        )}
        <div className={`pc-stock-status ${product.inStock ? 'pc-stock-in' : 'pc-stock-mto'}`}>
          {product.inStock ? 'READY TO SHIP' : 'MADE TO ORDER'}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function ShopAllPage() {
  const navigate = useNavigate();

  const [products, setProducts]   = useState(getCachedProducts);
  const [loading, setLoading]     = useState(() => getCachedProducts().length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort]     = useState('default');
  const [filterOpen, setFilterOpen]     = useState(false);
  const [sortOpen, setSortOpen]         = useState(false);

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
      case 'popularity': {
        const aScore = (a.bestseller || a.featured) ? 1 : 0;
        const bScore = (b.bestseller || b.featured) ? 1 : 0;
        return bScore - aScore;
      }
      case 'price-asc':  return (a.price || 0) - (b.price || 0);
      case 'price-desc': return (b.price || 0) - (a.price || 0);
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
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Based in Mumbai</span>
          <span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free delivery over ₹999</span>
          <span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Shipping Pan India</span>
          <span className="ribbon-gap">✦</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Based in Mumbai</span>
          <span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free delivery over ₹999</span>
          <span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Shipping Pan India</span>
          <span className="ribbon-gap">✦</span>
        </div>
      </div>

      <Navbar searchQuery={searchQuery} onSearch={handleSearch} />

      <div className="sa-page">

        {/* ── Header Row ── */}
        <div className="sa-header-row">
          <BackButton pageName="Shop All" />
          <h1 className="sa-title">Shop All</h1>
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

          {/* Result count hidden per design */}
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
            <p>No products found</p>
          </div>
        ) : (
          <div className="products-grid" key={`${activeFilter}-${activeSort}`}>
            {sorted.map(p => (
              <ShopCard key={p._id} product={p} />
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

    </>
  );
}
