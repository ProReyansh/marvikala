import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// Scroll to top on forward navigation and reload.
// Restore saved scroll position only on genuine back/forward navigation (POP).
function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    // Performance API distinguishes a reload (type='reload') from a back/forward POP
    const perfType = performance.getEntriesByType?.('navigation')?.[0]?.type;
    const isReload = perfType === 'reload';

    if (isReload || navType !== 'POP') {
      // Reload or forward navigation — always go to top
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      // Genuine back/forward — restore where the user was
      const saved = sessionStorage.getItem(`mk_scroll_${pathname}`);
      if (saved) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: parseInt(saved, 10), behavior: 'instant' });
        });
      }
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
