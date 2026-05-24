import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';

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
        <div className="ws-seats-fill" style={{ width: `${pct}%`, background: isFull ? '#dc2626' : isLow ? '#f59e0b' : '#6aaa3a' }} />
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

        {ws.badge && <span className="ws-badge ws-modal-badge">{ws.badge}</span>}

        <h2 className="ws-modal-title">{ws.title}</h2>

        <div className="ws-modal-meta">
          <span className="ws-level">{ws.level}</span>
          <span className="ws-dot">·</span>
          <span className="ws-duration">{ws.duration}</span>
        </div>

        <div className="ws-modal-date">
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
              href={`https://wa.me/918767797815?text=Hi! I'd like to register for the "${ws.title}" workshop on ${formatDate(ws.date)}. Please share the details!`}
              className="ws-enquire-btn"
              target="_blank"
              rel="noreferrer"
            >
              Register Now
            </a>
          ) : (
            <a
              href={`https://wa.me/918767797815?text=Hi! I'd like to join the waitlist for "${ws.title}". Please let me know when it's available again!`}
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
      {isLow && !isFull && <span className="ws-badge ws-badge-low">{ws.seatsLeft} seats left</span>}

      {/* Meta row */}
      <div className="ws-card-meta-row">
        <span className="ws-level">{ws.level}</span>
        <span className="ws-dot">·</span>
        <span className="ws-duration">{ws.duration}</span>
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
  const [selectedWs, setSelectedWs] = useState(null);
  const [workshops, setWorkshops] = useState(WORKSHOPS); // static fallback
  const [wsLoading, setWsLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/workshops')
      .then(res => {
        if (res.data.length > 0) {
          // Normalize: API returns date as ISO string, convert to Date object
          setWorkshops(res.data.map(w => ({ ...w, date: new Date(w.date), id: w._id })));
        }
        // If empty, keep the static seed data
      })
      .catch(() => {}) // keep static data on error
      .finally(() => setWsLoading(false));
  }, []);

  const upcomingList = workshops.filter(w => w.upcoming);

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
          <BackButton pageName="Workshops" />
          <h1 className="sa-title">Workshops</h1>
        </div>

        {/* Hero blurb */}
        <div className="ws-hero">
          <p className="ws-hero-text">
            Join us in our cozy Mumbai studio for hands-on crochet workshops.
            Whether you're a complete beginner or looking to level up, there's something for everyone.
          </p>
          <div className="ws-hero-chips">
            <span className="ws-chip">Mumbai Studio</span>
            <span className="ws-chip">✦ Small Groups (max 12)</span>
            <span className="ws-chip">All Materials Included</span>
          </div>
        </div>

        {/* Workshop cards */}
        <div className="ws-grid">
          {upcomingList.map(ws => (
            <WorkshopCard key={ws.id} ws={ws} onClick={() => setSelectedWs(ws)} />
          ))}
        </div>


      </div>

      {selectedWs && <WorkshopModal ws={selectedWs} onClose={() => setSelectedWs(null)} />}

      <Footer />
    </>
  );
}
