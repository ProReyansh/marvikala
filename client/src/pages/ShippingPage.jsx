import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ShippingPage() {
  const navigate = useNavigate();

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

      <div className="sa-page">

        <div className="sa-header-row">
          <h1 className="sa-title">Shipping &amp; Returns</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="policy-doc">

          {/* Delivery Times */}
          <div className="ship-card">
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


        </div>
      </div>

      <Footer />
    </>
  );
}
