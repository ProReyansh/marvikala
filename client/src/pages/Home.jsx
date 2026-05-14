import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WelcomePopup from '../components/WelcomePopup';
import CartQtyBtn from '../components/CartQtyBtn';

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

const CAT_LABEL = {
  flowers: 'Flowers', keychains: 'Keychains', bookmarks: 'Bookmarks',
  laddugopaldress: 'Laddu Gopal', homedecor: 'Home Decor',
  hairaccessories: 'Hair Accessories', jewellery: 'Jewellery',
  rakhi: 'Rakhi', custom: 'Custom',
};

// Collection card color class mapping
const CAT_COLOR_CLASS = {
  flowers:         'cc-flowers',
  keychains:       'cc-keychains',
  bookmarks:       'cc-bookmarks',
  laddugopaldress: 'cc-gopal',
  homedecor:       'cc-homedecor',
  hairaccessories: 'cc-hair',
  jewellery:       'cc-jewellery',
  rakhi:           'cc-rakhi',
  custom:          'cc-custom',
  all:             'cc-flowers',
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
  const [heroHeading, setHeroHeading]       = useState('');
  const [heroSubtitle, setHeroSubtitle]     = useState('');

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
    axios.get('/api/settings/hero-text')
      .then((res) => {
        if (res.data.heading)  setHeroHeading(res.data.heading);
        if (res.data.subtitle) setHeroSubtitle(res.data.subtitle);
      })
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

  function ProductCard({ product }) {
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
          {imgSrc ? <img src={imgSrc} alt={product.name} /> : <span>🧶</span>}
          {(product.bestseller || product.featured) && (
            <span className="product-badge bestseller-badge">Bestseller</span>
          )}
          {!product.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
        </div>
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          {product.description && <div className="product-desc">{product.description}</div>}
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
          <CartQtyBtn product={product} addClassName="enquire-btn" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* TOP RIBBON — marquee on mobile, static on desktop */}
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
              <div className="search-empty-icon">🔍</div>
              <h3>No results found</h3>
              <p>We couldn't find anything matching "<strong>{searchQuery}</strong>". Try a different word!</p>
              <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => {
                handleSearch('');
                setTimeout(() => {
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }, 80);
              }}>
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
          <section
            className="hero"
            style={heroImageUrl ? { backgroundImage: `url('${heroImageUrl}')` } : undefined}
          >
            {/* Full-bleed background image overlay */}
            <div className="hero-overlay" />
            {/* Text content — positioned over the image */}
            <div className="hero-content">
              <h1>
                {heroHeading || <>Handmade with love,<br />crafted for your<br />everyday joy ♡</>}
              </h1>
              <p className="hero-desc">
                {heroSubtitle || <>Thoughtfully handmade creations that bring warmth,<br className="hero-br" />charm and happiness into your life.</>}
              </p>
              <div className="hero-btns">
                <button
                  className="btn-primary btn-animated"
                  onClick={() => navigate('/shop')}
                >
                  Shop Now
                </button>
                <button
                  className="btn-outline btn-animated hero-btn-story"
                  onClick={() => navigate('/our-story')}
                >
                  Our Story
                </button>
              </div>
            </div>
          </section>

          {/* FEATURE STRIP */}
          <div className="feature-strip">
            {[
              {
                icon: (
                  /* Heart cradled in hands */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 7.5C12 7.5 10 4.5 7.5 4.5C5.2 4.5 3.5 6.5 3.5 8.5C3.5 11.5 7.5 15 12 18C16.5 15 20.5 11.5 20.5 8.5C20.5 6.5 18.8 4.5 16.5 4.5C14 4.5 12 7.5 12 7.5Z"/>
                    <path d="M3 15.5C2 17 2 19 4 20C6.5 21 9 21.5 12 21.5C15 21.5 17.5 21 20 20C22 19 22 17 21 15.5"/>
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
                  /* Simplified India map outline */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 2 L13 2 L17 3 L19 5 L20 7.5 L19 9.5 L20.5 11.5 L18.5 13.5 L17 16.5 L14 20 L12 22 L10 20 L7 16.5 L5.5 13.5 L5 11.5 L4.5 9.5 L5 7 L6.5 4.5 Z"/>
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
                {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                  <div
                    key={c.key}
                    className={`cat-card ${activeCategory === c.key ? 'active' : ''} ${bouncingCat === c.key ? 'cat-bounce' : ''}`}
                    onClick={() => navigate('/collection/' + c.key)}
                  >
                    <div
                      className={`cat-card-img ${c.cls}`}
                      style={{ backgroundImage: `url('${c.img}')` }}
                    />
                    <div className="cat-card-body">
                      <div className="cat-name">{c.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: -8, paddingBottom: 32, background: 'var(--cream)' }}>
            <button className="view-all-btn" onClick={() => navigate('/collections')}>
              Shop All Collections →
            </button>
          </div>

          {/* FEATURED PRODUCT */}
          {!loading && (() => {
            const sigId = (() => { try { return localStorage.getItem('mk_signature_piece_id'); } catch { return null; } })();
            const fp = (sigId && products.find(p => p._id === sigId)) || products.find(p => p.featured || p.bestseller);
            if (!fp) return null;
            const imgs = fp.images?.length > 0 ? fp.images : (fp.image ? [fp.image] : []);
            const imgSrc = imgs[0] ? (imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`) : null;
            return (
              <section className="featured-section fade-section" id="signature">
                <div className="section-head">
                  <h2>Signature Piece</h2>
                </div>
                <div className="featured-card">
                  <div
                    className="featured-card-img"
                    onClick={() => navigate(productUrl(fp), { state: { product: fp } })}
                    style={{ cursor: 'pointer' }}
                  >
                    {imgSrc ? <img src={imgSrc} alt={fp.name} /> : <span>🧶</span>}
                    {(fp.bestseller || fp.featured) && <span className="featured-card-badge">Bestseller</span>}
                  </div>
                  <div className="featured-card-body">
                    <div className="featured-card-cat">{CAT_LABEL[fp.category] || fp.category}</div>
                    <div
                      className="featured-card-name"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(productUrl(fp), { state: { product: fp } })}
                    >
                      {fp.name}
                    </div>
                    {(fp.price || fp.originalPrice) && (
                      <div className="featured-card-price-row">
                        {fp.price && <span className="featured-card-price">₹{fp.price}</span>}
                        {fp.originalPrice && <span className="price-original">₹{fp.originalPrice}</span>}
                      </div>
                    )}
                    <CartQtyBtn
                      product={fp}
                      addClassName="featured-card-btn featured-card-btn--teal"
                    />
                  </div>
                </div>
              </section>
            );
          })()}

          {/* BESTSELLERS (horizontal scroll) */}
          {!loading && bestsellers.length > 0 && (
            <section className="section fade-section" id="bestsellers">
              <div className="section-head">
                <h2>Our Bestsellers</h2>
              </div>
              <div className="h-scroll-row">
                {bestsellers.slice(0, 10).map((product) => {
                  const imgSrc = (() => {
                    const imgs = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
                    if (!imgs[0]) return null;
                    return imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`;
                  })();
                  return (
                    <div
                      key={product._id}
                      className="product-card-h"
                      onClick={() => navigate(productUrl(product), { state: { product } })}
                    >
                      <div className="product-card-h-img">
                        {imgSrc
                          ? <img src={imgSrc} alt={product.name} />
                          : <span>🧶</span>
                        }
                      </div>
                      <div className="product-card-h-body">
                        <div className="product-card-h-name">{product.name}</div>
                        <div className="product-card-h-price">
                          {product.price
                            ? <span className="price-sale">₹{product.price}</span>
                            : <span className="price-enquire">Enquire for price</span>
                          }
                          {product.originalPrice && (
                            <span className="price-original">₹{product.originalPrice}</span>
                          )}
                        </div>
                        <CartQtyBtn product={product} addClassName="product-card-h-btn" />
                      </div>
                    </div>
                  );
                })}
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
              <p className="workshop-teaser-overline">✦ Learn the Craft</p>
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
              <div className="reviews-grid">
                {STATIC_REVIEWS.map((r) => (
                  <div key={r.id} className="review-card">
                    <div className="review-stars">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} className="review-star">★</span>
                      ))}
                    </div>
                    <p className="review-text">"{r.text}"</p>
                    <div className="review-author">{r.author}</div>
                    <div className="review-location">{r.location}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* INSTAGRAM SECTION */}
          <section className="insta-section fade-section" id="instagram">
            <h2>Let's be friends! <span>@marvikala_</span></h2>
            <p>Follow us for daily crochet inspiration</p>
            <div className="insta-grid">
              {['🌸','🔑','🧶','🌿','🎀','💍'].map((emoji, i) => (
                <a
                  key={i}
                  href="https://instagram.com/marvikala"
                  target="_blank"
                  rel="noreferrer"
                  className="insta-item"
                >
                  {emoji}
                </a>
              ))}
            </div>
            <a
              href="https://instagram.com/marvikala"
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              Follow on Instagram @marvikala
            </a>
          </section>

          {/* CONTACT + FAQ */}
          <section className="home-links-section fade-section">
            <div className="home-links-card" onClick={() => navigate('/contact')}>
              <div className="home-links-icon">💬</div>
              <h3 className="home-links-title">Get in Touch</h3>
              <p className="home-links-desc">Have a custom idea or need help? We'd love to hear from you.</p>
              <span className="home-links-cta">Contact Us →</span>
            </div>
            <div className="home-links-card" onClick={() => navigate('/faq')}>
              <div className="home-links-icon">❓</div>
              <h3 className="home-links-title">Got Questions?</h3>
              <p className="home-links-desc">Everything about orders, shipping, custom pieces & more — answered.</p>
              <span className="home-links-cta">Read FAQ →</span>
            </div>
          </section>

        </>
      )}

      {/* Popup trigger button */}
      <div className="popup-trigger-wrap">
        <button className="popup-trigger-btn" onClick={() => setShowPopup(true)}>
          🎁 Get 10% Off
        </button>
      </div>

      <Footer />

      <WelcomePopup forceShow={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
}
