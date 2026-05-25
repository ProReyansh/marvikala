import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartQtyBtn from '../components/CartQtyBtn';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const CAT_LABEL = {
  flowers: 'Flowers', keychains: 'Keychains', bookmarks: 'Bookmarks',
  laddugopaldress: 'Laddu Gopal', homedecor: 'Home Decor',
  hairaccessories: 'Hair Accessories', jewellery: 'Jewellery',
  rakhi: 'Rakhi', custom: 'Custom',
};

const CAT_MATERIALS = {
  flowers:          ['Premium cotton yarn', 'Floral wire (where applicable)', 'Artisanal dye-stable threads', 'Handcrafted in Mumbai studio'],
  keychains:        ['Premium cotton or acrylic yarn', 'Hypoallergenic polyfill stuffing', 'Durable metal split-ring hardware', 'Handstitched detailing'],
  bookmarks:        ['Fine crochet thread', 'Cotton or linen-blend yarn', 'Colour-fast dyes', 'Handfinished edges'],
  laddugopaldress:  ['Soft cotton yarn', 'Polyester accent thread', 'Handwoven decorative embellishments', 'Non-toxic dyes'],
  homedecor:        ['Premium cotton or macramé cord', 'Natural fibres', 'Rust-proof hardware (where applicable)', 'Earth-friendly materials'],
  hairaccessories:  ['Soft cotton thread', 'Satin or grosgrain ribbon', 'Metal or resin accessories', 'Skin-friendly elastic'],
  jewellery:        ['Fine crochet cotton thread', 'Glass or acrylic beads', 'Nickel-free metal findings', 'Colour-fast dyes'],
  rakhi:            ['Soft cotton or silk thread', 'Decorative charms and beads', 'Comfortable adjustable band', 'Handknotted finish'],
  custom:           ['Materials confirmed at time of order', 'Premium yarns selected for your design', 'All Marvikala quality standards apply'],
};

const CAT_CARE = {
  flowers:          ['Keep away from direct sunlight and moisture', 'Gently reshape petals by hand if needed', 'Store in a cool, dry place', 'Dust with a soft dry cloth'],
  keychains:        ['Spot clean with a slightly damp cloth', 'Avoid soaking or machine washing', 'Store loosely to retain shape', 'Keep away from sharp objects'],
  bookmarks:        ['Keep dry and store flat inside your book', 'Avoid folding or bending', 'Spot clean only if needed'],
  laddugopaldress:  ['Hand wash gently with mild detergent', 'Air dry flat in shade', 'Iron on lowest setting if needed', 'Do not bleach'],
  homedecor:        ['Dust with a soft dry brush', 'Spot clean with a damp cloth only', 'Avoid prolonged moisture or humidity', 'Hang or store flat'],
  hairaccessories:  ['Hand wash gently with mild shampoo', 'Air dry flat — do not tumble dry', 'Store flat or hang loosely'],
  jewellery:        ['Wipe gently with a dry cloth after wear', 'Remove before bathing or swimming', 'Store in a dry jewellery box or pouch', 'Avoid perfume and chemicals'],
  rakhi:            ['Keep dry and away from moisture', 'Handle delicately — avoid pulling threads', 'Store in a cool, dry place'],
  custom:           ['Care instructions included with every custom order', 'Follow the specific care card provided', 'Contact us for any questions'],
};

