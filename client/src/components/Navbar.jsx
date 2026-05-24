import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CAT_LABEL = {
  flowers: 'Flowers', keychains: 'Keychains', bookmarks: 'Bookmarks',
  laddugopaldress: 'Laddu Gopal', homedecor: 'Home Decor',
  hairaccessories: 'Hair Accessories', jewellery: 'Jewellery',
  rakhi: 'Rakhi', custom: 'Custom',
};

function slugify(name) {
  return name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

function imgUrl(src) {
  if (!src) return null;
  return src.startsWith('http') ? src : `/uploads/${src}`;
}

function getCachedProducts() {
  try { const c = sessionStorage.getItem('mk_products'); return c ? JSON.parse(c) : []; }
  catch { return []; }
}

export default function Navbar({ searchQuery = '', onSearch }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // localQuery drives the input — independent of parent so search works on every page
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const panelRef     = useRef();
  const inputRef     = useRef();
  const navRef       = useRef();
  const blurTimeout  = useRef();

  const navigate  = useNavigate();
  const location  = useLocation();
  const isHome    = location.pathname === '/';
  const { cartCount } = useCart();
  const [scrolled, setScrolled] = useState(false);

  // Products for suggestions (from sessionStorage cache)
  const [allProducts, setAllProducts] = useState(getCachedProducts);
  useEffect(() => {
    const cached = getCachedProducts();
    if (cached.length > 0) setAllProducts(cached);
  }, [searchOpen]);

  // New arrivals shown when search is empty
  const newArrivals = useMemo(() => {
    return allProducts.filter(p => p.newArrival).slice(0, 5);
  }, [allProducts]);

  // Sync: when parent clears search (e.g. Home "Clear search" btn), clear local too
  useEffect(() => {
    if (!searchQuery && localQuery) setLocalQuery('');
  }, [searchQuery]); // eslint-disable-line

  // Filtered suggestions shown when typing
  const suggestions = useMemo(() => {
    const q = localQuery.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return allProducts
      .filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || CAT_LABEL[p.category]?.toLowerCase().includes(q))
      .slice(0, 6);
  }, [localQuery, allProducts]);

  const hasQuery        = localQuery.trim().length >= 2;
  const showSuggestions = searchOpen && hasQuery && suggestions.length > 0;
  const showNewArrivals = searchOpen && !hasQuery && newArrivals.length > 0;
  const showDropdown    = showSuggestions || showNewArrivals;

  // Lock body scroll when search or drawer is open
  useEffect(() => {
    const locked = drawerOpen || searchOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen, searchOpen]);

  // Close search when page scrolls (e.g. rubber-band on iOS) — swipe-to-close removed
  // so the panel can only be dismissed via Cancel or tapping outside.
  const scrollAtOpen = useRef(0);
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
      if (!searchOpen) return;
      const diff = Math.abs(window.scrollY - scrollAtOpen.current);
      if (diff > 40) setSearchOpen(false);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [searchOpen]);

  // Hide panel on outside click
  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => {
      function handleOutside(e) {
        if (panelRef.current?.contains(e.target)) return;
        if (navRef.current?.contains(e.target)) return;
        hideSearch();
      }
      document.addEventListener('pointerdown', handleOutside);
      return () => document.removeEventListener('pointerdown', handleOutside);
    }, 50);
    return () => clearTimeout(t);
  }, [searchOpen]);

  // Auto-focus from ProductPage search intent
  useEffect(() => {
    let should;
    try { should = sessionStorage.getItem('mk_focus_search'); } catch {}
    if (!should) return;
    try { sessionStorage.removeItem('mk_focus_search'); } catch {}
    setSearchOpen(true);
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (searchQuery) setSearchOpen(true);
  }, [searchQuery]);

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

  function animateOutThenGo(destination) {
    if (location.pathname === destination) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const productPage = document.querySelector('.product-page');
    if (productPage) { productPage.classList.add('pp-exit'); setTimeout(() => navigate(destination), 260); return; }
    const pageWrapper = document.querySelector('.sa-page') || document.querySelector('.story-page-wrapper') || document.querySelector('.contact-page-wrapper');
    if (pageWrapper) { pageWrapper.classList.add('page-exiting'); setTimeout(() => navigate(destination), 230); return; }
    navigate(destination);
  }

  function handleLogoClick(e) {
    e.preventDefault();
    setDrawerOpen(false);
    onSearch?.('');
    if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' });
    else animateOutThenGo('/');
  }

  function handleHomeClick(e) {
    e.preventDefault();
    setDrawerOpen(false);
    onSearch?.('');
    if (isHome) window.scrollTo({ top: 0, behavior: 'smooth' });
    else animateOutThenGo('/');
  }

  function handleDrawerBrandClick() {
    setDrawerOpen(false);
    onSearch?.('');
    if (isHome) setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 120);
    else setTimeout(() => animateOutThenGo('/'), 340);
  }

  function handleSearchSubmit(e) { e.preventDefault(); }

  function openSearch() {
    scrollAtOpen.current = window.scrollY;
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  function closeSearch() {
    setSearchOpen(false);
    setLocalQuery('');
    onSearch?.('');
  }

  function hideSearch() {
    setSearchOpen(false);
  }

  function handleSuggestionClick(product) {
    clearTimeout(blurTimeout.current);
    setSearchOpen(false);
    setLocalQuery('');
    onSearch?.(''); // clear query so panel doesn't reopen
    navigate(`/product/${slugify(product.name)}`, { state: { product } });
  }

  // ── Icons ──────────────────────────────────────────────────────────
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

  const SearchIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );

  const CartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );

  const CloseIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  return (
    <>
      <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`} ref={navRef}>
        {/* LEFT: Hamburger (mobile) */}
        <button
          className={`hamburger navbar-hamburger-btn${drawerOpen ? ' open' : ''}`}
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>

        {/* CENTER: Logo */}
        <a href="/" className="navbar-logo" onClick={handleLogoClick}>
          <img src="/logo-new.png" alt="Marvikala" className="navbar-logo-img" />
        </a>

        {/* Desktop Nav links */}
        <ul className="navbar-links navbar-links-desktop">
          <li><a href="/" onClick={handleHomeClick}>Home</a></li>
          <li><a href="#products" onClick={(e) => { e.preventDefault(); goToSection('products'); }}>Shop</a></li>
          <li><a href="/collections" onClick={(e) => { e.preventDefault(); animateOutThenGo('/collections'); }}>Collections</a></li>
          <li><a href="/our-story" onClick={(e) => { e.preventDefault(); navigate('/our-story'); }}>Our Story</a></li>
          <li><a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }} className="navbar-cta">Contact</a></li>
        </ul>

        {/* RIGHT: Icons */}
        <div className="navbar-right-group">
          {/* Desktop search icon */}
          <button onClick={searchOpen ? closeSearch : openSearch} aria-label={searchOpen ? 'Close search' : 'Search'} className="navbar-icon-btn navbar-desktop-only">
            {searchOpen ? <CloseIcon size={18} /> : <SearchIcon />}
          </button>

          <div className="navbar-mobile-icons">
            <button
              className={`navbar-icon-btn navbar-search-toggle${searchOpen ? ' active' : ''}`}
              onClick={searchOpen ? closeSearch : openSearch}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
            >
              {searchOpen ? <CloseIcon size={18} /> : <SearchIcon size={18} />}
            </button>
            <button
              className="navbar-icon-btn navbar-cart-btn"
              aria-label="Cart"
              onClick={() => animateOutThenGo('/cart')}
              style={{ position: 'relative' }}
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="navbar-cart-badge" key={cartCount}>{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* SEARCH BACKDROP — dims page behind the panel */}
      {searchOpen && (
        <div className="search-backdrop" onClick={closeSearch} aria-hidden="true" />
      )}

      {/* UNIVERSAL SEARCH PANEL */}
      <div
        ref={panelRef}
        className={`mobile-search-panel${searchOpen ? ' open' : ''}`}
        role="search"
        aria-label="Search products"
      >
        {/* Input row */}
        <div className="msp-input-row">
          <div className="msp-input-wrap">
            <span className="msp-icon" aria-hidden="true">
              <SearchIcon size={16} />
            </span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={localQuery}
              onChange={(e) => { setLocalQuery(e.target.value); onSearch?.(e.target.value); }}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              onBlur={() => {
                blurTimeout.current = setTimeout(() => setSearchOpen(false), 150);
              }}
              className="msp-input"
              aria-label="Search"
              autoComplete="off"
              autoCorrect="off"
            />
            {localQuery ? (
              <button
                className="msp-clear"
                onMouseDown={() => clearTimeout(blurTimeout.current)}
                onClick={() => { setLocalQuery(''); onSearch?.(''); inputRef.current?.focus(); }}
                aria-label="Clear search"
              >
                <CloseIcon size={11} />
              </button>
            ) : null}
          </div>
          <button className="msp-close" onClick={closeSearch} aria-label="Close search">
            Cancel
          </button>
        </div>

        {/* NEW ARRIVALS — shown when query is empty */}
        {showNewArrivals && (
          <div
            className="msp-suggestions"
            role="listbox"
            aria-label="New Arrivals"
            onMouseDown={() => clearTimeout(blurTimeout.current)}
            onTouchStart={() => clearTimeout(blurTimeout.current)}
          >
            <div className="msp-section-label">✨ New Arrivals</div>
            {newArrivals.map((p, i) => {
              const imgs = p.images?.length > 0 ? p.images : (p.image ? [p.image] : []);
              const src = imgs[0] ? imgUrl(imgs[0]) : null;
              return (
                <button
                  key={p._id}
                  className="msp-suggestion-item"
                  onClick={() => handleSuggestionClick(p)}
                  role="option"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="msp-suggestion-img">
                    {src
                      ? <img src={src} alt={p.name} loading="lazy" />
                      : <span className="msp-suggestion-placeholder">🧶</span>
                    }
                  </div>
                  <div className="msp-suggestion-info">
                    <span className="msp-suggestion-cat">{CAT_LABEL[p.category] || p.category}</span>
                    <span className="msp-suggestion-name">{p.name}</span>
                    {p.price && (
                      <span className="msp-suggestion-price">
                        ₹{p.price}
                        {p.originalPrice && <span className="msp-suggestion-orig">₹{p.originalPrice}</span>}
                      </span>
                    )}
                  </div>
                  <span className="msp-suggestion-arrow" aria-hidden="true">→</span>
                </button>
              );
            })}
          </div>
        )}

        {/* SEARCH RESULTS — shown when typing */}
        {showSuggestions && (
          <div
            className="msp-suggestions"
            role="listbox"
            aria-label="Search suggestions"
            onMouseDown={() => clearTimeout(blurTimeout.current)}
            onTouchStart={() => clearTimeout(blurTimeout.current)}
          >
            {suggestions.map((p, i) => {
              const imgs = p.images?.length > 0 ? p.images : (p.image ? [p.image] : []);
              const src = imgs[0] ? imgUrl(imgs[0]) : null;
              return (
                <button
                  key={p._id}
                  className="msp-suggestion-item"
                  onClick={() => handleSuggestionClick(p)}
                  role="option"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="msp-suggestion-img">
                    {src
                      ? <img src={src} alt={p.name} loading="lazy" />
                      : <span className="msp-suggestion-placeholder">🧶</span>
                    }
                  </div>
                  <div className="msp-suggestion-info">
                    <span className="msp-suggestion-cat">{CAT_LABEL[p.category] || p.category}</span>
                    <span className="msp-suggestion-name">{p.name}</span>
                    {p.price && (
                      <span className="msp-suggestion-price">
                        ₹{p.price}
                        {p.originalPrice && <span className="msp-suggestion-orig">₹{p.originalPrice}</span>}
                      </span>
                    )}
                  </div>
                  <span className="msp-suggestion-arrow" aria-hidden="true">→</span>
                </button>
              );
            })}
            <button
              className="msp-see-all"
              onMouseDown={() => clearTimeout(blurTimeout.current)}
              onClick={() => { hideSearch(); }}
            >
              See all results for "<strong>{localQuery}</strong>"
            </button>
          </div>
        )}

        {/* No results state */}
        {searchOpen && hasQuery && suggestions.length === 0 && (
          <div
            className="msp-suggestions"
            onMouseDown={() => clearTimeout(blurTimeout.current)}
            onTouchStart={() => clearTimeout(blurTimeout.current)}
          >
            <div className="msp-no-results">
              <span className="msp-no-results-emoji">🔍</span>
              <span>No results for "<strong>{localQuery}</strong>"</span>
            </div>
          </div>
        )}
      </div>

      {/* DRAWER OVERLAY */}
      <div
        className={`drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* SLIDE-OUT DRAWER */}
      <div className={`drawer${drawerOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Navigation menu">

        <div className="drawer-top">
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <CloseIcon size={20} />
          </button>
        </div>

        <button className="drawer-brand" onClick={handleDrawerBrandClick}>
          <img src="/logo-new.png" alt="Marvikala" className="drawer-brand-logo" />
        </button>

        <nav className="drawer-nav">
          {[
            { label: 'Shop All',    action: () => { setDrawerOpen(false); navigate('/shop'); } },
            { label: 'Collections', action: () => { setDrawerOpen(false); navigate('/collections'); } },
            { label: 'Our Story',   action: () => { setDrawerOpen(false); navigate('/our-story'); } },
            { label: 'Workshops',   action: () => { setDrawerOpen(false); navigate('/workshops'); } },
            { label: 'Contact Us',  action: () => { setDrawerOpen(false); navigate('/contact'); } },
            { label: 'FAQs',        action: () => { setDrawerOpen(false); navigate('/faq'); } },
          ].map(({ label, action }) => (
            <button key={label} className="drawer-nav-item" onClick={action}>
              <span className="drawer-nav-label">{label}</span>
              <span className="drawer-nav-arrow">→</span>
            </button>
          ))}
        </nav>

        <div className="drawer-social">
          <a href="https://instagram.com/marvikala_" target="_blank" rel="noreferrer"
            aria-label="Instagram" className="drawer-social-link drawer-ig">
            <IgIcon size={24} />
          </a>
          <a href="https://wa.me/918767797815" target="_blank" rel="noreferrer"
            aria-label="WhatsApp" className="drawer-social-link drawer-wa">
            <WaIcon size={24} />
          </a>
          <a href="mailto:marvikala.shop@gmail.com"
            aria-label="Email" className="drawer-social-link drawer-email">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <polyline points="2,4 12,13 22,4"/>
            </svg>
          </a>
        </div>

        <div className="drawer-footer">
          <p className="drawer-copyright">© {new Date().getFullYear()} Marvikala. All rights reserved.</p>
          <div className="drawer-footer-links">
            <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/privacy'); }}>Privacy Policy</button>
            <span className="drawer-footer-sep">·</span>
            <button className="drawer-footer-link" onClick={() => { setDrawerOpen(false); navigate('/shipping'); }}>Shipping & Returns</button>
          </div>
        </div>
      </div>
    </>
  );
}
