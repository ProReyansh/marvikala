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
      <main className="hto-page">
        <div className="hto-header">
          <h1 className="hto-title">How to Order</h1>
          <p className="hto-sub">Ordering from Marvikala is simple and personal — here's how it works</p>
          <button className="hto-back" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
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
        <div className="hto-cta-wrap">
          <h2 className="hto-cta-heading">Ready to order?</h2>
          <p className="hto-cta-sub">Chat with us on WhatsApp — we're happy to help!</p>
          <a href="https://wa.me/919769238160?text=Hi! I'd like to place an order." className="hto-wa-btn" target="_blank" rel="noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Order on WhatsApp
          </a>
          <button className="hto-shop-btn" onClick={() => navigate('/shop')}>Browse Products</button>
        </div>
      </main>
      <Footer />
    </>
  );
}
