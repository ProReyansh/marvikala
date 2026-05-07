import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CAT_LABEL = {
  flowers: 'Flowers', keychains: 'Keychains', bookmarks: 'Bookmarks',
  laddugopaldress: 'Laddu Gopal', homedecor: 'Home Decor',
  hairaccessories: 'Hair Accessories', jewellery: 'Jewellery',
  rakhi: 'Rakhi', custom: 'Custom',
};

function imgUrl(src) {
  if (!src) return '';
  return src.startsWith('http') ? src : `/uploads/${src}`;
}

function getCachedProducts() {
  try {
    const c = sessionStorage.getItem('mk_products');
    return c ? JSON.parse(c) : [];
  } catch { return []; }
}

// Extract MongoDB ObjectID (24 hex chars) from the end of a slug
function extractId(slug) {
  const parts = slug.split('-');
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/^[a-f0-9]{24}$/.test(parts[i])) return parts[i];
  }
  // fallback — maybe it's a raw ID
  return slug;
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
function productUrl(product) {
  return `/product/${slugify(product.name)}-${product._id}`;
}

export default function ProductPage() {
  const { slug } = useParams();
  const id = extractId(slug);
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct]       = useState(location.state?.product || null);
  const [loading, setLoading]       = useState(!location.state?.product);
  const [activeImg, setActiveImg]   = useState(0);
  const [imgAnimKey, setImgAnimKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Page enter/exit animation
  const [pageAnim, setPageAnim]     = useState('pp-enter');
  const [exiting, setExiting]       = useState(false);

  const [similar, setSimilar] = useState(() => {
    if (!location.state?.product) return [];
    const all = getCachedProducts();
    return all
      .filter(p => p.category === location.state.product.category && p._id !== location.state.product._id)
      .slice(0, 4);
  });

  // Reset and play enter animation whenever the product ID changes (similar card click)
  useEffect(() => {
    setPageAnim('pp-enter');
    setExiting(false);
    setActiveImg(0);
    setImgAnimKey(0);
    // Pre-populate from router state immediately — eliminates the 1-second lag where
    // the old product content lingers while the API call for the new product is in flight
    if (location.state?.product) {
      setProduct(location.state.product);
      setLoading(false);
    }
    const t = setTimeout(() => setPageAnim('pp-visible'), 20);
    return () => clearTimeout(t);
  }, [id]);

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        document.title = `${res.data.name} — Marvikala`;
        const all = getCachedProducts();
        setSimilar(
          all.filter(p => p.category === res.data.category && p._id !== res.data._id).slice(0, 4)
        );
      })
      .catch(() => { if (!product) navigate('/'); })
      .finally(() => setLoading(false));
  }, [id]);

  function changeImage(i) {
    if (i === activeImg) return;
    setActiveImg(i);
    setImgAnimKey(k => k + 1);
  }

  function handleBack() {
    setExiting(true);
    setTimeout(() => navigate(-1), 260);
  }

  function handleSearch(q) {
    setSearchQuery(q);
    try { sessionStorage.setItem('mk_search', q); } catch {}
  }

  function SimilarCard({ p }) {
    const imgSrc = (() => {
      const imgs = p.images?.length > 0 ? p.images : (p.image ? [p.image] : []);
      if (!imgs[0]) return null;
      return imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`;
    })();
    return (
      <div
        className="product-card"
        onClick={() => navigate(productUrl(p), { state: { product: p }, replace: true })}
      >
        <div className="product-img">
          {imgSrc ? <img src={imgSrc} alt={p.name} /> : <span>🧶</span>}
          {(p.bestseller || p.featured) && <span className="product-badge bestseller-badge">🏆 Bestseller</span>}
          {!p.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
        </div>
        <div className="product-info">
          <div className="product-name">{p.name}</div>
          {p.description && <div className="product-desc">{p.description}</div>}
          <div className="product-cat">{CAT_LABEL[p.category] || p.category}</div>
          <button className="enquire-btn" style={{ pointerEvents: 'none' }}>
            View Product →
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <>
      <Navbar searchQuery={searchQuery} onSearch={handleSearch} />
      <div style={{ minHeight: 'calc(100vh - 66px - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
      <Footer />
    </>
  );

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
  const isBestseller = product.bestseller || product.featured;

  return (
    <>
      <Navbar searchQuery={searchQuery} onSearch={handleSearch} />

      <div className={`product-page ${pageAnim}${exiting ? ' pp-exit' : ''}`}>
        <button className="product-page-back" onClick={handleBack}>← Back</button>

        <div className="product-page-layout">

          {/* ── Image Gallery ── */}
          <div className="product-page-gallery">
            <div className="product-page-main-img">
              {images.length > 0
                ? <img key={imgAnimKey} src={imgUrl(images[activeImg])} alt={product.name} className="product-page-img-anim" />
                : <span className="product-page-placeholder">🧶</span>
              }
              {isBestseller && <span className="product-page-badge bestseller-badge">🏆 Bestseller</span>}
              {!product.inStock && <div className="product-page-oos-overlay">Out of Stock</div>}
            </div>

            {images.length > 1 && (
              <div className="product-page-thumbs">
                {images.map((img, i) => (
                  <div key={i} className={`product-page-thumb${activeImg === i ? ' active' : ''}`} onClick={() => changeImage(i)}>
                    <img src={imgUrl(img)} alt={`${product.name} ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="product-page-info">

            {/* Bestseller banner — only shown for bestseller products */}
            {isBestseller && (
              <div className="pp-bs-banner">
                <span>🏆</span> Most Loved · Bestselling Product
              </div>
            )}

            <div className="product-page-cat">{CAT_LABEL[product.category] || product.category}</div>
            <h1 className="product-page-name">{product.name}</h1>

            <div className={`product-page-stock ${product.inStock ? 'in' : 'out'}`}>
              {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
            </div>

            {product.description && <p className="product-page-desc">{product.description}</p>}

            <div className="product-page-divider" />

            {product.inStock ? (
              <>
                <p className="product-page-cta">Interested? Reach out to place your order!</p>
                <div className="product-page-action-row">
                  <a
                    href={`https://wa.me/919769238160?text=Hi! I'm interested in: ${encodeURIComponent(product.name)}`}
                    className="product-page-contact-btn pp-wa"
                    target="_blank" rel="noreferrer"
                  ><span>📱</span> WhatsApp</a>
                  <a
                    href="https://instagram.com/marvikala"
                    className="product-page-contact-btn pp-ig"
                    target="_blank" rel="noreferrer"
                  ><span>📸</span> Instagram</a>
                </div>
              </>
            ) : (
              <div className="product-page-oos-msg">
                <p>This product is currently out of stock. Follow us on Instagram to be notified when it's back!</p>
                <a href="https://instagram.com/marvikala" className="product-page-contact-btn pp-ig" target="_blank" rel="noreferrer" style={{ marginTop: 12, display: 'inline-flex', width: 'fit-content' }}>
                  <span>📸</span> @marvikala on Instagram
                </a>
              </div>
            )}

            <div className="product-page-divider" />

            {/* Perks */}
            <div className="product-page-perks">
              <div className="perk-item">
                <span className="perk-icon">🧶</span>
                <div className="perk-text">
                  <strong>100% Handmade</strong>
                  <span>Every piece crafted stitch by stitch with care</span>
                </div>
              </div>
              <div className="perk-item">
                <span className="perk-icon">🎨</span>
                <div className="perk-text">
                  <strong>Custom Colours & Sizes</strong>
                  <span>Tell us your preferences — we'll make it just for you!</span>
                </div>
              </div>
              <div className="perk-item">
                <span className="perk-icon">📦</span>
                <div className="perk-text">
                  <strong>Delivery in Mumbai</strong>
                  <span>Quick local delivery across Mumbai city</span>
                </div>
              </div>
              <div className="perk-item">
                <span className="perk-icon">💛</span>
                <div className="perk-text">
                  <strong>Made with Love</strong>
                  <span>From a small studio in Mumbai, just for you</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Similar Results ── */}
        {similar.length > 0 && (
          <div className="pp-similar">
            <div className="pp-similar-header">
              <h2>Similar Results</h2>
              <p>More from {CAT_LABEL[product.category] || product.category}</p>
            </div>
            <div className="products-grid">
              {similar.map(p => <SimilarCard key={p._id} p={p} />)}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
