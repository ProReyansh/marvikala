import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartQtyBtn from '../components/CartQtyBtn';

const CAT_LABEL = {
  flowers: 'Flowers', keychains: 'Keychains', bookmarks: 'Bookmarks',
  laddugopaldress: 'Laddu Gopal', homedecor: 'Home Decor',
  hairaccessories: 'Hair Accessories', jewellery: 'Jewellery',
  rakhi: 'Rakhi', custom: 'Custom',
};

const CAT_EMOJI = {
  flowers: '🌸', keychains: '🔑', bookmarks: '🔖',
  laddugopaldress: '🕉️', homedecor: '🏠', hairaccessories: '🎀',
  jewellery: '💍', rakhi: '🪢', custom: '🎨',
};

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

function ShopCard({ product }) {
  const navigate = useNavigate();
  const imgSrc = (() => {
    const imgs = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
    if (!imgs[0]) return null;
    return imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`;
  })();

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${slugify(product.name)}`, { state: { product } })}
    >
      <div className="product-img">
        {imgSrc ? <img src={imgSrc} alt={product.name} /> : <span>🧶</span>}
        {product.newArrival ? (
          <span className="product-badge new-arrival-badge">New</span>
        ) : (product.bestseller || product.featured) ? (
          <span className="product-badge bestseller-badge">Bestseller</span>
        ) : null}
        {!product.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        {product.description && <div className="product-desc">{product.description}</div>}
        <div className="product-cat">{CAT_LABEL[product.category] || product.category}</div>
        {(product.price || product.originalPrice) && (
          <div className="product-price-row">
            {product.price && <span className="price-sale">₹{product.price}</span>}
            {product.originalPrice && <span className="price-original">₹{product.originalPrice}</span>}
          </div>
        )}
        <CartQtyBtn product={product} addClassName="enquire-btn" />
      </div>
    </div>
  );
}

export default function CollectionPage() {
  const navigate = useNavigate();
  const { category } = useParams();

  const [products, setProducts] = useState(getCachedProducts);
  const [loading, setLoading]   = useState(() => getCachedProducts().length === 0);

  const catLabel = CAT_LABEL[category] || category;
  const catEmoji = CAT_EMOJI[category] || '✨';

  useEffect(() => {
    document.title = `${catLabel} — Marvikala`;
    axios.get('/api/products')
      .then(res => {
        setProducts(res.data);
        try { sessionStorage.setItem('mk_products', JSON.stringify(res.data)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = products.filter(p => p.category === category);

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

      <Navbar searchQuery="" onSearch={() => {}} />

      <div className="sa-page">

        {/* ── Header Row ── */}
        <div className="sa-header-row">
          <h1 className="sa-title">{catLabel}</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        {/* ── Product count ── */}
        {!loading && filtered.length > 0 && (
          <p className="sa-collection-count">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="sa-loading"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="sa-empty">
            <div className="sa-empty-icon">{catEmoji}</div>
            <p>No products in this collection yet.<br />Check back soon!</p>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map(p => (
              <ShopCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
