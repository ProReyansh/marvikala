import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Dates relative to current month (May 2026)
const WORKSHOPS = [
  {
    id: 1,
    title: 'Beginner Crochet — Flowers & Keychain',
    description: 'Perfect for absolute beginners! Learn the basic crochet stitches and create your very own crochet flower and a cute keychain to take home.',
    duration: '3 hours',
    level: 'Beginner',
    date: new Date('2026-05-25T11:00:00'),
    seatsLeft: 4,
    totalSeats: 10,
    includes: ['All materials provided', 'Take-home kit', 'Light refreshments', 'Certificate of completion'],
    price: '₹799',
    emoji: '🌸',
    color: '#FFF0F3',
    badge: 'Most Popular',
    upcoming: true,
  },
  {
    id: 2,
    title: 'Amigurumi — Mini Stuffed Animals',
    description: 'Dive into the magical world of amigurumi! Create adorable little crocheted stuffed animals. You\'ll take home the cutest little creature you made yourself.',
    duration: '4 hours',
    level: 'Beginner–Intermediate',
    date: new Date('2026-06-08T11:00:00'),
    seatsLeft: 7,
    totalSeats: 10,
    includes: ['All yarn & stuffing provided', 'Pattern booklet', 'Crochet hook to keep', 'Take-home amigurumi'],
    price: '₹1,199',
    emoji: '🐻',
    color: '#F5EDE0',
    badge: null,
    upcoming: true,
  },
  {
    id: 3,
    title: 'Crochet Jewellery Masterclass',
    description: 'Learn to create delicate crochet jewellery — earrings, bracelets, and rings using fine thread and beads. Perfect for those who love intricate work.',
    duration: '3.5 hours',
    level: 'Intermediate',
    date: new Date('2026-06-22T14:00:00'),
    seatsLeft: 6,
    totalSeats: 8,
    includes: ['Fine thread & beads kit', 'Jewellery tools', 'Gift box for your pieces', 'Recipe card for re-creating at home'],
    price: '₹999',
    emoji: '💍',
    color: '#F0F4E8',
    badge: 'New',
    upcoming: true,
  },
  {
    id: 4,
    title: 'Festive Crochet — Rakhis & Decor',
    description: 'A seasonal workshop to create beautiful handmade Rakhis and festive home decor. Bring creativity and leave with gorgeous handmade festival pieces.',
    duration: '2.5 hours',
    level: 'All Levels',
    date: new Date('2026-08-03T11:00:00'),
    seatsLeft: 8,
    totalSeats: 12,
    includes: ['All festive materials', 'Gift packaging', 'Personalisation options', 'Chai & snacks'],
    price: '₹699',
    emoji: '🪢',
    color: '#FFF8EC',
    badge: 'Seasonal',
    upcoming: true,
  },
  // Past workshops
  {
    id: 5,
    title: 'Spring Flowers Workshop',
    description: 'A lovely spring edition where participants made beautiful crochet bouquets and flower crowns.',
    duration: '3 hours',
    level: 'Beginner',
    date: new Date('2026-03-15T11:00:00'),
    seatsLeft: 0,
    totalSeats: 10,
    includes: [],
    price: '₹799',
    emoji: '🌷',
    color: '#FEF0F0',
    badge: null,
    upcoming: false,
  },
  {
    id: 6,
    title: 'Valentine\'s Crochet Hearts',
    description: 'A special Valentine\'s Day session creating heart keychains, bookmarks and small bouquets as gifts.',
    duration: '2.5 hours',
    level: 'All Levels',
    date: new Date('2026-02-14T15:00:00'),
    seatsLeft: 0,
    totalSeats: 12,
    includes: [],
    price: '₹649',
    emoji: '❤️',
    color: '#FFF0F0',
    badge: null,
    upcoming: false,
  },
];

