import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

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
      onClick={() => navigate(`/product/${slugify(product.name)}`, { state: { product } })}
    >
      <div className="product-img">
        {imgSrc && <img src={imgSrc} alt={product.name} />}
        {product.newArrival ? (
          <span className="product-badge new-arrival-badge">New</span>
        ) : (product.bestseller || product.featured) ? (
          <span className="product-badge bestseller-badge">Bestseller</span>
        ) : null}
        {product.price && product.originalPrice && product.originalPrice > product.price && (
          <span className="product-badge discount-badge">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% off
          </span>
        )}
        {!product.inStock && <div className="out-of-stock-overlay">Made to Order</div>}
        {product.inStock && (
          qty === 0 ? (
            <button className="pc-cart-icon-btn" onClick={e => { e.stopPropagation(); addToCart(product); }} aria-label="Add to cart">
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
            {product.price && <span className="price-sale">₹{product.price}</span>}
            {product.originalPrice && <span className="price-original">₹{product.originalPrice}</span>}
          </div>
        )}
        {product.colors?.length > 0 && (
          <div className="product-colors">
            {product.colors.slice(0, 4).map((c, i) => (
              <span key={i} className="product-color-dot" style={{ background: c }} />
            ))}
          </div>
        )}
        <div className={`pc-stock-status ${product.inStock ? 'pc-stock-in' : 'pc-stock-mto'}`}>
          {product.inStock ? 'READY TO SHIP' : 'MADE TO ORDER'}
        </div>
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

      <Navbar searchQuery="" onSearch={() => {}} />

      <div className="sa-page">

        {/* ── Header Row ── */}
        <div className="sa-header-row">
          <BackButton pageName={catLabel} />
          <h1 className="sa-title">{catLabel}</h1>
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
