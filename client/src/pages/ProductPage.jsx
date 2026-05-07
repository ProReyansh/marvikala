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

export default function ProductPage() {
  const { slug }     = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();

  const [product, setProduct]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeImg, setActiveImg]     = useState(0);
  const [imgAnimKey, setImgAnimKey]   = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Page enter/exit animation
  const [pageAnim, setPageAnim]       = useState('pp-enter');
  const [exiting, setExiting]         = useState(false);

  const [similar, setSimilar]         = useState([]);

  // Single unified effect — runs whenever the slug changes (new product navigated to)
  useEffect(() => {
    // 1. Reset UI state immediately so old content never lingers
    setPageAnim('pp-enter');
    setExiting(false);
    setActiveImg(0);
    setImgAnimKey(0);
    setSimilar([]);   // ← clears old similar cards instantly, no more ghost cards

    function resolve(prod, allProducts) {
      setProduct(prod);
      document.title = `${prod.name} — Marvikala`;
      const pool = allProducts || getCachedProducts();
      setSimilar(pool.filter(p => p.category === prod.category && p._id !== prod._id).slice(0, 4));
      setLoading(false);
    }

    // 2. Router state has the product already — use it instantly (no lag)
    if (location.state?.product && slugify(location.state.product.name) === slug) {
      resolve(location.state.product, null);
      const t = setTimeout(() => setPageAnim('pp-visible'), 20);
      return () => clearTimeout(t);
    }

    // 3. Try sessionStorage cache (handles back-navigation / refresh when cache exists)
    const cached = getCachedProducts();
    const fromCache = cached.find(p => slugify(p.name) === slug);
    if (fromCache) {
      resolve(fromCache, cached);
      const t = setTimeout(() => setPageAnim('pp-visible'), 20);
      return () => clearTimeout(t);
    }

    // 4. Direct URL visit with no cache — fetch all products and find by slug
    setLoading(true);
    axios.get('/api/products')
      .then(res => {
        const found = res.data.find(p => slugify(p.name) === slug);
        if (found) resolve(found, res.data);
        else navigate('/');
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));

    const t = setTimeout(() => setPageAnim('pp-visible'), 20);
    return () => clearTimeout(t);
  }, [slug]);

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
    // Save query and a one-shot focus flag, then go to home (where results render).
    // Using sessionStorage (cleared on read) so reload never re-focuses.
    try {
      sessionStorage.setItem('mk_search', q);
      sessionStorage.setItem('mk_focus_search', '1');
    } catch {}
    navigate('/');
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
          {(p.bestseller || p.featured) && <span className="product-badge bestseller-badge">Bestseller</span>}
          {!p.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
        </div>
        <div className="product-info">
          <div className="product-name">{p.name}</div>
          {p.description && <div className="product-desc">{p.description}</div>}
          <div className="product-cat">{CAT_LABEL[p.category] || p.category}</div>
          <button className="enquire-btn" style={{ pointerEvents: 'none' }}>
            View Product
          </button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <>
      <Navbar searchQuery={searchQuery} onSearch={handleSearch} />
      <div style={{ minHeight: 'calc(100vh - 64px - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
      <Footer />
    </>
  );

  if (!product) return null;

  const images      = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
  const isBestseller = product.bestseller || product.featured;
  const catLabel    = CAT_LABEL[product.category] || product.category;

  return (
    <>
      <Navbar searchQuery={searchQuery} onSearch={handleSearch} />

      <div className={`product-page ${pageAnim}${exiting ? ' pp-exit' : ''}`}>

        {/* Breadcrumb */}
        <nav className="product-page-breadcrumb" aria-label="Breadcrumb">
          <button onClick={handleBack}>Home</button>
          <span className="product-page-breadcrumb-sep">/</span>
          <span>{catLabel}</span>
          <span className="product-page-breadcrumb-sep">/</span>
          <span className="product-page-breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-page-layout">

          {/* ── Image Gallery ── */}
          <div className="product-page-gallery">
            <div className="product-page-main-img">
              {images.length > 0
                ? <img key={imgAnimKey} src={imgUrl(images[activeImg])} alt={product.name} className="product-page-img-anim" />
                : <span className="product-page-placeholder">🧶</span>
              }
              {isBestseller && <span className="product-page-badge bestseller-badge">Bestseller</span>}
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
                <span>✦</span> Most Loved · Bestselling Product
              </div>
            )}

            <div className="product-page-cat">{catLabel}</div>
            <h1 className="product-page-name">{product.name}</h1>

            <div className={`product-page-stock ${product.inStock ? 'in' : 'out'}`}>
              {product.inStock ? '● In Stock' : '● Out of Stock'}
            </div>

            {product.description && <p className="product-page-desc">{product.description}</p>}

            <div className="product-page-divider" />

            {/* Trust badges */}
            <div className="product-page-trust">
              <div className="trust-badge">
                <span className="trust-badge-icon">🧶</span>
                <span>100% Handmade</span>
              </div>
              <div className="trust-badge">
                <span className="trust-badge-icon">📍</span>
                <span>Made in Mumbai</span>
              </div>
              <div className="trust-badge">
                <span className="trust-badge-icon">🎨</span>
                <span>Custom Colours</span>
              </div>
              <div className="trust-badge">
                <span className="trust-badge-icon">📦</span>
                <span>Mumbai Delivery</span>
              </div>
            </div>

            {product.inStock ? (
              <>
                <p className="product-page-cta">Interested? Reach out to place your order</p>
                <div className="product-page-action-row">
                  <a
                    href={`https://wa.me/919769238160?text=Hi! I'm interested in: ${encodeURIComponent(product.name)}`}
                    className="product-page-contact-btn pp-wa"
                    target="_blank" rel="noreferrer"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href="https://instagram.com/marvikala"
                    className="product-page-contact-btn pp-ig"
                    target="_blank" rel="noreferrer"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <circle cx="12" cy="12" r="3.5"/>
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                    Instagram
                  </a>
                </div>
              </>
            ) : (
              <div className="product-page-oos-msg">
                <p>This product is currently out of stock. Follow us on Instagram to be notified when it's back!</p>
                <a href="https://instagram.com/marvikala" className="product-page-contact-btn pp-ig" target="_blank" rel="noreferrer" style={{ marginTop: 12, display: 'inline-flex', width: 'fit-content' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="3.5"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                  @marvikala on Instagram
                </a>
              </div>
            )}

            <div className="product-page-divider" />

            {/* Perks / Details */}
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
              <h2>You May Also Like</h2>
              <p>More from {catLabel}</p>
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