function formatDate(date) {
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function formatTime(date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function SeatsIndicator({ left, total }) {
  const pct = ((total - left) / total) * 100;
  const isFull = left === 0;
  const isLow = left <= 3 && left > 0;
  return (
    <div className="ws-seats">
      <div className="ws-seats-bar">
        <div className="ws-seats-fill" style={{ width: `${pct}%`, background: isFull ? '#dc2626' : isLow ? '#f59e0b' : '#3D4A22' }} />
      </div>
      <span className={`ws-seats-label${isFull ? ' full' : isLow ? ' low' : ''}`}>
        {isFull ? 'Fully Booked' : `${left} of ${total} seats left`}
      </span>
    </div>
  );
}

function WorkshopModal({ ws, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <div className="ws-modal-overlay" onClick={onClose} aria-hidden="true" />
      <div className="ws-modal" role="dialog" aria-modal="true" aria-label={ws.title}>
        <button className="ws-modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="ws-modal-emoji">{ws.emoji}</div>
        {ws.badge && <span className="ws-badge ws-modal-badge">{ws.badge}</span>}

        <h2 className="ws-modal-title">{ws.title}</h2>

        <div className="ws-modal-meta">
          <span className="ws-level">{ws.level}</span>
          <span className="ws-dot">·</span>
          <span className="ws-duration">⏱ {ws.duration}</span>
        </div>

        <div className="ws-modal-date">
          <span className="ws-modal-date-icon">📅</span>
          <div>
            <div className="ws-modal-date-text">{formatDate(ws.date)}</div>
            <div className="ws-modal-time">{formatTime(ws.date)}</div>
          </div>
        </div>

        <p className="ws-modal-desc">{ws.description}</p>

        <div className="ws-modal-includes">
          <p className="ws-includes-label">What's included:</p>
          <ul>
            {ws.includes.map(item => (
              <li key={item}><span className="ws-check">✓</span> {item}</li>
            ))}
          </ul>
        </div>

        <SeatsIndicator left={ws.seatsLeft} total={ws.totalSeats} />

        <div className="ws-modal-footer">
          <span className="ws-price">{ws.price} <span className="ws-price-per">/ person</span></span>
          {ws.seatsLeft > 0 ? (
            <a
              href={`https://wa.me/919769238160?text=Hi! I'd like to register for the "${ws.title}" workshop on ${formatDate(ws.date)}. Please share the details!`}
              className="ws-enquire-btn"
              target="_blank"
              rel="noreferrer"
            >
              Register Now
            </a>
          ) : (
            <a
              href={`https://wa.me/919769238160?text=Hi! I'd like to join the waitlist for "${ws.title}". Please let me know when it's available again!`}
              className="ws-enquire-btn ws-waitlist-btn"
              target="_blank"
              rel="noreferrer"
            >
              Join Waitlist
            </a>
          )}
        </div>
      </div>
    </>
  );
}

function WorkshopCard({ ws, onClick }) {
  const isLow = ws.seatsLeft <= 3 && ws.seatsLeft > 0;
  const isFull = ws.seatsLeft === 0;

  return (
    <div className="ws-card" style={{ '--ws-bg': ws.color, background: 'var(--white)' }} onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      {ws.badge && <span className="ws-badge">{ws.badge}</span>}
      {isLow && !isFull && <span className="ws-badge ws-badge-low">⚡ {ws.seatsLeft} seats left</span>}

      {/* Visual image area */}
      <div className="ws-card-hero" style={{ background: ws.color }}>
        <span className="ws-card-emoji">{ws.emoji}</span>
      </div>

      {/* Meta row */}
      <div className="ws-card-meta-row">
        <span className="ws-level">{ws.level}</span>
        <span className="ws-dot">·</span>
        <span className="ws-duration">⏱ {ws.duration}</span>
      </div>

      <h3 className="ws-card-title">{ws.title}</h3>

      <div className="ws-card-date">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {formatDate(ws.date)} · {formatTime(ws.date)}
      </div>

      <p className="ws-card-desc">{ws.description}</p>

      {ws.upcoming && <SeatsIndicator left={ws.seatsLeft} total={ws.totalSeats} />}

      <div className="ws-card-footer">
        <div className="ws-footer-price">
          <span className="ws-price">{ws.price}</span>
          <span className="ws-price-per">/ person</span>
        </div>
        <button className="ws-enquire-btn" onClick={e => { e.stopPropagation(); onClick(); }}>
          {isFull ? 'Join Waitlist' : 'View Details →'}
        </button>
      </div>
    </div>
  );
}

export default function WorkshopsPage() {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);
  const [selectedWs, setSelectedWs] = useState(null);
  const [tab, setTab] = useState('upcoming');

  const upcomingList = WORKSHOPS.filter(w => w.upcoming);
  const pastList = WORKSHOPS.filter(w => !w.upcoming);

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
          <h1 className="sa-title">Workshops</h1>
          <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>

        {/* Hero blurb */}
        <div className="ws-hero">
          <div className="ws-hero-emoji">🧶</div>
          <p className="ws-hero-text">
            Join us in our cozy Mumbai studio for hands-on crochet workshops.
            Whether you're a complete beginner or looking to level up, there's something for everyone.
          </p>
          <div className="ws-hero-chips">
            <span className="ws-chip">📍 Mumbai Studio</span>
            <span className="ws-chip">✦ Small Groups (max 12)</span>
            <span className="ws-chip">🎨 All Materials Included</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="ws-tabs">
          <button className={`ws-tab${tab === 'upcoming' ? ' active' : ''}`} onClick={() => setTab('upcoming')}>
            Upcoming <span className="ws-tab-count">{upcomingList.length}</span>
          </button>
          <button className={`ws-tab${tab === 'past' ? ' active' : ''}`} onClick={() => setTab('past')}>
            Past Workshops <span className="ws-tab-count">{pastList.length}</span>
          </button>
        </div>

        {/* Workshop cards */}
        <div className="ws-grid">
          {(tab === 'upcoming' ? upcomingList : pastList).map(ws => (
            <WorkshopCard key={ws.id} ws={ws} onClick={() => setSelectedWs(ws)} />
          ))}
        </div>

        {/* Private workshops CTA */}
        <div className="ws-private-block">
          <div className="ws-private-emoji">🏠</div>
          <h3 className="ws-private-title">Private & Group Workshops</h3>
          <p className="ws-private-desc">
            Want to host a crochet session for your friends, office, or a special occasion?
            We do private workshops at our studio or at your venue in Mumbai.
          </p>
          <a href="https://wa.me/919769238160?text=Hi! I'm interested in a private/group crochet workshop." className="faq-cta-btn" target="_blank" rel="noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enquire Now
          </a>
        </div>

      </div>

      {selectedWs && <WorkshopModal ws={selectedWs} onClose={() => setSelectedWs(null)} />}

      <Footer />
    </>
  );
}
