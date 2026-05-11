import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ShippingPage() {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);

  return (
    <>
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

      <div className={`sa-page${exiting ? ' page-exiting' : ''}`}>

        <div className="sa-header-row">
          <h1 className="sa-title">Shipping &amp; Returns</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="policy-doc">

          {/* Delivery Times */}
          <div className="ship-card">
            <div className="ship-card-icon">🚛</div>
            <div className="ship-card-body">
              <h2>Delivery Timeline</h2>
              <div className="ship-table">
                <div className="ship-row">
                  <span className="ship-location">📍 Mumbai (Local)</span>
                  <span className="ship-time">2–4 business days</span>
                </div>
                <div className="ship-row">
                  <span className="ship-location">🌍 Pan India</span>
                  <span className="ship-time">5–8 business days</span>
                </div>
                <div className="ship-row">
                  <span className="ship-location">🎨 Custom Orders</span>
                  <span className="ship-time">7–14 days (crafting time) + delivery</span>
                </div>
              </div>
              <p className="ship-note">Note: Delivery times are estimates and may vary during peak festive seasons (Diwali, Raksha Bandhan, etc.)</p>
            </div>
          </div>

          {/* Shipping Costs */}
          <div className="ship-card">
            <div className="ship-card-icon">💰</div>
            <div className="ship-card-body">
              <h2>Shipping Costs</h2>
              <div className="ship-table">
                <div className="ship-row">
                  <span className="ship-location">Orders above ₹999</span>
                  <span className="ship-time ship-free">FREE 🎉</span>
                </div>
                <div className="ship-row">
                  <span className="ship-location">Mumbai orders below ₹999</span>
                  <span className="ship-time">₹60</span>
                </div>
                <div className="ship-row">
                  <span className="ship-location">Pan India below ₹999</span>
                  <span className="ship-time">₹80–₹120</span>
                </div>
              </div>
            </div>
          </div>

          {/* Packaging */}
          <div className="ship-card">
            <div className="ship-card-icon">📦</div>
            <div className="ship-card-body">
              <h2>Packaging</h2>
              <p>
                All Marvikala products are packed with care in eco-friendly packaging. Each item is
                individually wrapped to protect it during transit. Gift packaging is available on
                request — just let us know when you place your order!
              </p>
            </div>
          </div>

          {/* Returns */}
          <div className="ship-card">
            <div className="ship-card-icon">🔄</div>
            <div className="ship-card-body">
              <h2>Returns &amp; Exchanges</h2>
              <p>
                Since all our products are handmade to order, we generally do not accept returns.
                However, we want you to be 100% happy with your purchase!
              </p>
              <p style={{ marginTop: 12 }}>We will offer a <strong>replacement or refund</strong> if:</p>
              <ul className="ship-list">
                <li>The product arrives damaged or broken</li>
                <li>The item is significantly different from what was described</li>
                <li>You received the wrong item</li>
              </ul>
              <p className="ship-note" style={{ marginTop: 12 }}>
                Please contact us within <strong>48 hours of delivery</strong> with a photo of the issue
                via WhatsApp or Instagram. We'll sort it out as quickly as possible!
              </p>
            </div>
          </div>

          {/* Order Issues */}
          <div className="ship-card">
            <div className="ship-card-icon">💬</div>
            <div className="ship-card-body">
              <h2>Issues with Your Order?</h2>
              <p>We're always here to help. Please reach out to us directly:</p>
              <div className="ship-contacts">
                <a
                  href="https://wa.me/919769238160?text=Hi! I have an issue with my order."
                  className="ship-contact-btn ship-wa"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Us
                </a>
                <a
                  href="https://instagram.com/marvikala"
                  className="ship-contact-btn ship-ig"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="3.5"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                  DM on Instagram
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
