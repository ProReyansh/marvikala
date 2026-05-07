import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// Module-level flag — false on every fresh page load/reload (JS module re-executes),
// true after the first SPA navigation happens. This reliably tells us whether a POP
// is a genuine back-button press (restore scroll) vs the initial page load (go to top).
// The Performance API approach had a bug: perfType stays 'reload' for the whole SPA
// session if the page was originally loaded via refresh, causing back-nav to wrongly
// scroll to top.
let _appNavigated = false;

function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    if (!_appNavigated) {
      // Very first render after any page load or reload — always go to top
      _appNavigated = true;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }

    if (navType === 'POP') {
      // Genuine SPA back/forward — restore saved scroll position
      const saved = sessionStorage.getItem(`mk_scroll_${pathname}`);
      if (saved) {
        // Double rAF: first ensures React has committed, second ensures browser has painted
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({ top: parseInt(saved, 10), behavior: 'instant' });
          });
        });
      }
    } else {
      // PUSH or REPLACE — always go to top
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);
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
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:slug" element={<ProductPage />} />
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
    </BrowserRouter>
  );
}
