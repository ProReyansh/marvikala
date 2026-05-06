import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EnquireModal from '../components/EnquireModal';
import ProductModal from '../components/ProductModal';
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


export default function Home() {
  const [products, setProducts]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [activeCategory, setActiveCategory]   = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [enquireProduct, setEnquireProduct]   = useState(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [searchQuery, setSearchQuery]         = useState('');
  const [bouncingCat, setBouncingCat]         = useState(null);

  useEffect(() => {
    axios
      .get('/api/products')
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchQuery]);

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

  function ProductCard({ product }) {
    return (
      <div
        className="product-card"
        onClick={() => setSelectedProduct(product)}
      >
        <div className="product-img">
          {product.image ? (
            <img src={product.image.startsWith('http') ? product.image : `/uploads/${product.image}`} alt={product.name} />
          ) : (
            <span>🧶</span>
          )}
          {product.featured && <span className="product-badge">⭐ Featured</span>}
          {!product.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
        </div>
        <div className="product-info">
          <div className="product-name">{product.name}</div>
          {product.description && (
            <div className="product-desc">{product.description}</div>
          )}
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
      <Navbar searchQuery={searchQuery} onSearch={setSearchQuery} />

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
            <button className="search-results-clear" onClick={() => setSearchQuery('')}>
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
              <button className="btn-gradient" style={{ marginTop: 20 }} onClick={() => setSearchQuery('')}>
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
                <a
                  href="#products"
                  className="btn-gradient btn-animated"
                  onClick={(e) => { e.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }); }}
                >
                  Shop Now 🛍️
                </a>
                <a
                  href="#custom"
                  className="btn-light btn-animated"
                  onClick={(e) => { e.preventDefault(); document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth' }); }}
                >
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

          {/* PRODUCTS */}
          <section className="section bg-white" id="products">
            <div className="section-head">
              <h2>Featured Products 🛍️</h2>
              <p>Tap any product to enquire — we'll get back to you!</p>
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
                  filtered.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
                )}
              </div>
            )}
          </section>
        </>
      )}

      {/* CUSTOM ORDER BANNER + CONTACT — hidden during search */}
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

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onEnquire={() => setEnquireProduct(selectedProduct)} />
      )}

      {enquireProduct && (
        <EnquireModal product={enquireProduct} onClose={() => setEnquireProduct(null)} />
      )}

      {customModalOpen && (
        <CustomOrderModal onClose={() => setCustomModalOpen(false)} />
      )}
    </>
  );
}
