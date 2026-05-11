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

const CATEGORIES = [
  { key: 'all', label: 'All Topics' },
  { key: 'shipping', label: '🚛 Shipping' },
  { key: 'custom', label: '🎨 Custom Orders' },
  { key: 'care', label: '🧶 Handmade & Care' },
  { key: 'orders', label: '📦 Orders & Returns' },
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
  const [exiting, setExiting] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAQ_DATA
      .filter(s => activeCategory === 'all' || s.key === activeCategory)
      .map(s => ({
        ...s,
        items: q
          ? s.items.filter(item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q))
          : s.items,
      }))
      .filter(s => s.items.length > 0);
  }, [search, activeCategory]);

  const totalResults = filtered.reduce((sum, s) => sum + s.items.length, 0);

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
          <h1 className="sa-title">FAQs</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back</button>
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
            aria-label="Search FAQs"
          />
          {search && (
            <button className="faq-search-clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
          )}
        </div>

        {/* Category tabs */}
        <div className="faq-tabs" role="tablist">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`faq-tab${activeCategory === cat.key ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
              role="tab"
              aria-selected={activeCategory === cat.key}
            >
              {cat.label}
            </button>
          ))}
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
                  <span className="faq-section-icon" aria-hidden="true">{section.icon}</span>
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
            <div className="faq-no-results-icon">🔍</div>
            <p>No questions match your search.</p>
            <button className="faq-clear-search" onClick={() => { setSearch(''); setActiveCategory('all'); }}>Clear filters</button>
          </div>
        )}

        {/* CTA */}
        <div className="faq-cta-block">
          <p className="faq-cta-text">Still have questions?</p>
          <p className="faq-cta-sub">We're always happy to help — just say hi on WhatsApp!</p>
          <a href="https://wa.me/919769238160?text=Hi! I have a question about Marvikala." className="faq-cta-btn" target="_blank" rel="noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
}
