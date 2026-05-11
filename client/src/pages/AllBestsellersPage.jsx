import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
function productUrl(product) {
  return `/product/${slugify(product.name)}`;
}
function getCachedProducts() {
  try {
    const c = sessionStorage.getItem('mk_products');
    return c ? JSON.parse(c) : [];
  } catch { return []; }
}

const CAT_LABEL = {
  flowers: 'Flowers', keychains: 'Keychains', bookmarks: 'Bookmarks',
  laddugopaldress: 'Laddu Gopal', homedecor: 'Home Decor',
  hairaccessories: 'Hair Accessories', jewellery: 'Jewellery',
  rakhi: 'Rakhi', custom: 'Custom',
};

export default function AllBestsellersPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState(getCachedProducts);
  const [loading, setLoading] = useState(() => getCachedProducts().length === 0);

  useEffect(() => {
    document.title = 'Bestsellers — Marvikala';
  }, []);

  useEffect(() => {
    axios.get('/api/products')
      .then((res) => {
        setProducts(res.data);
        try { sessionStorage.setItem('mk_products', JSON.stringify(res.data)); } catch {}
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const bestsellers = products.filter((p) => p.bestseller || p.featured);

  return (
    <>
      <Navbar searchQuery="" onSearch={() => {}} />

      <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 64px)' }}>
        <div className="bestsellers-page">

          <button
            className="bestsellers-back"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>

          <div className="bestsellers-page-header">
            <h1>Our Bestsellers ♡</h1>
            <p>The most loved handmade picks from our Mumbai studio</p>
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : bestsellers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-light)' }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>🧶</div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, marginBottom: 10, color: 'var(--text)' }}>
                No bestsellers yet
              </h3>
              <p style={{ fontSize: 15 }}>Check back soon — we're always crafting new favourites!</p>
              <button className="btn-primary" style={{ marginTop: 24 }} onClick={() => navigate('/')}>
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="bestsellers-grid">
              {bestsellers.map((product) => {
                const imgSrc = (() => {
                  const imgs = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
                  if (!imgs[0]) return null;
                  return imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`;
                })();

                return (
                  <div
                    key={product._id}
                    className="product-card"
                    onClick={() => {
                      try { sessionStorage.setItem('mk_scroll_/bestsellers', String(window.scrollY)); } catch {}
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
                      {product.description && (
                        <div className="product-desc">{product.description}</div>
                      )}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.inStock) addToCart(product);
                        }}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

    </>
  );
}
