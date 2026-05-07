import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ searchQuery, onSearch }) {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(() => {
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

  // If already on home: smooth-scroll to the section.
  // If in search mode: clear search first, then scroll.
  // If on another page: navigate home and let Home.jsx scroll after render.
  function goToSection(id) {
    setMenuOpen(false);
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
    setMenuOpen(false);
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
    setMenuOpen(false);
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

  const SearchBar = (
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
  );

  return (
    <nav className="navbar">
      {/* Logo */}
      <a href="/" className="navbar-logo" onClick={handleLogoClick}>
        <img src="/logo.jpg" alt="Marvikala" className="navbar-logo-icon" />
        <span className="navbar-logo-text">Marvi<span>kala</span></span>
      </a>

      {/* Desktop search bar — inline, center-flex when open */}
      {searchOpen && (
        <div style={{ flex: 1, maxWidth: 380, display: 'flex' }} className="navbar-search-wrap-desktop">
          {SearchBar}
        </div>
      )}

      {/* Nav links */}
      <ul className={`navbar-links${menuOpen ? ' open' : ''}`}>
        <li>
          <a href="/" onClick={handleHomeClick}>Home</a>
        </li>
        <li>
          <a href="#products"    onClick={(e) => { e.preventDefault(); goToSection('products'); }}>Shop</a>
        </li>
        <li>
          <a href="#products"    onClick={(e) => { e.preventDefault(); goToSection('products'); }}>Collections</a>
        </li>
        <li>
          <a href="#about"       onClick={(e) => { e.preventDefault(); goToSection('about'); }}>Our Story</a>
        </li>
        <li>
          <a href="#contact"     onClick={(e) => { e.preventDefault(); goToSection('contact'); }} className="navbar-cta">Contact</a>
        </li>
      </ul>

      {/* Right: search icon toggle + hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {/* Search toggle icon — desktop */}
        {!searchOpen && (
          <button
            onClick={openSearch}
            aria-label="Search"
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
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        )}

        {/* Mobile icons wrapper */}
        <div className="navbar-mobile-icons">
          <button
            onClick={searchOpen ? closeSearch : openSearch}
            aria-label="Search"
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
            }}
          >
            {searchOpen ? (
              <span style={{ fontSize: 14, fontWeight: 600 }}>✕</span>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
          </button>
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile second-row search bar */}
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
  );
}
