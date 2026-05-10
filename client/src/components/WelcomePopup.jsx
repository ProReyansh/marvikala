import { useState, useEffect } from 'react';

const POPUP_KEY = 'mk_popup_v2_dismissed';
const DELAY_MS  = 4000; // 4-second delay

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [phone, setPhone]     = useState('');

  useEffect(() => {
    // Only show once per device
    try {
      if (localStorage.getItem(POPUP_KEY)) return;
    } catch {}

    const t = setTimeout(() => {
      setVisible(true);
      // Trigger entrance animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
    }, DELAY_MS);

    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setAnimate(false);
    setTimeout(() => {
      setVisible(false);
      try { localStorage.setItem(POPUP_KEY, '1'); } catch {}
    }, 320);
  }

  function handleJoin() {
    dismiss();
    window.open('https://chat.whatsapp.com/CrwIkmB0JZfA8t7wdvJBB1', '_blank', 'noreferrer');
  }

  if (!visible) return null;

  return (
    <div className={`mk-popup-overlay${animate ? ' mk-popup-overlay--in' : ''}`} onClick={dismiss}>
      <div
        className={`mk-popup-card${animate ? ' mk-popup-card--in' : ''}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome offer"
      >
        {/* Close button */}
        <button className="mk-popup-close" onClick={dismiss} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Decorative top strip */}
        <div className="mk-popup-top">
          <div className="mk-popup-deco-blobs">
            <span className="mk-popup-blob mk-popup-blob--1" />
            <span className="mk-popup-blob mk-popup-blob--2" />
            <span className="mk-popup-blob mk-popup-blob--3" />
          </div>
          <img src="/logo.jpg" alt="Marvikala" className="mk-popup-logo" />
          <div className="mk-popup-flowers">
            <span className="mk-popup-flower">🌸</span>
            <span className="mk-popup-flower mk-popup-flower--2">🌼</span>
            <span className="mk-popup-flower mk-popup-flower--3">🌸</span>
          </div>
        </div>

        {/* Content */}
        <div className="mk-popup-body">
          <p className="mk-popup-eyebrow">✦ Handmade with love ✦</p>
          <h2 className="mk-popup-heading">Welcome to Marvikala!</h2>

          <div className="mk-popup-offer-badge">
            <span className="mk-popup-offer-pct">10% OFF</span>
            <span className="mk-popup-offer-label">your first order</span>
          </div>

          <p className="mk-popup-sub">
            Join our WhatsApp community for exclusive discounts, early access to new crochet drops, festive launches &amp; workshop updates.
          </p>

          <div className="mk-popup-divider">
            <span className="mk-popup-divider-icon">🌿</span>
          </div>

          {/* Phone input */}
          <div className="mk-popup-input-row">
            <div className="mk-popup-flag-prefix">
              <span className="mk-popup-flag">🇮🇳</span>
              <span className="mk-popup-country-code">+91</span>
            </div>
            <input
              type="tel"
              className="mk-popup-phone-input"
              placeholder="Enter your WhatsApp number"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength={10}
              inputMode="numeric"
            />
          </div>

          {/* CTA button */}
          <button className="mk-popup-cta" onClick={handleJoin}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Join our WhatsApp community
          </button>

          {/* Dismiss */}
          <button className="mk-popup-dismiss" onClick={dismiss}>
            I will pay full price
          </button>
        </div>
      </div>
    </div>
  );
}
