import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

function slugify(name) {
  return name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

const CAT_LABEL = {
  flowers: 'Flowers', keychains: 'Keychains', bookmarks: 'Bookmarks',
  laddugopaldress: 'Laddu Gopal', homedecor: 'Home Decor',
  hairaccessories: 'Hair Accessories', jewellery: 'Jewellery',
  rakhi: 'Rakhi', custom: 'Custom',
};


function imgUrl(src) {
  if (!src) return null;
  return src.startsWith('http') ? src : `/uploads/${src}`;
}

function loadSaved() {
  try { const c = localStorage.getItem('mk_saved'); return c ? JSON.parse(c) : []; }
  catch { return []; }
}
function persistSaved(items) {
  try { localStorage.setItem('mk_saved', JSON.stringify(items)); } catch {}
}

function MinusIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function PlusIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function BookmarkIcon({ filled = false }) {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
}
function CartIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/></svg>;
}

function CartItem({ item, onSaveForLater }) {
  const { updateQty, removeFromCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const src = imgUrl(item.image);
  const [removing, setRemoving] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleRemove() {
    if (removing || saving) return;
    setRemoving(true);
    setTimeout(() => {
      removeFromCart(item._id);
      toast({ message: `${item.name} removed from cart`, type: 'info' });
    }, 300);
  }

  function handleSave() {
    if (saving || removing) return;
    setSaving(true);
    setTimeout(() => {
      onSaveForLater(item);
    }, 380);
  }

  const goToProduct = () => navigate(`/product/${slugify(item.name)}`, { state: { product: item } });

  return (
    <div className={`cart-item${removing ? ' cart-item--exit' : ''}${saving ? ' cart-item--exit' : ''}`}>
      {/* Top: image + text */}
      <div className="cart-item-top">
        <div className="cart-item-img" onClick={goToProduct} style={{ cursor: 'pointer' }}>
          {src ? <img src={src} alt={item.name} loading="lazy" /> : <span className="cart-item-placeholder"></span>}
        </div>
        <div className="cart-item-info">
          <div className="cart-item-cat">{CAT_LABEL[item.category] || item.category}</div>
          <div className="cart-item-name" onClick={goToProduct} style={{ cursor: 'pointer' }}>{item.name}</div>
          {item.price && (
            <div className="cart-item-price-row">
              <span className="cart-item-price">₹{item.price}</span>
              {item.originalPrice && <span className="cart-item-orig">₹{item.originalPrice}</span>}
              {item.qty > 1 && (
                <span className="cart-item-line-total">= ₹{item.price * item.qty}</span>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Bottom: full-width controls */}
      <div className="cart-item-controls">
        <button
          className={`cart-save-btn${saving ? ' cart-save-btn--saved' : ''}`}
          onClick={handleSave}
          title="Save for later"
          disabled={saving || removing}
        >
          <BookmarkIcon filled={saving} />
          {saving ? 'Saved!' : 'Save'}
        </button>
        <div className="cart-qty-group" role="group" aria-label="Quantity">
          <button className="cart-qty-btn" onClick={() => item.qty > 1 ? updateQty(item._id, item.qty - 1) : handleRemove()} aria-label="Decrease" disabled={removing || saving}><MinusIcon /></button>
          <span className="cart-qty-val" aria-live="polite">{item.qty}</span>
          <button className="cart-qty-btn" onClick={() => updateQty(item._id, item.qty + 1)} aria-label="Increase" disabled={removing || saving}><PlusIcon /></button>
        </div>
        <button
          className={`cart-remove-btn${removing ? ' cart-remove-btn--active' : ''}`}
          onClick={handleRemove}
          aria-label="Remove item"
          disabled={removing || saving}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

function SavedItem({ item, onMoveToCart }) {
  const src = imgUrl(item.image);
  const [moving, setMoving] = useState(false);

  function handleMove() {
    if (moving) return;
    setMoving(true);
    setTimeout(() => onMoveToCart(item), 300);
  }

  return (
    <div className={`cart-item cart-item-saved${moving ? ' cart-item--exit' : ''}`}>
      <div className="cart-item-top">
        <div className="cart-item-img">
          {src ? <img src={src} alt={item.name} loading="lazy" /> : <span className="cart-item-placeholder"></span>}
        </div>
        <div className="cart-item-info">
          <div className="cart-item-cat">{CAT_LABEL[item.category] || item.category}</div>
          <div className="cart-item-name">{item.name}</div>
          {item.price && (
            <div className="cart-item-price-row">
              <span className="cart-item-price">₹{item.price}</span>
              {item.qty > 1 && <span className="cart-item-saved-qty">× {item.qty}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="cart-item-controls cart-saved-controls">
        <button
          className={`cart-move-btn${moving ? ' cart-move-btn--active' : ''}`}
          onClick={handleMove}
          disabled={moving}
        >
          <CartIcon />
          {moving ? 'Moving…' : 'Move to Cart'}
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart, addToCart, removeFromCart } = useCart();
  const toast = useToast();
  // Save for later
  const [saved, setSaved] = useState(loadSaved);
  useEffect(() => { persistSaved(saved); }, [saved]);

  function handleSaveForLater(item) {
    removeFromCart(item._id);
    setSaved(prev => [...prev.filter(s => s._id !== item._id), { ...item }]);
    toast({ message: `${item.name} saved for later`, type: 'info' });
  }

  function handleMoveToCart(item) {
    setSaved(prev => prev.filter(s => s._id !== item._id));
    addToCart(item, item.qty); // preserve saved quantity
    toast({ message: `${item.name} moved to cart!`, type: 'success' });
  }

  // Calculations
  const shippingCost = cartTotal === 0 ? 0 : cartTotal >= 999 ? 0 : 80;
  const grandTotal   = cartTotal + shippingCost;

  function buildWhatsAppMsg() {
    if (!items.length) return '';
    const lines = items.map(i => `• ${i.name} × ${i.qty}${i.price ? ` — ₹${i.price * i.qty}` : ''}`);
    const totalLine = grandTotal > 0 ? `\n\nTotal: ₹${grandTotal}${shippingCost === 0 ? ' (Free delivery)' : ` + ₹${shippingCost} delivery`}` : '';
    return `Hi! I'd like to place an order from Marvikala:\n\n${lines.join('\n')}${totalLine}\n\nPlease confirm availability. Thank you!`;
  }

  const isEmpty = items.length === 0;
  const itemCount = items.reduce((s, i) => s + i.qty, 0);

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
      <Navbar searchQuery="" onSearch={() => {}} />

      <div className="sa-page">
        <div className="sa-header-row cart-header-row">
          <div className="sa-back-nav">
            <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back</button>
            <span className="sa-back-sep">/</span>
            <span className="sa-back-page">Your Cart</span>
          </div>
          <h1 className="sa-title">Your Cart {!isEmpty && <span className="cart-title-count">({itemCount})</span>}</h1>
        </div>

        {isEmpty ? (
          <div className="cart-empty">
            <div className="cart-empty-lottie" aria-hidden="true"></div>
            <h3 className="cart-empty-title">Your cart is empty</h3>
            <p className="cart-empty-sub">Discover something handmade and beautiful, just for you.</p>
            <div className="cart-empty-actions">
              <button className="cart-shop-btn" onClick={() => navigate('/shop')}>Browse All Products</button>
              <button className="cart-shop-btn cart-shop-btn-outline" onClick={() => navigate('/collections')}>Explore Collections</button>
            </div>
            <div className="cart-empty-perks">
              <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free delivery over ₹999</span>
              <span>·</span>
              <span>100% Handmade</span>
              <span>·</span>
              <span>Made in Mumbai</span>
            </div>
          </div>
        ) : (
          <div className="cart-layout">

            {/* ── Items Column ── */}
            <div className="cart-items-col">
              <div className="cart-items-header">
                <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                <button className="cart-clear-btn" onClick={() => { clearCart(); toast({ message: 'Cart cleared', type: 'info' }); }}>Clear all</button>
              </div>
              <div className="cart-items-list">
                {items.map(item => (
                  <CartItem key={item._id} item={item} onSaveForLater={handleSaveForLater} />
                ))}
              </div>

              {/* Saved for later */}
              {saved.length > 0 && (
                <div className="cart-saved-section">
                  <h3 className="cart-saved-title">Saved for Later ({saved.length})</h3>
                  <div className="cart-items-list">
                    {saved.map(item => (
                      <SavedItem key={item._id} item={item} onMoveToCart={handleMoveToCart} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Summary Column ── */}
            <div className="cart-summary-col">
              <div className="cart-summary-card">
                <h3 className="cart-summary-title">Order Summary</h3>

                <div className="cart-summary-row">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{cartTotal > 0 ? `₹${cartTotal}` : '—'}</span>
                </div>

                <div className="cart-summary-row">
                  <span>Delivery</span>
                  <span>{shippingCost === 0 && cartTotal > 0 ? <span className="cart-free-ship">Free</span> : shippingCost > 0 ? `₹${shippingCost}` : '—'}</span>
                </div>

                {cartTotal < 999 && cartTotal > 0 && (
                  <div className="cart-ship-nudge">
                    Add ₹{999 - cartTotal} more for free delivery
                    <div className="cart-ship-bar"><div className="cart-ship-fill" style={{ width: `${Math.min(100, (cartTotal / 999) * 100)}%` }} /></div>
                  </div>
                )}

                <div className="cart-summary-divider" />

                {grandTotal > 0 && (
                  <div className="cart-summary-row cart-summary-total">
                    <span>Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                )}

                <div className="cart-note">
                  <span className="cart-note-icon">💬</span>
                  <p>Orders are placed & confirmed via WhatsApp. Payment details shared after confirmation.</p>
                </div>

                <a
                  href={`https://wa.me/918767797815?text=${encodeURIComponent(buildWhatsAppMsg())}`}
                  className="cart-whatsapp-btn"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Order via WhatsApp
                </a>
                <p className="cart-security-note">🔒 Your info is only shared with Marvikala</p>
              </div>
            </div>
          </div>
        )}

        {/* Saved items shown even when main cart is empty */}
        {isEmpty && saved.length > 0 && (
          <div className="cart-saved-section" style={{ marginTop: 0 }}>
            <h3 className="cart-saved-title">Saved for Later ({saved.length})</h3>
            <div className="cart-items-list">
              {saved.map(item => (
                <SavedItem key={item._id} item={item} onMoveToCart={handleMoveToCart} />
              ))}
            </div>
          </div>
        )}
      </div>


      <Footer />
    </>
  );
}
