import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EnquireModal from '../components/EnquireModal';

const CATEGORIES = [
  { key: 'all',              label: 'All',              icon: '✨', sub: 'Everything',           cls: 'cc1' },
  { key: 'flowers',          label: 'Flowers',           icon: '🌸', sub: 'Crochet blooms',       cls: 'cc2' },
  { key: 'keychains',        label: 'Keychains',         icon: '🔑', sub: 'Cute & colourful',     cls: 'cc3' },
  { key: 'bookmarks',        label: 'Bookmarks',         icon: '🔖', sub: 'Cute page markers',    cls: 'cc4' },
  { key: 'laddugopaldress',  label: 'Laddu Gopal',       icon: '🕉️', sub: 'Devotional dress',     cls: 'cc5' },
  { key: 'homedecor',        label: 'Home Decor',        icon: '🏠', sub: 'Curtain ties & more',  cls: 'cc6' },
  { key: 'hairaccessories',  label: 'Hair Accessories',  icon: '🎀', sub: 'Clips & bands',        cls: 'cc7' },
  { key: 'jewellery',        label: 'Jewellery',         icon: '💍', sub: 'Crochet gems',         cls: 'cc8' },
  { key: 'rakhi',            label: 'Rakhi',             icon: '🪢', sub: 'Festive & special',    cls: 'cc9' },
  { key: 'custom',           label: 'Custom',            icon: '🎨', sub: 'Your idea, our hands', cls: 'cc10' },
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
  const [enquireProduct, setEnquireProduct] = useState(null);
  const [searchQuery, setSearchQuery]       = useState(getSavedSearch);
  const [bouncingCat, setBouncingCat]       = useState(null);

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
        onClick={() => {
          // Save scroll position so back button returns here
          try { sessionStorage.setItem('mk_scroll_/', String(window.scrollY)); } catch {}
          navigate(productUrl(product), { state: { product } });
        }}
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
              {product.originalPrice && (
                <span className="price-original">₹{product.originalPrice}</span>
              )}
              {product.price && (
                <span className="price-sale">₹{product.price}</span>
              )}
            </div>
          )}
          <button
            className="enquire-btn"
            disabled={!product.inStock}
            onClick={(e) => { e.stopPropagation(); product.inStock && setEnquireProduct(product); }}
          >
            {product.inStock ? 'Enquire Now' : 'Out of Stock'}
          </button>
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
          <section className="hero">
            <div>
              <div className="hero-eyebrow">✦ Handmade in Mumbai</div>
              <h1>
                Handmade with love,<br />
                crafted for your<br />
                everyday joy ♡
              </h1>
              <p className="hero-desc">
                Thoughtfully handmade creations that bring warmth, charm and happiness into your life.
              </p>
              <div className="hero-btns">
                <button
                  className="btn-primary btn-animated"
                  onClick={() => navigate('/shop')}
                >
                  Shop Now
                </button>
                <button
                  className="btn-outline btn-animated"
                  onClick={() => navigate('/our-story')}
                >
                  Our Story
                </button>
              </div>
            </div>
            <div className="hero-mosaic">🧶</div>
          </section>

          {/* SHOP BY COLLECTION (horizontal scroll) */}
          <div style={{ background: 'var(--cream)' }}>
            <section className="section" id="collections">
              <div className="section-head">
                <h2>Shop by Collection 🍃</h2>
                <p>Browse our handmade categories</p>
              </div>
              {/* Desktop grid */}
              <div className="categories-grid categories-grid-desktop">
                {CATEGORIES.map((c) => (
                  <div
                    key={c.key}
                    className={`cat-card ${c.cls} ${activeCategory === c.key ? 'active' : ''} ${bouncingCat === c.key ? 'cat-bounce' : ''}`}
                    onClick={() => handleCatClick(c.key)}
                  >
                    <div className="cat-icon">{c.icon}</div>
                    <div className="cat-name">{c.label}</div>
                    <div className="cat-sub">{c.sub}</div>
                  </div>
                ))}
              </div>
              {/* Mobile horizontal scroll */}
              <div className="h-scroll-row categories-row-mobile">
                {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                  <div
                    key={c.key}
                    className={`collection-card-h${activeCategory === c.key ? ' active' : ''}`}
                    onClick={() => handleCatClick(c.key)}
                  >
                    <div className={`collection-card-h-img ${CAT_COLOR_CLASS[c.key] || ''}`}>{c.icon}</div>
                    <span className="collection-card-h-name">{c.label}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* BESTSELLERS (horizontal scroll) */}
          {!loading && bestsellers.length > 0 && (
            <section className="section" id="bestsellers">
              <div className="section-head">
                <h2>Our Bestsellers ♡</h2>
                <p>Most loved picks</p>
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
                      onClick={() => {
                        try { sessionStorage.setItem('mk_scroll_/', String(window.scrollY)); } catch {}
                        navigate(productUrl(product), { state: { product } });
                      }}
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
                          {product.originalPrice && (
                            <span className="price-original">₹{product.originalPrice}</span>
                          )}
                          {product.price
                            ? <span className="price-sale">₹{product.price}</span>
                            : <span className="price-enquire">Enquire for price</span>
                          }
                        </div>
                        <button
                          className="product-card-h-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            product.inStock && setEnquireProduct(product);
                          }}
                        >
                          {product.inStock ? 'Enquire' : 'Out of Stock'}
                        </button>
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
          <section className="story-teaser">
            <div className="story-teaser-img">🪡</div>
            <div className="story-teaser-text">
              <div className="story-teaser-eyebrow">Our Story</div>
              <h2>A mother's creativity. A daughter's dream.</h2>
              <p>From a small studio in Mumbai, every piece is handcrafted with patience, love, and intention.</p>
              <button className="btn-primary" onClick={() => navigate('/our-story')}>
                Read Our Story →
              </button>
            </div>
          </section>

          {/* REVIEWS */}
          <div className="reviews-section">
            <section className="section" id="reviews">
              <div className="section-head">
                <h2>Loved by Customers ♡</h2>
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
          <section className="insta-section" id="instagram">
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

        </>
      )}

      <Footer />

      {enquireProduct && (
        <EnquireModal product={enquireProduct} onClose={() => setEnquireProduct(null)} />
      )}
    </>
  );
}
