import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ searchQuery, onSearch }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(() => {
    try { return !!sessionStorage.getItem('mk_search'); } catch { return false; }
  });
  const [dropdownTop, setDropdownTop] = useState(56); // tracks actual navbar bottom

  const desktopRef   = useRef();   // desktop inline search input
  const mobileRef    = useRef();   // mobile search input
  const navRef       = useRef();   // the <nav> element
  const dropdownRef  = useRef();   // mobile search dropdown div

  const navigate  = useNavigate();
  const location  = useLocation();
  const isHome    = location.pathname === '/';

  // ── Track navbar bottom so dropdown always sits right below it ──
  useEffect(() => {
    if (!searchOpen) return;
    function updateTop() {
      const rect = navRef.current?.getBoundingClientRect();
      if (rect) setDropdownTop(rect.bottom);
    }
    updateTop();
    window.addEventListener('scroll', updateTop, { passive: true });
    window.addEventListener('resize', updateTop);
    return () => {
      window.removeEventListener('scroll', updateTop);
      window.removeEventListener('resize', updateTop);
    };
  }, [searchOpen]);

  // ── Close search on outside click ──
  useEffect(() => {
    if (!searchOpen) return;
    // Short delay so the same click that opens it doesn't immediately close it
    const t = setTimeout(() => {
      function handleOutside(e) {
        if (dropdownRef.current?.contains(e.target)) return;
        if (navRef.current?.contains(e.target)) return;
        closeSearch();
      }
      document.addEventListener('pointerdown', handleOutside);
      return () => document.removeEventListener('pointerdown', handleOutside);
    }, 50);
    return () => clearTimeout(t);
  }, [searchOpen]);

  // ── Auto-focus when arriving from ProductPage search ──
  useEffect(() => {
    let should;
    try { should = sessionStorage.getItem('mk_focus_search'); } catch {}
    if (!should) return;
    try { sessionStorage.removeItem('mk_focus_search'); } catch {}
    setSearchOpen(true);
    const t = setTimeout(() => {
      if (window.innerWidth <= 768) mobileRef.current?.focus();
      else desktopRef.current?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (searchQuery) setSearchOpen(true);
  }, [searchQuery]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  function goToSection(id) {
    setDrawerOpen(false);
    if (isHome) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else { onSearch?.(''); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80); }
    } else {
      try { sessionStorage.setItem('mk_scroll_to', id); } catch {}
      navigate('/');
    }
  }

  function handleLogoClick(e) {
    e.preventDefault();
    setDrawerOpen(false);
    onSearch?.('');
    if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' });
    else { document.querySelector('.product-page')?.classList.add('pp-exit'); setTimeout(() => navigate('/'), 250); }
  }

  function handleHomeClick(e) {
    e.preventDefault();
    setDrawerOpen(false);
    onSearch?.('');
    if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' });
    else { document.querySelector('.product-page')?.classList.add('pp-exit'); setTimeout(() => navigate('/'), 250); }
  }

  function handleDrawerBrandClick() {
    setDrawerOpen(false);
    onSearch?.('');
    if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' });
    else navigate('/');
  }

  function handleSearchSubmit(e) { e.preventDefault(); }

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => {
      if (window.innerWidth <= 768) mobileRef.current?.focus();
      else desktopRef.current?.focus();
    }, 80);
  }

  function closeSearch() {
    setSearchOpen(false);
    onSearch?.('');
  }

  // ── Icons ──────────────────────────────────────────────────────
  const WaIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );

  const IgIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="3.5"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );

  const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );

  const CartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );

  const CloseIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  return (
    <>
      <nav className="navbar" ref={navRef}>
        {/* ── LEFT: Hamburger (mobile) ── */}
        <button
          className={`hamburger navbar-hamburger-btn${drawerOpen ? ' open' : ''}`}
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>

        {/* ── CENTER: Logo ── */}
        <a href="/" className="navbar-logo" onClick={handleLogoClick}>
          <img src="/logo.jpg" alt="Marvikala" className="navbar-logo-icon" />
          <span className="navbar-logo-text">Marvi<span>kala</span></span>
        </a>

        {/* ── Desktop inline search bar ── */}
        {searchOpen && (
          <div style={{ flex: 1, maxWidth: 380, display: 'flex' }} className="navbar-search-wrap-desktop">
            <form className="navbar-search" onSubmit={handleSearchSubmit}>
              <input
                ref={desktopRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearch?.(e.target.value)}
                className="search-input"
              />
              {searchQuery ? (
                <button type="button" className="search-btn search-btn-clear"
                  onClick={() => { onSearch?.(''); desktopRef.current?.focus(); }} aria-label="Clear">✕</button>
              ) : (
                <button type="button" className="search-btn search-btn-clear"
                  onClick={closeSearch} aria-label="Close search">✕</button>
              )}
            </form>
          </div>
        )}

        {/* ── Desktop Nav links ── */}
        <ul className="navbar-links navbar-links-desktop">
          <li><a href="/" onClick={handleHomeClick}>Home</a></li>
          <li><a href="#products" onClick={(e) => { e.preventDefault(); goToSection('products'); }}>Shop</a></li>
          <li><a href="#collections" onClick={(e) => { e.preventDefault(); goToSection('collections'); }}>Collections</a></li>
          <li><a href="/our-story" onClick={(e) => { e.preventDefault(); navigate('/our-story'); }}>Our Story</a></li>
          <li><a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }} className="navbar-cta">Contact</a></li>
        </ul>

        {/* ── RIGHT: Icons ── */}
        <div className="navbar-right-group">
          {/* Desktop: search toggle only */}
          {!searchOpen && (
            <button onClick={openSearch} aria-label="Search" className="navbar-icon-btn navbar-desktop-only">
              <SearchIcon />
            </button>
          )}

          {/* Mobile: search + cart */}
          <div className="navbar-mobile-icons">
            <button className="navbar-icon-btn" onClick={searchOpen ? closeSearch : openSearch} aria-label="Search">
              <SearchIcon />
            </button>
            <button className="navbar-icon-btn navbar-cart-btn" aria-label="Cart">
              <CartIcon />
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE SEARCH DROPDOWN ── */}
      <div
        ref={dropdownRef}
        className={`mobile-search-dropdown${searchOpen ? ' open' : ''}`}
        style={{ top: dropdownTop }}
      >
        <div className="mobile-search-row">
          <span className="mobile-search-icon-wrap">
            <SearchIcon />
          </span>
          <input
            ref={mobileRef}
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => onSearch?.(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="mobile-search-input"
          />
          {searchQuery && (
            <button
              className="mobile-search-clear"
              onClick={() => { onSearch?.(''); mobileRef.current?.focus(); }}
              aria-label="Clear search"
            >
              <CloseIcon size={12} />
            </button>
          )}
          <button className="mobile-search-close" onClick={closeSearch} aria-label="Close search">
            <CloseIcon size={16} />
          </button>
        </div>
      </div>

      {/* ── DRAWER OVERLAY ── */}
      <div
        className={`drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* ── SLIDE-OUT DRAWER ── */}
      <div className={`drawer${drawerOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Navigation menu">

        {/* Close button — top left */}
        <div className="drawer-top">
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Brand name — tappable, navigates home */}
        <button className="drawer-brand" onClick={handleDrawerBrandClick}>
          Marvi<span>kala</span>
        </button>

        {/* Nav items */}
        <nav className="drawer-nav">
          {[
            { label: 'Shop All',    action: () => { setDrawerOpen(false); navigate('/shop'); } },
            { label: 'Collections', action: () => goToSection('collections') },
            { label: 'Our Story',   action: () => { setDrawerOpen(false); navigate('/our-story'); } },
            { label: 'Workshops',   action: () => goToSection('contact') },
            { label: 'Contact Us',  action: () => { setDrawerOpen(false); navigate('/contact'); } },
            { label: 'FAQs',        action: () => goToSection('contact') },
          ].map(({ label, action }) => (
            <button key={label} className="drawer-nav-item" onClick={action}>
              <span className="drawer-nav-label">{label}</span>
              <span className="drawer-nav-arrow">→</span>
            </button>
          ))}
        </nav>

        {/* Social icons */}
        <div className="drawer-social">
          <a href="https://instagram.com/marvikala" target="_blank" rel="noreferrer"
            aria-label="Instagram" className="drawer-social-link drawer-ig">
            <IgIcon size={24} />
          </a>
          <a href="https://wa.me/919769238160" target="_blank" rel="noreferrer"
            aria-label="WhatsApp" className="drawer-social-link drawer-wa">
            <WaIcon size={24} />
          </a>
        </div>

        {/* Drawer footer */}
        <div className="drawer-footer">
          <p className="drawer-copyright">© 2025 Marvikala. All rights reserved.</p>
          <div className="drawer-footer-links">
            <button className="drawer-footer-link">Privacy Policy</button>
            <span className="drawer-footer-sep">·</span>
            <button className="drawer-footer-link">Terms & Conditions</button>
          </div>
        </div>

      </div>
    </>
  );
}
