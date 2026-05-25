import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import OurStoryPage from './pages/OurStoryPage';
import AllBestsellersPage from './pages/AllBestsellersPage';
import ShopAllPage from './pages/ShopAllPage';
import ContactPage from './pages/ContactPage';
import CollectionPage from './pages/CollectionPage';
import CollectionsPage from './pages/CollectionsPage';
import CartPage from './pages/CartPage';
import FAQPage from './pages/FAQPage';
import WorkshopsPage from './pages/WorkshopsPage';
import PrivacyPage from './pages/PrivacyPage';
import ShippingPage from './pages/ShippingPage';
import HowToOrderPage from './pages/HowToOrderPage';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import FloatingWhatsApp from './components/FloatingWhatsApp';

// Module-level flag — false on every fresh page load/reload (JS module re-executes),
// true after the first SPA navigation happens. This reliably tells us whether a POP
// is a genuine back-button press (restore scroll) vs the initial page load (go to top).
// The Performance API approach had a bug: perfType stays 'reload' for the whole SPA
// session if the page was originally loaded via refresh, causing back-nav to wrongly
// scroll to top.
let _appNavigated = false;
let _scrollRetryTimer = null;

function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  // Continuously save scroll position for the current page while the user scrolls.
  // This is the only reliable way to capture it — reading window.scrollY inside a
  // navigation effect is too late (the browser may have already reset the position).
  useEffect(() => {
    let rafId = null;
    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        try { sessionStorage.setItem(`mk_scroll_${pathname}`, String(window.scrollY)); } catch {}
        rafId = null;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  // On route change: fade out → scroll → fade in, so the position jump is never visible.
  useEffect(() => {
    if (!_appNavigated) {
      _appNavigated = true;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }

    // Hide instantly (no transition) so no flash of wrong content
    document.body.style.transition = 'none';
    document.body.style.opacity = '0';

    // Scroll while hidden, then fade in smoothly
    clearTimeout(_scrollRetryTimer);
    requestAnimationFrame(() => {
      if (navType === 'POP') {
        const saved = sessionStorage.getItem(`mk_scroll_${pathname}`);
        const targetY = saved ? parseInt(saved, 10) : 0;
        window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
        // Re-apply after content finishes rendering (corrects scroll clamping during skeleton phase)
        if (targetY > 0) {
          _scrollRetryTimer = setTimeout(() => {
            window.scrollTo({ top: targetY, left: 0, behavior: 'instant' });
          }, 400);
        }
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      // Fade in after scroll is applied
      requestAnimationFrame(() => {
        document.body.style.transition = 'opacity 0.18s ease';
        document.body.style.opacity = '1';
      });
    });
  }, [pathname, navType]);

  return null;
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('marvikala_admin_token');
  if (!token) {
    window.location.href = '/admin/login';
    return null;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ToastProvider>
        <ScrollToTop />
        <FloatingWhatsApp />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/our-story" element={<OurStoryPage />} />
          <Route path="/bestsellers" element={<AllBestsellersPage />} />
          <Route path="/shop" element={<ShopAllPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collection/:category" element={<CollectionPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/workshops" element={<WorkshopsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/how-to-order" element={<HowToOrderPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Catch-all — any unknown URL gets the 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ToastProvider>
      </CartProvider>
    </BrowserRouter>
  );
}
