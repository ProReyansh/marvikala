import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WelcomePopup from '../components/WelcomePopup';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  { key: 'all',              label: 'All',              icon: '✨', sub: 'Everything',           cls: 'cc1',  img: 'https://picsum.photos/seed/craft/400/400' },
  { key: 'flowers',          label: 'Flowers',           icon: '🌸', sub: 'Crochet blooms',       cls: 'cc2',  img: 'https://picsum.photos/seed/flowers/400/400' },
  { key: 'keychains',        label: 'Keychains',         icon: '🔑', sub: 'Cute & colourful',     cls: 'cc3',  img: 'https://picsum.photos/seed/keychain/400/400' },
  { key: 'bookmarks',        label: 'Bookmarks',         icon: '🔖', sub: 'Cute page markers',    cls: 'cc4',  img: 'https://picsum.photos/seed/bookmark/400/400' },
  { key: 'laddugopaldress',  label: 'Laddu Gopal',       icon: '🕉️', sub: 'Devotional dress',     cls: 'cc5',  img: 'https://picsum.photos/seed/gopal/400/400' },
  { key: 'homedecor',        label: 'Home Decor',        icon: '🏠', sub: 'Curtain ties & more',  cls: 'cc6',  img: 'https://picsum.photos/seed/homedecor/400/400' },
  { key: 'hairaccessories',  label: 'Hair Accessories',  icon: '🎀', sub: 'Clips & bands',        cls: 'cc7',  img: 'https://picsum.photos/seed/hair/400/400' },
  { key: 'jewellery',        label: 'Jewellery',         icon: '💍', sub: 'Crochet gems',         cls: 'cc8',  img: 'https://picsum.photos/seed/jewellery/400/400' },
  { key: 'rakhi',            label: 'Rakhi',             icon: '🪢', sub: 'Festive & special',    cls: 'cc9',  img: 'https://picsum.photos/seed/rakhi/400/400' },
  { key: 'custom',           label: 'Custom',            icon: '🎨', sub: 'Your idea, our hands', cls: 'cc10', img: 'https://picsum.photos/seed/custom/400/400' },
];

// Static cover images for specific categories — override picsum placeholders
const STATIC_CAT_IMGS = {
  flowers:          '/images/flower-collection.png',
  keychains:        '/images/keychain-collection.png',
  bookmarks:        '/images/bookmarks-collection.png',
  laddugopaldress:  '/images/laddugopaldress-collection.png',
  jewellery:        '/images/jewellery-collection.png',
  homedecor:        '/images/homedecor-collection.png',
  hairaccessories:  '/images/hairaccessories-collection.png',
  rakhi:            '/images/rakhi-collection.png',
};

const CAT_LABEL = {
  flowers: 'Flowers', keychains: 'Keychains', bookmarks: 'Bookmarks',
  laddugopaldress: 'Laddu Gopal', homedecor: 'Home Decor',
  hairaccessories: 'Hair Accessories', jewellery: 'Jewellery',
  rakhi: 'Rakhi', custom: 'Custom',
};

