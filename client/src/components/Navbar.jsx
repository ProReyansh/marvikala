import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ searchQuery, onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  // When arriving from ProductPage search, auto-focus the input so the user
  // can keep typing without having to click the search bar again.
  // Reads a sessionStorage flag (cleared immediately) so reload never re-focuses.
  useEffect(() => {
    let should;
    try { should = sessionStorage.getItem('mk_focus_search'); } catch {}
    if (!should) return;
    try { sessionStorage.removeItem('mk_focus_search'); } catch {}
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

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

  return (
    <nav className="navbar">
      <a href="/" className="navbar-logo" onClick={handleLogoClick}>
        <img src="/logo.jpg" alt="Marvikala" className="navbar-logo-icon" />
        <span className="navbar-logo-text">Marvi<span>kala</span></span>
      </a>

      {/* Search bar — always visible on all screen sizes */}
      <form className="navbar-search" onSubmit={handleSearchSubmit}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search crochet products…"
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
          <button type="submit" className="search-btn search-btn-icon" aria-label="Search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        )}
      </form>

      <ul className={`navbar-links${menuOpen ? ' open' : ''}`}>
        <li>
          <a href="/" onClick={handleHomeClick}>Home</a>
        </li>
        <li><a href="#products"    onClick={(e) => { e.preventDefault(); goToSection('products'); }}>Products</a></li>
        <li><a href="#bestsellers" onClick={(e) => { e.preventDefault(); goToSection('bestsellers'); }}>Bestsellers</a></li>
        <li><a href="#custom"      onClick={(e) => { e.preventDefault(); goToSection('custom'); }}>Custom Order</a></li>
        <li><a href="#about"       onClick={(e) => { e.preventDefault(); goToSection('about'); }}>Our Story</a></li>
        <li><a href="#contact"     onClick={(e) => { e.preventDefault(); goToSection('contact'); }} className="navbar-cta">Contact Us</a></li>
      </ul>

      {/* Hamburger — only visible on mobile via .navbar-mobile-icons */}
      <div className="navbar-mobile-icons">
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
