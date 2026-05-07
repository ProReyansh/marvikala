import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EnquireModal from '../components/EnquireModal';
import CustomOrderModal from '../components/CustomOrderModal';

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

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // Load from cache immediately — no spinner on back-navigation
  const [products, setProducts]       = useState(getCachedProducts);
  const [loading, setLoading]         = useState(() => getCachedProducts().length === 0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [enquireProduct, setEnquireProduct] = useState(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(getSavedSearch);
  const [bouncingCat, setBouncingCat] = useState(null);

  function handleSearch(q) {
    setSearchQuery(q);
    saveSearch(q);
  }

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

  // When arriving from another page via a navbar section link, scroll to that section
  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target) return;
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
            <span className="product-badge bestseller-badge">🏆 Bestseller</span>
          )}
          {!product.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
        </div>
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          {product.description && <div className="product-desc">{product.description}</div>}
          <div className="product-cat">{CAT_LABEL[product.category] || product.category}</div>
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
              ✕ Clear search
            </button>
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : searchResults.length === 0 ? (
            <div className="search-empty">
              <div className="search-empty-icon">🔍</div>
              <h3>No results found</h3>
              <p>We couldn't find anything matching "<strong>{searchQuery}</strong>". Try a different word!</p>
              <button className="btn-gradient" style={{ marginTop: 20 }} onClick={() => {
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
              <div className="hero-eyebrow">🎉 Mumbai · Shipping in Mumbai</div>
              <h1>
                Colourful.<br />
                <span className="accent-yellow">Creative.</span><br />
                <span className="accent-red">Crochet.</span>
              </h1>
              <p className="hero-desc">
                Handcrafted flowers, keychains, earrings, Laddu Gopal dresses and more —
                every piece made with love from Mumbai, just for you.
              </p>
              <div className="hero-btns">
                <a href="#products" className="btn-gradient btn-animated"
                  onClick={(e) => { e.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  Shop Now 🛍️
                </a>
                <a href="#custom" className="btn-light btn-animated"
                  onClick={(e) => { e.preventDefault(); document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  Custom Order →
                </a>
              </div>
            </div>
            <div className="hero-mosaic">
              <div className="mosaic-tile mt1">🧶</div>
              <div className="mosaic-tile mt2">🌸</div>
              <div className="mosaic-tile mt3">🔑</div>
              <div className="mosaic-tile mt4">✨</div>
              <div className="mosaic-tile mt6">🎀</div>
              <div className="mosaic-tile mt5">🕉️</div>
              <div className="mosaic-tile mt7">🎨</div>
            </div>
          </section>

          {/* CATEGORIES */}
          <section className="section">
            <div className="section-head">
              <h2>What do you need? 🎨</h2>
              <p>Browse our handmade crochet categories</p>
            </div>
            <div className="categories-grid">
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
          </section>

          {/* ALL PRODUCTS */}
          <section className="section bg-white" id="products">
            <div className="section-head">
              <h2>Our Products 🛍️</h2>
              <p>Click any product to see details — tap Enquire Now to order!</p>
            </div>
            {loading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : (
              <div className="products-grid">
                {filtered.length === 0 ? (
                  <div className="no-products">
                    <div className="icon">🧶</div>
                    <p>No products in this category yet — check back soon!</p>
                  </div>
                ) : (
                  filtered.map((product) => <ProductCard key={product._id} product={product} />)
                )}
              </div>
            )}
          </section>

          {/* BESTSELLERS */}
          {!loading && bestsellers.length > 0 && (
            <section className="section bestsellers-section" id="bestsellers">
              <div className="section-head">
                <h2>Our Bestsellers 🏆</h2>
                <p>Most loved picks — order yours before they're gone!</p>
              </div>
              <div className="products-grid">
                {bestsellers.map((product) => <ProductCard key={product._id} product={product} />)}
              </div>
            </section>
          )}
        </>
      )}

      {/* CUSTOM ORDER → OUR STORY → CONTACT (hidden during search) */}
      {!q && (
        <>
          <div className="custom-banner" id="custom">
            <div>
              <div className="custom-eyebrow">✦ Custom Orders Open</div>
              <h2>Want something unique?</h2>
              <p>
                Tell us your idea — colour, size, design — and we'll create something
                special, handmade just for you.
              </p>
            </div>
            <button className="btn-glow btn-animated" onClick={() => setCustomModalOpen(true)}>
              Let's Create! ✨
            </button>
          </div>

          {/* OUR STORY — below custom order */}
          <section className="about-section" id="about">
            <div className="about-content">
              <div className="about-text">
                <div className="about-eyebrow">✦ Our Story</div>
                <h2>Made with love, stitch by stitch</h2>
                <p>
                  Hi! I'm the founder of Marvikala — a small handmade crochet studio based in Mumbai.
                  What started as a passion for creating beautiful things with yarn has grown into
                  a little business bringing joy to people across the city.
                </p>
                <p>
                  Every flower bouquet, keychain, bookmark, and Laddu Gopal dress is handcrafted
                  with care and attention to detail. No two pieces are ever exactly the same —
                  that's the magic of handmade!
                </p>
                <div className="about-highlights">
                  <div className="about-highlight">
                    <span className="about-highlight-icon">🧶</span>
                    <span>100% Handmade</span>
                  </div>
                  <div className="about-highlight">
                    <span className="about-highlight-icon">🎨</span>
                    <span>Custom Orders Welcome</span>
                  </div>
                  <div className="about-highlight">
                    <span className="about-highlight-icon">📦</span>
                    <span>Shipping in Mumbai</span>
                  </div>
                </div>
              </div>
              <div className="about-mosaic">
                <div className="about-tile at1">🌸</div>
                <div className="about-tile at2">🧶</div>
                <div className="about-tile at3">🎀</div>
                <div className="about-tile at4">💍</div>
                <div className="about-tile at5">🕉️</div>
                <div className="about-tile at6">🎨</div>
              </div>
            </div>
          </section>

          {/* SAY HELLO — below our story */}
          <section className="contact-section" id="contact">
            <div className="contact-head">
              <h2>Say Hello! 👋</h2>
              <p>Place an order, ask about a custom piece, or just send us a message</p>
            </div>
            <div className="contact-cards">
              <a href="https://wa.me/919769238160" className="contact-card wa-card" target="_blank" rel="noreferrer">
                <div className="contact-icon">📱</div>
                <h3>WhatsApp</h3>
                <p>+91 97692 38160</p>
              </a>
              <a href="https://instagram.com/marvikala" className="contact-card ig-card" target="_blank" rel="noreferrer">
                <div className="contact-icon">📸</div>
                <h3>Instagram</h3>
                <p>@marvikala</p>
              </a>
            </div>
          </section>
        </>
      )}

      <Footer />

      {enquireProduct && (
        <EnquireModal product={enquireProduct} onClose={() => setEnquireProduct(null)} />
      )}
      {customModalOpen && (
        <CustomOrderModal onClose={() => setCustomModalOpen(false)} />
      )}
    </>
  );
}
