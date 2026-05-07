import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFound() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    document.title = 'Page Not Found — Marvikala';

    const timer  = setInterval(() => setCountdown(c => c - 1), 1000);
    const redir  = setTimeout(() => navigate('/', { replace: true }), 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redir);
    };
  }, []);

  return (
    <>
      <Navbar searchQuery="" onSearch={() => {}} />

      <div className="notfound-page">
        <div className="notfound-card">
          <div className="notfound-emoji">🧶</div>

          <div className="notfound-code">404</div>

          <h1 className="notfound-title">Page Not Found</h1>
          <p className="notfound-desc">
            Oops! This page got tangled up somewhere.<br />
            We couldn't find what you're looking for.
          </p>

          <div className="notfound-countdown">
            Redirecting you home in <span>{countdown}</span> second{countdown !== 1 ? 's' : ''}…
          </div>

          <button className="btn-gradient notfound-btn" onClick={() => navigate('/', { replace: true })}>
            Take me home 🏠
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}
