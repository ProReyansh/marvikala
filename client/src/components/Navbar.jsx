import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ searchQuery, onSearch }) {
  const [drawerOpen, setDrawerOpen]  = useState(false);
  const [searchOpen, setSearchOpen]  = useState(() => {
    // If there's a saved search, open the search bar on mount
    try { return !!sessionStorage.getItem('mk_search'); } catch { return false; }
  });
  const inputRef  = useRef();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isHome    = location.pathname === '/';

  // When arriving from ProductPage search, auto-focus the input so the user
  // can keep typing without having to click the search bar again.
  // Reads a sessionStorage flag (cleared immediately) so reload never re-focuses.
  useEffect(() => {
    let should;
    try { should = sessionStorage.getItem('mk_focus_search'); } catch {}
    if (!should) return;
    try { sessionStorage.removeItem('mk_focus_search'); } catch {}
    setSearchOpen(true);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  // Keep search bar open if searchQuery is truthy (e.g. navigating back)
  useEffect(() => {
    if (searchQuery) setSearchOpen(true);
  }, [searchQuery]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // If already on home: smooth-scroll to the section.
  // If in search mode: clear search first, then scroll.
  // If on another page: navigate home and let Home.jsx scroll after render.
  function goToSection(id) {
    setDrawerOpen(false);
    if (isHome) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Search mode — the section isn't in the DOM yet. Clear search first.
        onSearch?.('');
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80);
      }
    } else {
      // Store in sessionStorage (not location.state) so it's one-shot: cleared on read,
      // never repeated on reload or back-navigation.
      try { sessionStorage.setItem('mk_scroll_to', id); } catch {}
      navigate('/');
    }
  }

  function handleLogoClick(e) {
    e.preventDefault();
    setDrawerOpen(false);
    onSearch?.('');
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.querySelector('.product-page')?.classList.add('pp-exit');
      setTimeout(() => navigate('/'), 250);
    }
  }

  function handleHomeClick(e) {
    e.preventDefault();
    setDrawerOpen(false);
    onSearch?.('');
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.querySelector('.product-page')?.classList.add('pp-exit');
      setTimeout(() => navigate('/'), 250);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    inputRef.current?.blur();
  }

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  function closeSearch() {
    setSearchOpen(false);
    onSearch?.('');
  }

  const WaIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );

  const IgIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="3.5"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );

  const SearchIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  return (
    <>
      <nav className="navbar">
        {/* ── MOBILE LEFT: Hamburger ── */}
        <button
          className={`hamburger navbar-hamburger-btn${drawerOpen ? ' open' : ''}`}
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>

        {/* Logo — centered on mobile via CSS, left-flex on desktop */}
        <a href="/" className="navbar-logo" onClick={handleLogoClick}>
          <img src="/logo.jpg" alt="Marvikala" className="navbar-logo-icon" />
          <span className="navbar-logo-text">Marvi<span>kala</span></span>
        </a>

        {/* Desktop search bar — inline, center-flex when open */}
        {searchOpen && (
          <div style={{ flex: 1, maxWidth: 380, display: 'flex' }} className="navbar-search-wrap-desktop">
            <form className="navbar-search" onSubmit={handleSearchSubmit}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearch?.(e.target.value)}
                className="search-input"
              />
              {searchQuery ? (
                <button
                  type="button"
                  className="search-btn search-btn-clear"
                  onClick={() => { onSearch?.(''); inputRef.current?.focus(); }}
                  aria-label="Clear search"
                >✕</button>
              ) : (
                <button
                  type="button"
                  className="search-btn search-btn-clear"
                  onClick={closeSearch}
                  aria-label="Close search"
                >✕</button>
              )}
            </form>
          </div>
        )}

        {/* Desktop Nav links */}
        <ul className="navbar-links navbar-links-desktop">
          <li>
            <a href="/" onClick={handleHomeClick}>Home</a>
          </li>
          <li>
            <a href="#products" onClick={(e) => { e.preventDefault(); goToSection('products'); }}>Shop</a>
          </li>
          <li>
            <a href="#products" onClick={(e) => { e.preventDefault(); goToSection('products'); }}>Collections</a>
          </li>
          <li>
            <a href="/our-story" onClick={(e) => { e.preventDefault(); navigate('/our-story'); }}>Our Story</a>
          </li>
          <li>
            <a href="#contact" onClick={(e) => { e.preventDefault(); goToSection('contact'); }} className="navbar-cta">Contact</a>
          </li>
        </ul>

        {/* Right icons — desktop: search toggle only; mobile: search + WA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {/* Search toggle icon — desktop only */}
          {!searchOpen && (
            <button
              onClick={openSearch}
              aria-label="Search"
              className="navbar-search-icon-btn navbar-desktop-only"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-mid)',
                borderRadius: '50%',
                flexShrink: 0,
                transition: 'color 0.15s, background 0.15s',
              }}
            >
              <SearchIcon />
            </button>
          )}

          {/* Mobile icons */}
          <div className="navbar-mobile-icons">
            <button
              className="navbar-search-btn"
              onClick={searchOpen ? closeSearch : openSearch}
              aria-label="Search"
            >
              {searchOpen ? <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-mid)' }}>✕</span> : <SearchIcon />}
            </button>
            <a
              href="https://wa.me/919769238160"
              target="_blank"
              rel="noreferrer"
              className="navbar-wa-btn"
              aria-label="WhatsApp"
            >
              <WaIcon />
            </a>
          </div>
        </div>

        {/* Mobile search overlay — slides down from navbar */}
        <div className={`navbar-search-overlay${searchOpen ? ' open' : ''}`}>
          <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </form>
        </div>

        {/* Mobile second-row search bar (legacy, kept for desktop compat) */}
        {searchOpen && (
          <div className="navbar-search-mobile-row">
            <form className="navbar-search" onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => onSearch?.(e.target.value)}
                className="search-input"
              />
              {searchQuery ? (
                <button
                  type="button"
                  className="search-btn search-btn-clear"
                  onClick={() => { onSearch?.(''); }}
                  aria-label="Clear"
                >✕</button>
              ) : (
                <button type="submit" className="search-btn search-btn-icon" aria-label="Search">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              )}
            </form>
          </div>
        )}
      </nav>

      {/* ── DRAWER OVERLAY ── */}
      <div
        className={`drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* ── SLIDE-OUT DRAWER ── */}
      <div className={`drawer${drawerOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="drawer-header">
          <span className="drawer-logo">Marvi<span style={{ color: 'var(--olive)' }}>kala</span></span>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">✕</button>
        </div>

        <nav className="drawer-nav">
          <button className="drawer-nav-item" onClick={() => { setDrawerOpen(false); onSearch?.(''); if (isHome) { window.scrollTo({ top: 0, behavior: 'smooth' }); } else { navigate('/'); } }}>
            Shop All
          </button>
          <button className="drawer-nav-item" onClick={() => goToSection('products')}>
            Collections
          </button>
          <button className="drawer-nav-item" onClick={() => { setDrawerOpen(false); navigate('/our-story'); }}>
            Our Story
          </button>
          <button className="drawer-nav-item" onClick={() => goToSection('contact')}>
            Workshops
          </button>
          <button className="drawer-nav-item" onClick={() => goToSection('contact')}>
            Contact Us
          </button>
          <button className="drawer-nav-item" onClick={() => goToSection('contact')}>
            FAQs
          </button>
        </nav>

        <div className="drawer-social">
          <a href="https://instagram.com/marvikala" target="_blank" rel="noreferrer" aria-label="Instagram" style={{ color: '#C8326B' }}>
            <IgIcon />
          </a>
          <a href="https://wa.me/919769238160" target="_blank" rel="noreferrer" aria-label="WhatsApp" style={{ color: '#25d366' }}>
            <WaIcon />
          </a>
        </div>
      </div>
    </>
  );
}
