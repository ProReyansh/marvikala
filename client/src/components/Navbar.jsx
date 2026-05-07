import { useState, useRef } from 'react';

export default function Navbar({ searchQuery, onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef();

  function scrollTo(id) {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    inputRef.current?.blur();
  }

  return (
    <nav className="navbar">
      <a href="/" className="navbar-logo" onClick={() => onSearch?.('')}>
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
          <a href="/" onClick={(e) => { e.preventDefault(); setMenuOpen(false); onSearch?.(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            Home
          </a>
        </li>
        <li><a href="#products"    onClick={(e) => { e.preventDefault(); scrollTo('products'); }}>Products</a></li>
        <li><a href="#bestsellers" onClick={(e) => { e.preventDefault(); scrollTo('bestsellers'); }}>Bestsellers</a></li>
        <li><a href="#custom"      onClick={(e) => { e.preventDefault(); scrollTo('custom'); }}>Custom Order</a></li>
        <li><a href="#about"       onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>Our Story</a></li>
        <li><a href="#contact"     onClick={(e) => { e.preventDefault(); scrollTo('contact'); }} className="navbar-cta">Contact Us</a></li>
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
