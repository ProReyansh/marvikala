import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FAQ_DATA = [
  {
    section: 'Shipping & Delivery',
    key: 'shipping',
    icon: '🚛',
    items: [
      { q: 'Where do you deliver?', a: 'We ship Pan India! We are based in Mumbai and offer quick local delivery within Mumbai. For other cities, we ship via trusted courier partners across India.' },
      { q: 'How long does delivery take?', a: 'Mumbai orders typically arrive within 2–4 business days. Pan India orders take 5–8 business days depending on your location.' },
      { q: 'Is there a minimum order for free delivery?', a: 'Yes! Orders above ₹999 get free delivery. For orders below that, a small shipping fee of ₹60–₹120 applies depending on your location.' },
      { q: 'Do you offer express delivery?', a: "For urgent orders in Mumbai, please contact us on WhatsApp and we'll do our best to arrange same-day or next-day delivery." },
    ],
  },
  {
    section: 'Custom Orders',
    key: 'custom',
    icon: '🎨',
    items: [
      { q: 'Can I request a custom colour or design?', a: "Absolutely! We love making personalised pieces. Just reach out on WhatsApp or Instagram with your idea — colour, size, theme — and we'll bring it to life." },
      { q: 'How long does a custom order take?', a: "Custom pieces generally take 7–14 days depending on the complexity. We'll give you an estimated timeline when you place your order." },
      { q: 'Is there an extra charge for custom orders?', a: "For simple colour changes, there's no extra charge. For fully custom designs or special materials, pricing may vary — we'll discuss it with you upfront." },
      { q: 'Do you accept bulk/gifting orders?', a: 'Yes! We love creating gift hampers and bulk orders for events, weddings, baby showers, and corporate gifting. Contact us for a special bulk price.' },
    ],
  },
  {
    section: 'Handmade & Care',
    key: 'care',
    icon: '🧶',
    items: [
      { q: 'Are all products truly handmade?', a: 'Every single piece is 100% handmade stitch by stitch in our small Mumbai studio. No machines, no mass production — just love and craft.' },
      { q: 'How do I care for my crochet items?', a: 'Hand wash gently in cold water with mild detergent. Lay flat to dry — avoid wringing or machine washing. Keep away from direct sunlight for longer-lasting colours.' },
      { q: 'Why does my item look slightly different from the photo?', a: "Because each piece is handmade, there will always be tiny natural variations. This is what makes your piece truly one-of-a-kind!" },
      { q: 'What materials do you use?', a: 'We primarily use soft cotton and acrylic yarn. All materials are carefully selected to be durable, vibrant, and skin-friendly.' },
    ],
  },
  {
    section: 'Orders & Returns',
    key: 'orders',
    icon: '📦',
    items: [
      { q: 'How do I place an order?', a: "Browse our shop and click 'Enquire Now' on any product. We'll confirm availability, customisation options, and payment details over WhatsApp." },
      { q: 'What payment methods do you accept?', a: 'We accept UPI (GPay, PhonePe, Paytm), bank transfer, and cash on delivery for Mumbai orders. Payment details are shared once your order is confirmed.' },
      { q: 'Can I cancel or modify my order?', a: "You can cancel or modify your order within 24 hours of placing it. Once we've started crafting your piece, cancellations may not be possible." },
      { q: 'What is your return policy?', a: "Since all products are handmade to order, we do not accept returns unless the item is damaged or significantly different from what was described. Please reach out within 48 hours of delivery if there's an issue." },
    ],
  },
];

function AccordionItem({ q, a, highlight }) {
  const [open, setOpen] = useState(false);

  // Highlight matching text
  function hl(text) {
    if (!highlight) return text;
    const idx = text.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="faq-highlight">{text.slice(idx, idx + highlight.length)}</mark>
        {text.slice(idx + highlight.length)}
      </>
    );
  }

  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{hl(q)}</span>
        <span className="faq-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <div className="faq-answer" aria-hidden={!open}>
        <p>{hl(a)}</p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Filter FAQ items by search query across question and answer text
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAQ_DATA
      .map(s => ({
        ...s,
        items: q
          ? s.items.filter(item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q))
          : s.items,
      }))
      .filter(s => s.items.length > 0);
  }, [search]);

  const totalResults = filtered.reduce((sum, s) => sum + s.items.length, 0);

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
        <div className="sa-header-row">
          <h1 className="sa-title">FAQs</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back / FAQs</button>
        </div>

        <p className="faq-subtitle">Everything you need to know about Marvikala</p>

        {/* Search */}
        <div className="faq-search-wrap">
          <svg className="faq-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="faq-search-input"
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
            onFocus={e => {
              setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 320);
            }}
            aria-label="Search FAQs"
          />
          {search && (
            <button className="faq-search-clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
          )}
        </div>

        {/* Results count */}
        {search && (
          <p className="faq-results-count">
            {totalResults === 0 ? 'No results found' : `${totalResults} result${totalResults !== 1 ? 's' : ''} for "${search}"`}
          </p>
        )}

        {/* FAQ Sections */}
        {filtered.length > 0 ? (
          <div className="faq-sections">
            {filtered.map(section => (
              <div key={section.section} className="faq-section">
                <div className="faq-section-header">
                  <h2 className="faq-section-title">{section.section}</h2>
                </div>
                <div className="faq-list" role="list">
                  {section.items.map(item => (
                    <AccordionItem key={item.q} q={item.q} a={item.a} highlight={search} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="faq-no-results">
            <p>No questions match your search.</p>
            <button className="faq-clear-search" onClick={() => { setSearch(''); setActiveCategory('all'); }}>Clear filters</button>
          </div>
        )}

      </div>

      <Footer />
    </>
  );
}