// Build a clean SEO-friendly URL: /product/crochet-flower-bouquet
function slugify(name) {
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
function productUrl(product) {
  return `/product/${slugify(product.name)}`;
}

// sessionStorage helpers — persist search query and product cache across navigation
function getSavedSearch() {
  try { return sessionStorage.getItem('mk_search') || ''; } catch { return ''; }
}
function saveSearch(q) {
  try { sessionStorage.setItem('mk_search', q); } catch {}
}
function getCachedProducts() {
  try {
    const c = sessionStorage.getItem('mk_products');
    return c ? JSON.parse(c) : [];
  } catch { return []; }
}
function setCachedProducts(list) {
  try { sessionStorage.setItem('mk_products', JSON.stringify(list)); } catch {}
}

const STATIC_REVIEWS = [
  {
    id: 1,
    text: "Absolutely loved the crochet flowers! They're so beautifully made — you can really feel the care and craft in every stitch. Perfect gift.",
    author: "Priya S.",
    location: "Mumbai",
  },
  {
    id: 2,
    text: "Ordered a custom Laddu Gopal dress and it was stunning. The colours were exactly what I wanted. Will definitely order again!",
    author: "Anita M.",
    location: "Mumbai",
  },
  {
    id: 3,
    text: "The keychains are so adorable and sturdy. Everyone at the office wanted one! Great quality for the price. Highly recommend.",
    author: "Sneha R.",
    location: "Thane",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // Load from cache immediately — no spinner on back-navigation
  const [products, setProducts]             = useState(getCachedProducts);
  const [loading, setLoading]               = useState(() => getCachedProducts().length === 0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery]       = useState(getSavedSearch);
  const [bouncingCat, setBouncingCat]       = useState(null);
  const [showPopup, setShowPopup]           = useState(false);
  const [heroImageUrl, setHeroImageUrl]     = useState('');
  const [heroButtonLink, setHeroButtonLink] = useState('/shop');
  const [naIndex, setNaIndex]               = useState(0);
  const [reviewIndex, setReviewIndex]       = useState(0);
  const reviewTrackRef = useRef(null);

  // True only on the very first ever visit — mark visited immediately so
  // navigating back to home (same session or later) never re-triggers intro animations.
  const [isFirstVisit] = useState(() => {
    try {
      if (localStorage.getItem('mk_home_anim_v1')) return false;
      localStorage.setItem('mk_home_anim_v1', '1');
      return true;
    } catch { return false; }
  });

  function handleSearch(q) {
    setSearchQuery(q);
    saveSearch(q);
    // When clearing search, scroll to top so the user sees the home page, not the footer
    if (!q) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    document.title = 'Marvikala — Handmade Crochet';
  }, []);

  useEffect(() => {
    // Always re-fetch in background to get fresh data
    axios.get('/api/products')
      .then((res) => {
        setProducts(res.data);
        setCachedProducts(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    axios.get('/api/settings/hero-image')
      .then((res) => { if (res.data.url) setHeroImageUrl(res.data.url); })
      .catch(() => {});
    axios.get('/api/settings/hero-button')
      .then((res) => { if (res.data.link) setHeroButtonLink(res.data.link); })
      .catch(() => {});
  }, []);

  // When arriving from another page via a navbar section link, scroll to that section.
  // Uses sessionStorage (not location.state) so the target is cleared immediately after
  // reading — reload and back-navigation never repeat the scroll.
  useEffect(() => {
    let target;
    try { target = sessionStorage.getItem('mk_scroll_to'); } catch {}
    if (!target) return;
    try { sessionStorage.removeItem('mk_scroll_to'); } catch {}
    const t = setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  function handleCatClick(key) {
    setBouncingCat(key);
    setTimeout(() => setBouncingCat(null), 400);
    setActiveCategory(key);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }

  // Add body class so CSS animations are gated to first visit only
  useEffect(() => {
    if (isFirstVisit) document.body.classList.add('home-intro-active');
    return () => document.body.classList.remove('home-intro-active');
  }, [isFirstVisit]);

  // Scroll-triggered fade-up — only animates on first-ever website visit.
  // Also depends on searchQuery so sections are revealed when user clears
  // a search (sections unmount in search mode and re-mount invisible on clear).
  useEffect(() => {
    const els = document.querySelectorAll('.fade-section');
    if (!els.length) return;
    if (!isFirstVisit) {
      els.forEach(el => el.classList.add('fade-section-visible'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('fade-section-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [products, isFirstVisit, searchQuery]);

  const q = searchQuery.trim().toLowerCase();

  const searchResults = q
    ? products.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (CAT_LABEL[p.category] || p.category).toLowerCase().includes(q)
      )
    : [];

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  const bestsellers = products.filter((p) => p.bestseller || p.featured);

  function SwipeCarousel({ items, sectionId, title }) {
    const trackRef = useRef(null);
    const storageKey = `mk_carousel_${sectionId}`;
    const [activeIdx, setActiveIdx] = useState(() => {
      try { return parseInt(sessionStorage.getItem(storageKey) || '0', 10); } catch { return 0; }
    });

    // Restore scroll position on mount (without animation)
    useEffect(() => {
      const el = trackRef.current;
      if (!el || activeIdx === 0) return;
      requestAnimationFrame(() => {
        el.scrollLeft = activeIdx * el.offsetWidth;
      });
    }, []); // eslint-disable-line

    // Save position whenever it changes
    useEffect(() => {
      try { sessionStorage.setItem(storageKey, String(activeIdx)); } catch {}
    }, [activeIdx, storageKey]);

    const onScroll = useCallback(() => {
      const el = trackRef.current;
      if (!el) return;
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      setActiveIdx(idx);
    }, []);

    function scrollTo(i) {
      const el = trackRef.current;
      if (!el) return;
      el.scrollTo({ left: i * el.offsetWidth, behavior: 'smooth' });
    }

    return (
      <section className="section fade-section" id={sectionId}>
        <div className="section-head"><h2>{title}</h2></div>
        <div className="na-swipe-track" ref={trackRef} onScroll={onScroll}>
          {items.map((product) => (
            <div className="na-swipe-item" key={product._id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        {items.length > 1 && (
          <div className="na-dots">
            {items.map((_, i) => (
              <button
                key={i}
                className={`na-dot${i === activeIdx ? ' na-dot-active' : ''}`}
                onClick={() => scrollTo(i)}
                aria-label={`Go to item ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>
    );
  }

  function ProductCard({ product, noCart = false }) {
    const { items, addToCart, updateQty, removeFromCart } = useCart();
    const cartItem = items.find(i => i._id === product._id);
    const qty = cartItem?.qty || 0;

    const imgSrc = (() => {
      const imgs = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
      if (!imgs[0]) return null;
      return imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`;
    })();

    return (
      <div
        className="product-card"
        onClick={() => navigate(productUrl(product), { state: { product } })}
      >
        <div className="product-img">
          {imgSrc && <img src={imgSrc} alt={product.name} />}
          {product.newArrival ? (
            <span className="product-badge new-arrival-badge">New</span>
          ) : (product.bestseller || product.featured) ? (
            <span className="product-badge bestseller-badge">Bestseller</span>
          ) : null}
          {!product.inStock && <div className="out-of-stock-overlay">Made to Order</div>}

          {/* Cart icon — top right corner */}
          {!noCart && product.inStock && (
            qty === 0 ? (
              <button
                className="pc-cart-icon-btn"
                onClick={e => { e.stopPropagation(); addToCart(product); }}
                aria-label="Add to cart"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </button>
            ) : (
              <div className="pc-cart-icon-ctrl" onClick={e => e.stopPropagation()}>
                <button onClick={() => qty <= 1 ? removeFromCart(product._id) : updateQty(product._id, qty - 1)}>−</button>
                <span>{qty}</span>
                <button onClick={() => updateQty(product._id, qty + 1)}>+</button>
              </div>
            )
          )}
        </div>
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          <div className="product-cat">{CAT_LABEL[product.category] || product.category}</div>
          {(product.price || product.originalPrice) && (
            <div className="product-price-row">
              {product.price && (
                <span className="price-sale">₹{product.price}</span>
              )}
              {product.originalPrice && (
                <span className="price-original">₹{product.originalPrice}</span>
              )}
            </div>
          )}
          <div className={`pc-stock-status ${product.inStock ? 'pc-stock-in' : 'pc-stock-mto'}`}>
            {product.inStock ? 'READY TO SHIP' : 'MADE TO ORDER'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="top-ribbon">
        <div className="top-ribbon-track">
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Shipping Pan India</span><span className="ribbon-gap">✦</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Shipping Pan India</span><span className="ribbon-gap">✦</span>
        </div>
      </div>
      <Navbar searchQuery={searchQuery} onSearch={handleSearch} />


      {/* ── SEARCH MODE ── */}
      {q ? (
        <section className="search-results-page">
          <div className="search-results-header">
            <div className="search-results-meta">
              <span className="search-results-count">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for
              </span>
              <span className="search-results-query">"{searchQuery}"</span>
            </div>
            <button className="search-results-clear" onClick={() => handleSearch('')}>
              Clear search
            </button>
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : searchResults.length === 0 ? (
            <div className="search-empty">
              <h3>No results found</h3>
              <p>We couldn't find anything matching "<strong>{searchQuery}</strong>". Try a different word!</p>
              <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => { handleSearch(''); navigate('/shop'); }}>
                Browse all products
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {searchResults.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* ── NORMAL MODE ── */
        <>
          {/* HERO */}
          <section className="hero">
            {/* Image — top portion */}
            <div
              className="hero-img-top"
              style={heroImageUrl ? { backgroundImage: `url('${heroImageUrl}')` } : undefined}
            >
              <div className="hero-overlay" />
            </div>
            {/* CTA — below the image */}
            <div className="hero-content">
              <div className="hero-btns">
                <button
                  className="btn-primary btn-animated"
                  onClick={() => navigate(heroButtonLink)}
                >
                  Explore Now
                </button>
              </div>
            </div>
          </section>

          {/* FEATURE STRIP */}
          <div className="feature-strip">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {/* Heart */}
                    <path d="M12,10 C12,10 10.5,7.5 8,7.5 C5.8,7.5 4,9.2 4,11 C4,14 8,17 12,20 C16,17 20,14 20,11 C20,9.2 18.2,7.5 16,7.5 C13.5,7.5 12,10 12,10Z"/>
                    {/* Left arm cradling */}
                    <path d="M1.5,22 C2,19.5 4,18 6.5,17.5"/>
                    {/* Right arm cradling */}
                    <path d="M22.5,22 C22,19.5 20,18 17.5,17.5"/>
                    {/* Cupped palms under heart */}
                    <path d="M6.5,17.5 Q12,20 17.5,17.5"/>
                  </svg>
                ),
                text: 'Handmade\nwith love',
              },
              {
                icon: (
                  /* 3-D box / package */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                ),
                text: 'Made to\norder',
              },
              {
                icon: (
                  /* Gift box */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12"/>
                    <rect x="2" y="7" width="20" height="5"/>
                    <line x1="12" y1="22" x2="12" y2="7"/>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                  </svg>
                ),
                text: 'Perfect\nfor gifting',
              },
              {
                icon: (
                  /* Ashoka Chakra — 12-spoke wheel, iconic Indian symbol */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                    <line x1="12" y1="3" x2="12" y2="12"/>
                    <line x1="16.5" y1="4.2" x2="12" y2="12"/>
                    <line x1="19.8" y1="7.5" x2="12" y2="12"/>
                    <line x1="21" y1="12" x2="12" y2="12"/>
                    <line x1="19.8" y1="16.5" x2="12" y2="12"/>
                    <line x1="16.5" y1="19.8" x2="12" y2="12"/>
                    <line x1="12" y1="21" x2="12" y2="12"/>
                    <line x1="7.5" y1="19.8" x2="12" y2="12"/>
                    <line x1="4.2" y1="16.5" x2="12" y2="12"/>
                    <line x1="3" y1="12" x2="12" y2="12"/>
                    <line x1="4.2" y1="7.5" x2="12" y2="12"/>
                    <line x1="7.5" y1="4.2" x2="12" y2="12"/>
                  </svg>
                ),
                text: 'Made in\nIndia',
              },
            ].map(({ icon, text }) => (
              <div key={text} className="feature-strip-item">
                <span className="feature-strip-icon">{icon}</span>
                <span className="feature-strip-label">{text}</span>
              </div>
            ))}
          </div>

          {/* SHOP BY COLLECTION — 3×3 grid */}
          <div style={{ background: 'var(--cream)' }}>
            <section className="section fade-section" id="collections">
              <div className="section-head">
                <h2>Shop by Collection</h2>
              </div>
              <div className="categories-3x3-grid">
                {CATEGORIES.filter((c) => c.key !== 'all').map((c) => {
                  // Priority: static override → real product photo → picsum fallback
                  const catImg = (() => {
                    if (STATIC_CAT_IMGS[c.key]) return STATIC_CAT_IMGS[c.key];
                    const pool = products.filter(p => p.category === c.key);
                    const pick = pool.find(p => p.bestseller || p.featured) || pool[0];
                    if (pick) {
                      const imgs = pick.images?.length > 0 ? pick.images : (pick.image ? [pick.image] : []);
                      if (imgs[0]) return imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`;
                    }
                    return c.img;
                  })();
                  return (
                    <div
                      key={c.key}
                      className={`cat-card ${activeCategory === c.key ? 'active' : ''} ${bouncingCat === c.key ? 'cat-bounce' : ''}`}
                      onClick={() => navigate('/collection/' + c.key)}
                    >
                      <div
                        className={`cat-card-img ${c.cls}`}
                        style={{ backgroundImage: `url('${catImg}')` }}
                      />
                      <div className="cat-card-body">
                        <div className="cat-name">{c.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: -32, paddingBottom: 32, background: 'var(--cream)' }}>
            <button className="view-all-btn" onClick={() => navigate('/collections')}>
              Shop All Collections →
            </button>
          </div>

          {/* NEW ARRIVALS — horizontal scroll */}
          {!loading && products.filter(p => p.newArrival).length > 0 && (() => {
            const newArrivals = products.filter(p => p.newArrival);
            return (
              <SwipeCarousel items={newArrivals} sectionId="new-arrivals" title="New Arrivals" />
            );
          })()}

          {/* BESTSELLERS */}
          {!loading && bestsellers.length > 0 && (
            <section className="section fade-section" id="bestsellers">
              <div className="section-head">
                <h2>Our Bestsellers</h2>
              </div>
              <div className="new-arrivals-2x2">
                {bestsellers.slice(0, 8).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <button className="view-all-btn" onClick={() => navigate('/bestsellers')}>
                View All Bestsellers →
              </button>
            </section>
          )}

          {/* STORY TEASER */}
          <section className="story-teaser story-teaser--text-only fade-section">
            <div className="story-teaser-text">
              <div className="story-teaser-label">Our Story</div>
              <h2 className="story-teaser-heading">A mother's creativity. A daughter's dream.</h2>
              <p>From a small studio in Mumbai, every piece is handcrafted with patience, love, and intention.</p>
              <button className="btn-primary" onClick={() => navigate('/our-story')}>
                Read Our Story →
              </button>
            </div>
          </section>

          {/* WORKSHOPS */}
          <section className="workshop-teaser fade-section" id="workshops">
            <div className="workshop-teaser-inner">
              <h2 className="workshop-teaser-title">Join Our Workshops</h2>
              <p className="workshop-teaser-desc">
                Learn the art of crochet from the hands that made it — beginner-friendly sessions held right here in our Mumbai studio.
              </p>
              <button className="btn-primary" onClick={() => navigate('/workshops')}>
                Explore Workshops →
              </button>
            </div>
          </section>

          {/* HOW TO ORDER */}
          <section className="how-to-order-teaser fade-section">
            <div className="how-to-order-inner">
              <h2 className="how-to-order-heading">How to Order</h2>
              <div className="how-to-order-steps">
                <div className="how-to-order-step">
                  <span className="how-to-order-step-num">01</span>
                  <div>
                    <div className="how-to-order-step-title">Browse & Choose</div>
                    <div className="how-to-order-step-desc">Explore our collections and pick your favourite piece</div>
                  </div>
                </div>
                <div className="how-to-order-step-divider" aria-hidden="true">→</div>
                <div className="how-to-order-step">
                  <span className="how-to-order-step-num">02</span>
                  <div>
                    <div className="how-to-order-step-title">Place Your Order</div>
                    <div className="how-to-order-step-desc">Add to cart and reach out to us on WhatsApp to confirm</div>
                  </div>
                </div>
                <div className="how-to-order-step-divider" aria-hidden="true">→</div>
                <div className="how-to-order-step">
                  <span className="how-to-order-step-num">03</span>
                  <div>
                    <div className="how-to-order-step-title">Handcrafted & Delivered</div>
                    <div className="how-to-order-step-desc">We make it with love and ship it right to your door</div>
                  </div>
                </div>
              </div>
              <button className="btn-outline how-to-order-btn" onClick={() => navigate('/how-to-order')}>
                See Full Ordering Guide →
              </button>
            </div>
          </section>

          {/* REVIEWS */}
          <div className="reviews-section fade-section">
            <section className="section" id="reviews">
              <div className="section-head">
                <h2>Loved by Customers</h2>
                <p>Kind words from 100+ happy customers across Mumbai</p>
              </div>
              <div
                className="na-swipe-track"
                ref={reviewTrackRef}
                onScroll={() => {
                  const el = reviewTrackRef.current;
                  if (!el) return;
                  setReviewIndex(Math.round(el.scrollLeft / el.offsetWidth));
                }}
              >
                {STATIC_REVIEWS.map((r) => (
                  <div className="na-swipe-item" key={r.id}>
                    <div className="review-card">
                      <div className="review-stars">
                        {[1,2,3,4,5].map((s) => (
                          <span key={s} className="review-star">★</span>
                        ))}
                      </div>
                      <p className="review-text">"{r.text}"</p>
                      <div className="review-author">{r.author}</div>
                      <div className="review-location">{r.location}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="na-dots">
                {STATIC_REVIEWS.map((_, i) => (
                  <button
                    key={i}
                    className={`na-dot${i === reviewIndex ? ' na-dot-active' : ''}`}
                    onClick={() => {
                      const el = reviewTrackRef.current;
                      if (el) el.scrollTo({ left: i * el.offsetWidth, behavior: 'smooth' });
                    }}
                    aria-label={`Go to review ${i + 1}`}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* INSTAGRAM SECTION */}
          <section className="insta-section fade-section" id="instagram">
            <h2>Let's be friends! <span>@marvikala_</span></h2>
            <p>Follow us for daily crochet inspiration</p>
            <div className="insta-grid">
              {products
                .filter(p => {
                  const imgs = p.images?.length > 0 ? p.images : (p.image ? [p.image] : []);
                  return !!imgs[0];
                })
                .slice(0, 6)
                .map((p) => {
                  const imgs = p.images?.length > 0 ? p.images : (p.image ? [p.image] : []);
                  const src = imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`;
                  return (
                    <a
                      key={p._id}
                      href="https://instagram.com/marvikala_"
                      target="_blank"
                      rel="noreferrer"
                      className="insta-item"
                      aria-label={p.name}
                    >
                      <img src={src} alt={p.name} loading="lazy" />
                    </a>
                  );
                })
              }
            </div>
            <a
              href="https://instagram.com/marvikala_"
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              Follow on Instagram @marvikala_
            </a>
          </section>

          {/* CONTACT + FAQ */}
          <section className="home-links-section fade-section">
            <div className="home-links-card" onClick={() => navigate('/faq')}>
                <h3 className="home-links-title">Got Questions?</h3>
              <p className="home-links-desc">Everything about orders, shipping, custom pieces & more — answered.</p>
              <span className="home-links-cta">Read FAQ →</span>
            </div>
          </section>

        </>
      )}

      {/* Popup trigger — 10% off section (hidden during search) */}
      {!q && (
        <div className="popup-trigger-wrap">
          <h3 className="popup-trigger-heading">New here? Get 10% off your first order.</h3>
          <p className="popup-trigger-subtext">Enter your details and we'll send you an exclusive discount code — just for you.</p>
          <button className="popup-trigger-btn" onClick={() => setShowPopup(true)}>
            Claim My 10% Off
          </button>
        </div>
      )}

      <Footer />

      <WelcomePopup forceShow={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
}
