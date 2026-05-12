import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const COUPONS = {
  MARVIKALA10: { discount: 10, label: '10% off' },
  WELCOME15:   { discount: 15, label: '15% off for new customers' },
  MUMBAI20:    { discount: 20, label: '20% Mumbai special' },
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
function BookmarkIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
}

function CartItem({ item, onSaveForLater }) {
  const { updateQty, removeFromCart } = useCart();
  const toast = useToast();
  const src = imgUrl(item.image);

  function handleRemove() {
    removeFromCart(item._id);
    toast({ message: `${item.name} removed from cart`, type: 'info' });
  }

  return (
    <div className="cart-item">
      <div className="cart-item-img">
        {src ? <img src={src} alt={item.name} loading="lazy" /> : <span className="cart-item-placeholder">🧶</span>}
      </div>
      <div className="cart-item-info">
        <div className="cart-item-cat">{CAT_LABEL[item.category] || item.category}</div>
        <div className="cart-item-name">{item.name}</div>
        {item.price && (
          <div className="cart-item-price-row">
            <span className="cart-item-price">₹{item.price}</span>
            {item.originalPrice && <span className="cart-item-orig">₹{item.originalPrice}</span>}
          </div>
        )}
        <div className="cart-item-controls">
          <div className="cart-qty-group" role="group" aria-label="Quantity">
            <button className="cart-qty-btn" onClick={() => item.qty > 1 ? updateQty(item._id, item.qty - 1) : handleRemove()} aria-label="Decrease"><MinusIcon /></button>
            <span className="cart-qty-val" aria-live="polite">{item.qty}</span>
            <button className="cart-qty-btn" onClick={() => updateQty(item._id, item.qty + 1)} aria-label="Increase"><PlusIcon /></button>
          </div>
          <div className="cart-item-actions">
            <button className="cart-save-btn" onClick={() => onSaveForLater(item)} title="Save for later">
              <BookmarkIcon /> Save
            </button>
            <button className="cart-remove-btn" onClick={handleRemove} aria-label="Remove item"><TrashIcon /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SavedItem({ item, onMoveToCart }) {
  const toast = useToast();
  const src = imgUrl(item.image);
  return (
    <div className="cart-item cart-item-saved">
      <div className="cart-item-img">
        {src ? <img src={src} alt={item.name} loading="lazy" /> : <span className="cart-item-placeholder">🧶</span>}
      </div>
      <div className="cart-item-info">
        <div className="cart-item-cat">{CAT_LABEL[item.category] || item.category}</div>
        <div className="cart-item-name">{item.name}</div>
        {item.price && <div className="cart-item-price-row"><span className="cart-item-price">₹{item.price}</span></div>}
        <button className="cart-move-btn" onClick={() => onMoveToCart(item)}>
          Move to Cart
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart, addToCart, removeFromCart } = useCart();
  const toast = useToast();
  const [exiting, setExiting] = useState(false);

  // Save for later
  const [saved, setSaved] = useState(loadSaved);
  useEffect(() => { persistSaved(saved); }, [saved]);

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError('Enter a coupon code'); return; }
    if (COUPONS[code]) {
      setAppliedCoupon({ code, ...COUPONS[code] });
      setCouponError('');
      toast({ message: `Coupon applied — ${COUPONS[code].label}!`, type: 'success' });
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  }

  function handleSaveForLater(item) {
    removeFromCart(item._id);
    setSaved(prev => [...prev.filter(s => s._id !== item._id), item]);
    toast({ message: `${item.name} saved for later`, type: 'info' });
  }

  function handleMoveToCart(item) {
    setSaved(prev => prev.filter(s => s._id !== item._id));
    addToCart(item);
    toast({ message: `${item.name} moved to cart!`, type: 'success' });
  }

  // Calculations
  const discountAmt  = appliedCoupon ? Math.round(cartTotal * appliedCoupon.discount / 100) : 0;
  const discountedTotal = cartTotal - discountAmt;
  const shippingCost = discountedTotal === 0 ? 0 : discountedTotal >= 999 ? 0 : 80;
  const grandTotal   = discountedTotal + shippingCost;

  function buildWhatsAppMsg() {
    if (!items.length) return '';
    const lines = items.map(i => `• ${i.name} × ${i.qty}${i.price ? ` — ₹${i.price * i.qty}` : ''}`);
    const couponLine = appliedCoupon ? `\nCoupon: ${appliedCoupon.code} (${appliedCoupon.discount}% off)` : '';
    const totalLine = grandTotal > 0 ? `\n\nTotal: ₹${grandTotal}${shippingCost === 0 ? ' (Free delivery 🎉)' : ` + ₹${shippingCost} delivery`}` : '';
    return `Hi! I'd like to place an order from Marvikala:\n\n${lines.join('\n')}${couponLine}${totalLine}\n\nPlease confirm availability. Thank you! 🌸`;
  }

  const isEmpty = items.length === 0;
  const itemCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <div className="top-ribbon">
        <div className="top-ribbon-track">
          <span>📍 Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span>🚛 Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span>🌍 Shipping Pan India</span><span className="ribbon-gap">✦</span>
          <span>📍 Based in Mumbai</span><span className="ribbon-sep">|</span>
          <span>🚛 Free delivery over ₹999</span><span className="ribbon-sep">|</span>
          <span>🌍 Shipping Pan India</span><span className="ribbon-gap">✦</span>
        </div>
      </div>
      <Navbar searchQuery="" onSearch={() => {}} />

      <div className={`sa-page${exiting ? ' page-exiting' : ''}`}>
        <div className="sa-header-row">
          <h1 className="sa-title">Your Cart {!isEmpty && <span className="cart-title-count">({itemCount})</span>}</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Continue Shopping</button>
        </div>

        {isEmpty ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🧺</div>
            <h3 className="cart-empty-title">Your cart is empty</h3>
            <p className="cart-empty-sub">Add some handmade magic to your cart!</p>
            <button className="cart-shop-btn" onClick={() => navigate('/shop')}>Browse Products</button>
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

                {appliedCoupon && (
                  <div className="cart-summary-row cart-discount-row">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="cart-discount-val">−₹{discountAmt}</span>
                  </div>
                )}

                <div className="cart-summary-row">
                  <span>Delivery</span>
                  <span>{shippingCost === 0 && discountedTotal > 0 ? <span className="cart-free-ship">Free 🎉</span> : shippingCost > 0 ? `₹${shippingCost}` : '—'}</span>
                </div>

                {discountedTotal < 999 && discountedTotal > 0 && (
                  <div className="cart-ship-nudge">
                    Add ₹{999 - discountedTotal} more for free delivery
                    <div className="cart-ship-bar"><div className="cart-ship-fill" style={{ width: `${Math.min(100, (discountedTotal / 999) * 100)}%` }} /></div>
                  </div>
                )}

                <div className="cart-summary-divider" />

                {grandTotal > 0 && (
                  <div className="cart-summary-row cart-summary-total">
                    <span>Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                )}

                {/* Coupon */}
                {!appliedCoupon ? (
                  <div className="cart-coupon-wrap">
                    <div className="cart-coupon-row">
                      <input
                        className={`cart-coupon-input${couponError ? ' error' : ''}`}
                        type="text"
                        placeholder="Coupon code"
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value); setCouponError(''); }}
                        onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                        aria-label="Coupon code"
                      />
                      <button className="cart-coupon-btn" onClick={applyCoupon}>Apply</button>
                    </div>
                    {couponError && <p className="cart-coupon-error">{couponError}</p>}
                  </div>
                ) : (
                  <div className="cart-coupon-applied">
                    <span className="cart-coupon-tag">🏷️ {appliedCoupon.code} — {appliedCoupon.label}</span>
                    <button className="cart-coupon-remove" onClick={removeCoupon} aria-label="Remove coupon">✕</button>
                  </div>
                )}

                <div className="cart-note">
                  <span className="cart-note-icon">💬</span>
                  <p>Orders are placed & confirmed via WhatsApp. Payment details shared after confirmation.</p>
                </div>

                <a
                  href={`https://wa.me/919769238160?text=${encodeURIComponent(buildWhatsAppMsg())}`}
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