function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="pp-accordion">
      {items.map((item, i) => (
        <div key={i} className="pp-accordion-item">
          <button
            className="pp-accordion-trigger"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{item.label}</span>
            <span className={`pp-accordion-icon${open === i ? ' open' : ''}`}>+</span>
          </button>
          <div className={`pp-accordion-body${open === i ? ' open' : ''}`}>
            <div className="pp-accordion-content">
              {item.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const REVIEWS = [
  { name: 'Priya M.',  rating: 5, date: 'March 2025',    text: 'Absolutely beautiful! The craftsmanship is incredible — each stitch is so neat and colours are exactly as shown. Packed so lovingly too. Will definitely order again!', avatar: 'P' },
  { name: 'Ananya S.', rating: 5, date: 'February 2025', text: 'Ordered a custom piece and Marvikala delivered beyond my expectations. Quick responses, beautiful packaging and quality is outstanding.', avatar: 'A' },
  { name: 'Ritu K.',   rating: 5, date: 'April 2025',    text: 'Such a talented creator! Got this as a gift and everyone was asking where I bought it from. The attention to detail is just wow!', avatar: 'R' },
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
  const [zoomOpen, setZoomOpen]     = useState(false);
  const [shared, setShared]         = useState(false);

  const [pageAnim, setPageAnim] = useState('pp-enter');
  const [exiting, setExiting]   = useState(false);
  const [similar, setSimilar]   = useState([]);

  const touchStartX  = useRef(null);
  const galleryRef   = useRef(null);

  useEffect(() => {
    setPageAnim('pp-enter');
    setExiting(false);
    setActiveImg(0);
    setImgAnimKey(0);
    setSimilar([]);
    setQty(1);

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
    if (galleryRef.current) {
      galleryRef.current.scrollTo({ left: galleryRef.current.offsetWidth * i, behavior: 'smooth' });
    }
  }

  function handleGalleryScroll(e) {
    const el = e.currentTarget;
    const newIndex = Math.round(el.scrollLeft / el.offsetWidth);
    if (newIndex !== activeImg) setActiveImg(newIndex);
  }

  function handleBack() {
    setExiting(true);
    setTimeout(() => navigate(-1), 260);
  }

  function handleSearch(q) {
    setSearchQuery(q);
    // Search results shown in the Navbar panel — no page navigation needed
  }

  function handleAddToCart() {
    addToCart(product, qty);
    // button text stays as "Add to Cart" always
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
    const { items, addToCart, updateQty, removeFromCart } = useCart();
    const cartItem = items.find(i => i._id === p._id);
    const qty = cartItem?.qty || 0;

    const imgSrc = (() => {
      const imgs = p.images?.length > 0 ? p.images : (p.image ? [p.image] : []);
      if (!imgs[0]) return null;
      return imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`;
    })();

    return (
      <div className="product-card" onClick={() => navigate(`/product/${slugify(p.name)}`, { state: { product: p }, replace: true })}>
        <div className="product-img">
          {imgSrc && <img src={imgSrc} alt={p.name} />}
          {p.newArrival ? (
            <span className="product-badge new-arrival-badge">New</span>
          ) : (p.bestseller || p.featured) ? (
            <span className="product-badge bestseller-badge">Bestseller</span>
          ) : null}
          {p.price && p.originalPrice && p.originalPrice > p.price && (
            <span className="product-badge discount-badge">
              {Math.round((1 - p.price / p.originalPrice) * 100)}% off
            </span>
          )}
          {!p.inStock && <div className="out-of-stock-overlay">Made to Order</div>}
          {p.inStock && (
            qty === 0 ? (
              <button className="pc-cart-icon-btn" onClick={e => { e.stopPropagation(); addToCart(p); }} aria-label="Add to cart">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </button>
            ) : (
              <div className="pc-cart-icon-ctrl" onClick={e => e.stopPropagation()}>
                <button onClick={() => qty <= 1 ? removeFromCart(p._id) : updateQty(p._id, qty - 1)}>−</button>
                <span>{qty}</span>
                <button onClick={() => updateQty(p._id, qty + 1)}>+</button>
              </div>
            )
          )}
        </div>
        <div className="product-info">
          <div className="product-name">{p.name}</div>
          <div className="product-cat">{CAT_LABEL[p.category] || p.category}</div>
          {(p.price || p.originalPrice) && (
            <div className="product-price-row">
              {p.price && <span className="price-sale">₹{p.price}</span>}
              {p.originalPrice && <span className="price-original">₹{p.originalPrice}</span>}
            </div>
          )}
          {p.colors?.length > 0 && (
            <div className="product-colors">
              {p.colors.slice(0, 4).map((c, i) => (
                <span key={i} className="product-color-dot" style={{ background: typeof c === 'string' ? c : c?.color }} />
              ))}
            </div>
          )}
          <div className={`pc-stock-status ${p.inStock ? 'pc-stock-in' : 'pc-stock-mto'}`}>
            {p.inStock ? 'READY TO SHIP' : 'MADE TO ORDER'}
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <>
      <div className="top-ribbon">
        <div className="top-ribbon-track">
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Shipping Pan India</span><span className="ribbon-gap">✦</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Shipping Pan India</span><span className="ribbon-gap">✦</span>
        </div>
      </div>
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
      <div className="top-ribbon">
        <div className="top-ribbon-track">
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Shipping Pan India</span><span className="ribbon-gap">✦</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Shipping Pan India</span><span className="ribbon-gap">✦</span>
        </div>
      </div>
      <Navbar searchQuery={searchQuery} onSearch={handleSearch} />

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
          <button onClick={() => navigate(`/collection/${product.category}`)}>{catLabel}</button>
          <span className="product-page-breadcrumb-sep">/</span>
          <span className="product-page-breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-page-layout">

          {/* ── Image Gallery ── */}
          <div className="product-page-gallery">
            {/* Horizontal scroll strip */}
            <div className="pp-img-strip-wrap pp-main-zoomable">
              <div
                className="pp-img-strip"
                ref={galleryRef}
                onScroll={handleGalleryScroll}
                onClick={() => images.length > 0 && setZoomOpen(true)}
                role="region"
                aria-label="Product images"
              >
                {images.length > 0
                  ? images.map((img, i) => (
                      <div key={i} className="pp-img-strip-slide">
                        <img src={imgUrl(img)} alt={`${product.name} ${i + 1}`} />
                      </div>
                    ))
                  : <div className="pp-img-strip-slide" />
                }
              </div>

              {/* Overlays */}
              {isBestseller && <span className="product-page-badge bestseller-badge">Bestseller</span>}
              {!product.inStock && <div className="product-page-oos-overlay">Made to Order</div>}
              {images.length > 0 && (
                <div className="pp-zoom-hint-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="11" y1="8" x2="11" y2="14"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </div>
              )}
              {images.length > 1 && (
                <div className="pp-swipe-dots" aria-hidden="true">
                  {images.map((_, i) => (
                    <span key={i} className={`pp-swipe-dot${activeImg === i ? ' active' : ''}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
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
              {product.inStock ? '● In Stock' : '● Made to Order'}
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

                <button
                  className="pp-add-cart-btn"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>

                {/* Delivery estimate */}
                <div className="pp-delivery-box">
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
                  href={`https://wa.me/918767797815?text=Hi! I'd like to order: ${encodeURIComponent(product?.name || '')}`}
                  className="pp-made-to-order-btn"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Made to Order — Message Us
                </a>
              </div>
            )}

            {/* Trust signals row */}
            <div className="product-trust-row">
              <div className="product-trust-item">
                <span>Handmade with care</span>
              </div>
              <div className="product-trust-item">
                <span>Packed &amp; shipped in 2–4 days</span>
              </div>
              <div className="product-trust-item">
                <span>Easy replacement if damaged</span>
              </div>
              <div className="product-trust-item">
                <span>Secure WhatsApp checkout</span>
              </div>
            </div>

            <div className="product-page-divider" />

            {/* Details accordion */}
            <Accordion items={[
              {
                label: '✦ Materials Used',
                content: (
                  <ul className="pp-accordion-list">
                    {(CAT_MATERIALS[product.category] || CAT_MATERIALS.custom).map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                ),
              },
              {
                label: '✦ Care Instructions',
                content: (
                  <ul className="pp-accordion-list">
                    {(CAT_CARE[product.category] || CAT_CARE.custom).map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ),
              },
              {
                label: '✦ Delivery & Returns',
                content: (
                  <ul className="pp-accordion-list">
                    <li>Ships within 3–5 business days of order confirmation</li>
                    <li>Delivered via trusted courier partners across India</li>
                    <li>Each piece is carefully packed in branded packaging</li>
                    <li>Custom / made-to-order items are non-returnable</li>
                    <li>Damaged in transit? Message us within 48 hrs — we'll make it right</li>
                  </ul>
                ),
              },
            ]} />
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
            <div className="new-arrivals-2x2">
              {similar.slice(0, 4).map(p => <SimilarCard key={p._id} p={p} />)}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
