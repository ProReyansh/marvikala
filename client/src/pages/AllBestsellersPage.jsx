import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        {imgSrc && <img src={imgSrc} alt={product.name} />}
        {product.newArrival ? (
          <span className="product-badge new-arrival-badge">New</span>
        ) : (product.bestseller || product.featured) ? (
          <span className="product-badge bestseller-badge">Bestseller</span>
        ) : null}
        {!product.inStock && <div className="out-of-stock-overlay">Made to Order</div>}
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
        <CartQtyBtn product={product} addClassName="enquire-btn" />
      </div>
    </div>
  );
}

export default function AllBestsellersPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(getCachedProducts);
  const [loading, setLoading]   = useState(() => getCachedProducts().length === 0);

  useEffect(() => {
    document.title = 'Bestsellers — Marvikala';
    axios.get('/api/products')
      .then(res => {
        setProducts(res.data);
        try { sessionStorage.setItem('mk_products', JSON.stringify(res.data)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const bestsellers = products.filter(p => p.bestseller || p.featured);

  return (
    <>
      <div className="top-ribbon">
        <div className="top-ribbon-track">
          <span>Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span>Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span>Shipping Pan India</span><span className="ribbon-gap">✦</span>
          <span>Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span>Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span>Shipping Pan India</span><span className="ribbon-gap">✦</span>
        </div>
      </div>

      <Navbar searchQuery="" onSearch={() => {}} />

      <div className="sa-page">
        <div className="sa-header-row">
          <h1 className="sa-title">Bestsellers</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        {loading ? (
          <div className="sa-loading"><div className="spinner" /></div>
        ) : bestsellers.length === 0 ? (
          <div className="sa-empty">
            <p>No bestsellers yet — check back soon!</p>
          </div>
        ) : (
          <div className="products-grid">
            {bestsellers.map(p => <ShopCard key={p._id} product={p} />)}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
