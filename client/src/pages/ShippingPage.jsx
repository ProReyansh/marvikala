import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';

export default function ShippingPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="top-ribbon">
        <div className="top-ribbon-track">
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Based in Mumbai</span>
          <span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free delivery over ₹999</span>
          <span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Shipping Pan India</span>
          <span className="ribbon-gap">✦</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Based in Mumbai</span>
          <span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free delivery over ₹999</span>
          <span className="ribbon-sep">|</span>
          <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Shipping Pan India</span>
          <span className="ribbon-gap">✦</span>
        </div>
      </div>

      <Navbar searchQuery="" onSearch={() => {}} />

      <div className="sa-page">

        <div className="sa-header-row">
          <BackButton pageName="Shipping & Returns" />
          <h1 className="sa-title">Shipping &amp; Returns</h1>
        </div>

        <div className="policy-doc">

          {/* Delivery Times */}
          <div className="ship-card">
            <div className="ship-card-body">
              <h2>Delivery Timeline</h2>
              <div className="ship-table">
                <div className="ship-row">
                  <span className="ship-location">Mumbai (Local)</span>
                  <span className="ship-time">2–4 business days</span>
                </div>
                <div className="ship-row">
                  <span className="ship-location">Pan India</span>
                  <span className="ship-time">5–8 business days</span>
                </div>
                <div className="ship-row">
                  <span className="ship-location">Custom Orders</span>
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
                  <span className="ship-time ship-free">FREE</span>
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
