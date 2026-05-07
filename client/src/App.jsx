import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Scroll to top on PUSH/REPLACE; restore saved position on POP (back button)
function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    if (navType === 'POP') {
      // Restore wherever the user was on this page before they navigated away
      const saved = sessionStorage.getItem(`mk_scroll_${pathname}`);
      if (saved) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: parseInt(saved, 10), behavior: 'instant' });
        });
      }
    } else {
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
      </Routes>
    </BrowserRouter>
  );
}
