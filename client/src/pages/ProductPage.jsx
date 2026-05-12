import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const CAT_LABEL = {
  flowers: 'Flowers', keychains: 'Keychains', bookmarks: 'Bookmarks',
  laddugopaldress: 'Laddu Gopal', homedecor: 'Home Decor',
  hairaccessories: 'Hair Accessories', jewellery: 'Jewellery',
  rakhi: 'Rakhi', custom: 'Custom',
};

const REVIEWS = [
  { name: 'Priya M.',  rating: 5, date: 'March 2025',    text: 'Absolutely beautiful! The craftsmanship is incredible — each stitch is so neat and colours are exactly as shown. Packed so lovingly too. Will definitely order again! 🌸', avatar: 'P' },
  { name: 'Ananya S.', rating: 5, date: 'February 2025', text: 'Ordered a custom piece and Marvikala delivered beyond my expectations. Quick responses, beautiful packaging and quality is outstanding.', avatar: 'A' },
  { name: 'Ritu K.',   rating: 5, date: 'April 2025',    text: 'Such a talented creator! Got this as a gift and everyone was asking where I bought it from. The attention to detail is just wow 💛', avatar: 'R' },
];

function getDeliveryRange() {
  const addBizDays = (date, n) => {
    const d = new Date(date);
    let count = 0;
    while (count < n) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) count++;
    }
    return d;
  };
  const fmt = d => d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  return `${fmt(addBizDays(new Date(), 3))} – ${fmt(addBizDays(new Date(), 7))}`;
}

function imgUrl(src) {
  if (!src) return '';
  return src.startsWith('http') ? src : `/uploads/${src}`;
}

