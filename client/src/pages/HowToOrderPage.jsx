import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const STEPS = [
  { step: '01', icon: '🛍️', title: 'Browse & Choose', desc: 'Browse our collections and find the product you love. You can filter by category or search for something specific.' },
  { step: '02', icon: '💬', title: 'Contact Us on WhatsApp', desc: 'Tap "Add to Cart" or message us directly on WhatsApp with the product name, your preferred colour, size, and quantity.' },
  { step: '03', icon: '🎨', title: 'Customise (Optional)', desc: 'Want a custom colour, size or design? Let us know! We love creating personalised pieces just for you.' },
  { step: '04', icon: '💳', title: 'Confirm & Pay', desc: 'We\'ll confirm availability and share payment details. We accept UPI, bank transfer and other popular methods.' },
  { step: '05', icon: '🧶', title: 'We Handcraft Your Order', desc: 'Your piece is lovingly handmade after you order. Ready-to-ship items dispatch in 1–2 days; custom pieces take 5–10 days.' },
  { step: '06', icon: '📦', title: 'Packed & Shipped', desc: 'We pack each order carefully in eco-friendly packaging and ship across India. You\'ll receive a tracking link once dispatched.' },
  { step: '07', icon: '🌸', title: 'Receive & Enjoy!', desc: 'Unwrap your handmade Marvikala piece and enjoy! Share a photo with us @marvikala — we love seeing you with our creations.' },
];

export default function HowToOrderPage() {
  const navigate = useNavigate();
  return (
    <>
      <div className="top-ribbon"><div className="top-ribbon-track">
        <span>📍 Based in Mumbai</span><span className="ribbon-sep">|</span>
        <span>🚛 Free delivery over ₹999</span><span className="ribbon-sep">|</span>
        <span>🌍 Shipping Pan India</span><span className="ribbon-gap">✦</span>
        <span>📍 Based in Mumbai</span><span className="ribbon-sep">|</span>
        <span>🚛 Free delivery over ₹999</span><span className="ribbon-sep">|</span>
        <span>🌍 Shipping Pan India</span><span className="ribbon-gap">✦</span>
      </div></div>
      <Navbar searchQuery="" onSearch={() => {}} />
      <div className="sa-page hto-page">
        <div className="sa-header-row">
          <h1 className="sa-title">How to Order</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>
        <p className="hto-sub">Ordering from Marvikala is simple and personal — here's how it works</p>
        <div className="hto-steps">
          {STEPS.map((s, i) => (
            <div key={i} className="hto-step">
              <div className="hto-step-left">
                <div className="hto-step-num">{s.step}</div>
                {i < STEPS.length - 1 && <div className="hto-step-line" />}
              </div>
              <div className="hto-step-right">
                <div className="hto-step-icon">{s.icon}</div>
                <h3 className="hto-step-title">{s.title}</h3>
                <p className="hto-step-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
