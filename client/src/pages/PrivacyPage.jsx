import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPage() {
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
          <h1 className="sa-title">Privacy Policy</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="policy-doc">
          <p className="policy-updated">Last updated: January 2025</p>

          <div className="policy-intro">
            <p>
              At Marvikala, we respect your privacy and are committed to protecting any personal
              information you share with us. This policy explains what we collect, how we use it,
              and how we keep it safe.
            </p>
          </div>

          <div className="policy-section">
            <h2><span className="policy-icon">📋</span> Information We Collect</h2>
            <p>When you interact with us, we may collect:</p>
            <ul>
              <li><strong>Contact details</strong> — name, phone number, address (when you place an order via WhatsApp or Instagram)</li>
              <li><strong>Order information</strong> — products you enquired about or ordered, delivery preferences</li>
              <li><strong>Communication data</strong> — messages exchanged via WhatsApp, Instagram, or our contact form</li>
            </ul>
            <p>We do not collect payment details directly — all payments are processed through UPI or bank transfers, which are managed by you through your own banking app.</p>
          </div>

          <div className="policy-section">
            <h2><span className="policy-icon">🎯</span> How We Use Your Information</h2>
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
            <h2><span className="policy-icon">🔒</span> Data Security</h2>
            <p>
              Your data is stored securely and only accessible to the Marvikala team. We use
              WhatsApp and Instagram (end-to-end encrypted) as our primary communication channels,
              which provide strong data protection by default.
            </p>
          </div>

          <div className="policy-section">
            <h2><span className="policy-icon">🍪</span> Cookies</h2>
            <p>
              This website uses minimal cookies to improve your browsing experience — such as
              remembering your cart items and search queries during a session. We do not use
              advertising or tracking cookies.
            </p>
          </div>

          <div className="policy-section">
            <h2><span className="policy-icon">🗑️</span> Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Ask us what information we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Opt out of any marketing messages at any time</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2><span className="policy-icon">📱</span> Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or how we handle your data,
              please reach out to us:
            </p>
            <ul>
              <li>WhatsApp: <a href="https://wa.me/919769238160" target="_blank" rel="noreferrer">+91 97692 38160</a></li>
              <li>Instagram: <a href="https://instagram.com/marvikala" target="_blank" rel="noreferrer">@marvikala</a></li>
            </ul>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
}