function slugify(name) {
  return name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

function getCachedProducts() {
  try { const c = sessionStorage.getItem('mk_products'); return c ? JSON.parse(c) : []; }
  catch { return []; }
}

function StarRating({ rating }) {
  return (
    <span className="star-rating" aria-label={`${rating} stars`}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star${i <= rating ? ' filled' : ''}`}>★</span>
      ))}
    </span>
  );
}

function ProductSkeleton() {
  return (
    <div className="pp-skeleton">
      <div className="pp-skeleton-gallery">
        <div className="skeleton-box pp-skeleton-main" />
        <div className="pp-skeleton-row">
          {[0,1,2].map(i => <div key={i} className="skeleton-box pp-skeleton-thumb-sm" />)}
        </div>
      </div>
      <div className="pp-skeleton-info">
        <div className="skeleton-box sk-w40 sk-h12" />
        <div className="skeleton-box sk-w80 sk-h28" style={{ marginTop: 8 }} />
        <div className="skeleton-box sk-w60 sk-h16" style={{ marginTop: 12 }} />
        <div className="skeleton-box sk-w100 sk-h14" style={{ marginTop: 16 }} />
        <div className="skeleton-box sk-w100 sk-h14" style={{ marginTop: 6 }} />
        <div className="skeleton-box sk-w80 sk-h14" style={{ marginTop: 6 }} />
        <div className="skeleton-box sk-w100 sk-h48" style={{ marginTop: 28 }} />
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { addToCart } = useCart();
  const toast      = useToast();

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeImg, setActiveImg]   = useState(0);
  const [imgAnimKey, setImgAnimKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [qty, setQty]               = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomOpen, setZoomOpen]     = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [shared, setShared]         = useState(false);

  const [pageAnim, setPageAnim] = useState('pp-enter');
  const [exiting, setExiting]   = useState(false);
  const [similar, setSimilar]   = useState([]);

  const addBtnRef    = useRef(null);
  const touchStartX  = useRef(null);

  // Sticky bar — appears when add-to-cart button scrolls out of view
  useEffect(() => {
    if (!addBtnRef.current || !product) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-72px 0px 0px 0px' }
    );
    obs.observe(addBtnRef.current);
    return () => obs.disconnect();
  }, [product]);

  useEffect(() => {
    setPageAnim('pp-enter');
    setExiting(false);
    setActiveImg(0);
    setImgAnimKey(0);
    setSimilar([]);
    setQty(1);
    setAddedToCart(false);

    function resolve(prod, all) {
      setProduct(prod);
      document.title = `${prod.name} — Marvikala`;
      const pool = all || getCachedProducts();
      setSimilar(pool.filter(p => p.category === prod.category && p._id !== prod._id).slice(0, 6));
      setLoading(false);
    }

    if (location.state?.product && slugify(location.state.product.name) === slug) {
      resolve(location.state.product, null);
      const t = setTimeout(() => setPageAnim('pp-visible'), 20);
      return () => clearTimeout(t);
    }

    const cached = getCachedProducts();
    const fromCache = cached.find(p => slugify(p.name) === slug);
    if (fromCache) {
      resolve(fromCache, cached);
      const t = setTimeout(() => setPageAnim('pp-visible'), 20);
      return () => clearTimeout(t);
    }

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
    try { sessionStorage.setItem('mk_search', q); sessionStorage.setItem('mk_focus_search', '1'); } catch {}
    navigate('/');
  }

  function handleAddToCart() {
    addToCart(product, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product.name, text: `Check out this handmade piece from Marvikala: ${product.name}`, url });
    } else {
      navigator.clipboard?.writeText(url).then(() => {
        setShared(true);
        toast({ message: 'Link copied!', type: 'info' });
        setTimeout(() => setShared(false), 2000);
      });
    }
  }

  // Touch-swipe gallery
  function handleTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    const imgs = product?.images?.length > 0 ? product.images : (product?.image ? [product.image] : []);
    if (dx < 0 && activeImg < imgs.length - 1) changeImage(activeImg + 1);
    else if (dx > 0 && activeImg > 0) changeImage(activeImg - 1);
  }

  function SimilarCard({ p }) {
    const imgSrc = (() => {
      const imgs = p.images?.length > 0 ? p.images : (p.image ? [p.image] : []);
      if (!imgs[0]) return null;
      return imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`;
    })();
    return (
      <div className="product-card" onClick={() => navigate(`/product/${slugify(p.name)}`, { state: { product: p }, replace: true })}>
        <div className="product-img">
          {imgSrc ? <img src={imgSrc} alt={p.name} loading="lazy" /> : <span>🧶</span>}
          {(p.bestseller || p.featured) && <span className="product-badge bestseller-badge">Bestseller</span>}
          {!p.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
        </div>
        <div className="product-info">
          <div className="product-name">{p.name}</div>
          {p.description && <div className="product-desc">{p.description}</div>}
          <div className="product-cat">{CAT_LABEL[p.category] || p.category}</div>
          <button className="enquire-btn" style={{ pointerEvents: 'none' }}>View Product</button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <>
      <Navbar searchQuery={searchQuery} onSearch={handleSearch} />
      <ProductSkeleton />
      <Footer />
    </>
  );

  if (!product) return null;

  const images      = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
  const isBestseller = product.bestseller || product.featured;
  const catLabel    = CAT_LABEL[product.category] || product.category;
  const discount    = product.price && product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <>
      <Navbar searchQuery={searchQuery} onSearch={handleSearch} />

      {/* ── Sticky CTA Bar ── */}
      <div className={`pp-sticky-bar${stickyVisible && product.inStock ? ' visible' : ''}`} aria-hidden={!stickyVisible}>
        <div className="pp-sticky-inner">
          <div className="pp-sticky-info">
            <span className="pp-sticky-name">{product.name}</span>
            {product.price && <span className="pp-sticky-price">₹{product.price}</span>}
          </div>
          <button
            className={`pp-sticky-btn${addedToCart ? ' added' : ''}`}
            onClick={handleAddToCart}
          >
            {addedToCart ? '✓ Added!' : '+ Add to Cart'}
          </button>
        </div>
      </div>

      {/* ── Zoom Lightbox ── */}
      {zoomOpen && images.length > 0 && (
        <div className="pp-zoom-overlay" onClick={() => setZoomOpen(false)}>
          <button className="pp-zoom-close" aria-label="Close zoom">✕</button>
          <img
            src={imgUrl(images[activeImg])}
            alt={product.name}
            className="pp-zoom-img"
            onClick={e => e.stopPropagation()}
          />
          {images.length > 1 && (
            <div className="pp-zoom-nav" onClick={e => e.stopPropagation()}>
              <button className="pp-zoom-arrow" onClick={() => activeImg > 0 && changeImage(activeImg - 1)} disabled={activeImg === 0}>‹</button>
              <span className="pp-zoom-counter">{activeImg + 1} / {images.length}</span>
              <button className="pp-zoom-arrow" onClick={() => activeImg < images.length - 1 && changeImage(activeImg + 1)} disabled={activeImg === images.length - 1}>›</button>
            </div>
          )}
        </div>
      )}

      <div className={`product-page ${pageAnim}${exiting ? ' pp-exit' : ''}`}>

        {/* Breadcrumb */}
        <nav className="product-page-breadcrumb" aria-label="Breadcrumb">
          <button onClick={handleBack}>← Back</button>
          <span className="product-page-breadcrumb-sep">/</span>
          <span>{catLabel}</span>
          <span className="product-page-breadcrumb-sep">/</span>
          <span className="product-page-breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-page-layout">

          {/* ── Image Gallery ── */}
          <div className="product-page-gallery">
            <div
              className="product-page-main-img pp-main-zoomable"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={() => images.length > 0 && setZoomOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Zoom image"
            >
              {images.length > 0
                ? <img key={imgAnimKey} src={imgUrl(images[activeImg])} alt={product.name} className="product-page-img-anim" />
                : <span className="product-page-placeholder">🧶</span>}
              {isBestseller && <span className="product-page-badge bestseller-badge">Bestseller</span>}
              {!product.inStock && <div className="product-page-oos-overlay">Out of Stock</div>}
              {images.length > 0 && <div className="pp-zoom-hint-badge">🔍</div>}
              {images.length > 1 && (
                <div className="pp-swipe-dots" aria-hidden="true">
                  {images.map((_, i) => (
                    <span key={i} className={`pp-swipe-dot${activeImg === i ? ' active' : ''}`} />
                  ))}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="product-page-thumbs">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`product-page-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => changeImage(i)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={imgUrl(img)} alt={`${product.name} ${i + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="product-page-info">

            <h1 className="product-page-name">{product.name}</h1>

            {/* Reviews summary row */}
            <div className="pp-rating-row">
              <StarRating rating={5} />
              <span className="pp-rating-count">{REVIEWS.length} reviews</span>
              <span className="pp-rating-sep">·</span>
              <span className="pp-verified-badge">✓ Verified</span>
            </div>

            {/* Price */}
            {(product.price || product.originalPrice) && (
              <div className="pp-price-row">
                {product.price && <span className="pp-price-sale">₹{product.price}</span>}
                {product.originalPrice && <span className="pp-price-orig">₹{product.originalPrice}</span>}
                {discount > 0 && <span className="pp-discount-badge">{discount}% off</span>}
              </div>
            )}

            <div className={`product-page-stock ${product.inStock ? 'in' : 'out'}`}>
              {product.inStock ? '● In Stock' : '● Out of Stock'}
            </div>

            {product.description && <p className="product-page-desc">{product.description}</p>}

            <div className="product-page-divider" />

            {product.inStock ? (
              <>
                {/* Quantity */}
                <div className="pp-qty-row">
                  <span className="pp-qty-label">Quantity</span>
                  <div className="pp-qty-ctrl" role="group" aria-label="Quantity selector">
                    <button className="pp-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                    <span className="pp-qty-val" aria-live="polite">{qty}</span>
                    <button className="pp-qty-btn" onClick={() => setQty(q => Math.min(10, q + 1))} aria-label="Increase quantity">+</button>
                  </div>
                </div>

                {/* Add to Cart — observed for sticky bar */}
                <button
                  ref={addBtnRef}
                  className={`pp-add-cart-btn${addedToCart ? ' added' : ''}`}
                  onClick={handleAddToCart}
                  aria-live="polite"
                >
                  {addedToCart ? '✓ Added to Cart' : '🛒 Add to Cart'}
                </button>

                {/* Delivery estimate */}
                <div className="pp-delivery-box">
                  <span className="pp-delivery-icon">🚛</span>
                  <div className="pp-delivery-text">
                    <span className="pp-delivery-label">Estimated Delivery</span>
                    <span className="pp-delivery-date">{getDeliveryRange()}</span>
                  </div>
                </div>

                {/* Share */}
                <button className="pp-share-btn" onClick={handleShare}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                  {shared ? 'Link copied!' : 'Share this product'}
                </button>
              </>
            ) : (
              <div className="product-page-oos-msg">
                <p>This item is currently out of stock but can be made to order.</p>
                <a
                  href={`https://wa.me/919769238160?text=Hi! I'd like to order: ${encodeURIComponent(product?.name || '')}`}
                  className="pp-made-to-order-btn"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Made to Order — Message Us
                </a>
              </div>
            )}

            <div className="product-page-divider" />

            {/* Perks */}
            <div className="product-page-perks">
              <div className="perk-item"><span className="perk-icon">🧶</span><div className="perk-text"><strong>100% Handmade</strong><span>Every piece crafted stitch by stitch with care</span></div></div>
              <div className="perk-item"><span className="perk-icon">🎨</span><div className="perk-text"><strong>Custom Colours & Sizes</strong><span>Tell us your preferences — we'll make it just for you!</span></div></div>
              <div className="perk-item"><span className="perk-icon">📦</span><div className="perk-text"><strong>Pan India Delivery</strong><span>Shipping across India with careful packaging</span></div></div>
              <div className="perk-item"><span className="perk-icon">💛</span><div className="perk-text"><strong>Made with Love</strong><span>From a small studio in Mumbai, just for you</span></div></div>
            </div>
          </div>
        </div>

        {/* ── Customer Reviews ── */}
        <div className="pp-reviews">
          <div className="pp-reviews-header">
            <div>
              <h2 className="pp-reviews-title">What Customers Say</h2>
              <div className="pp-reviews-summary">
                <StarRating rating={5} />
                <span className="pp-reviews-avg">5.0</span>
                <span className="pp-reviews-count">· {REVIEWS.length} verified reviews</span>
              </div>
            </div>
          </div>
          <div className="pp-reviews-grid">
            {REVIEWS.map((r, i) => (
              <div key={i} className="pp-review-card">
                <div className="pp-review-top">
                  <div className="pp-review-avatar">{r.avatar}</div>
                  <div className="pp-review-meta">
                    <span className="pp-review-name">{r.name}</span>
                    <span className="pp-review-date">{r.date}</span>
                  </div>
                  <StarRating rating={r.rating} />
                </div>
                <p className="pp-review-text">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Similar Products ── */}
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
