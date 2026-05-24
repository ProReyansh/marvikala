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
        <span><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Based in Mumbai</span><span className="ribbon-sep">|</span>
        <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free delivery over ₹999</span><span className="ribbon-sep">|</span>
        <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Shipping Pan India</span><span className="ribbon-gap">✦</span>
        <span><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> Based in Mumbai</span><span className="ribbon-sep">|</span>
        <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Free delivery over ₹999</span><span className="ribbon-sep">|</span>
        <span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{display:'inline-block',verticalAlign:'middle',marginRight:'3px'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Shipping Pan India</span><span className="ribbon-gap">✦</span>
      </div></div>
      <Navbar searchQuery="" onSearch={() => {}} />
      <div className="sa-page hto-page">
        <div className="sa-header-row">
          <h1 className="sa-title">How to Order</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back / How to Order</button>
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
