import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPage() {
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
          <h1 className="sa-title">Privacy Policy</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="policy-doc">
          <div className="policy-intro">
            <p>
              At Marvikala, we respect your privacy and are committed to protecting any personal
              information you share with us. This policy explains what we collect, how we use it,
              and how we keep it safe.
            </p>
          </div>

          <div className="policy-section">
            <h2>Information We Collect</h2>
            <p>When you interact with us, we may collect:</p>
            <ul>
              <li><strong>Contact details</strong> — name, phone number, address (when you place an order via WhatsApp or Instagram)</li>
              <li><strong>Order information</strong> — products you enquired about or ordered, delivery preferences</li>
              <li><strong>Communication data</strong> — messages exchanged via WhatsApp, Instagram, or our contact form</li>
            </ul>
            <p>We do not collect payment details directly — all payments are processed through UPI or bank transfers, which are managed by you through your own banking app.</p>
          </div>

          <div className="policy-section">
            <h2>How We Use Your Information</h2>
            <p>We use your information solely to:</p>
            <ul>
              <li>Process and fulfil your orders</li>
              <li>Communicate with you about your order status, customisation details, or delivery</li>
              <li>Respond to your enquiries and provide customer support</li>
              <li>Send you updates about new products or workshops (only if you've opted in)</li>
            </ul>
            <p>We will never sell, rent, or share your personal data with any third party for marketing purposes.</p>
          </div>

          <div className="policy-section">
            <h2>Data Security</h2>
            <p>
              Your data is stored securely and only accessible to the Marvikala team. We use
              WhatsApp and Instagram (end-to-end encrypted) as our primary communication channels,
              which provide strong data protection by default.
            </p>
          </div>

          <div className="policy-section">
            <h2>Cookies</h2>
            <p>
              This website uses minimal cookies to improve your browsing experience — such as
              remembering your cart items and search queries during a session. We do not use
              advertising or tracking cookies.
            </p>
          </div>

          <div className="policy-section">
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Ask us what information we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Opt out of any marketing messages at any time</li>
            </ul>
          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}
