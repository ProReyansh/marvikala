import { useNavigate } from 'react-router-dom';

/**
 * Shared back-navigation row used on all sub-pages.
 * Only "← Back" triggers navigation; the page name is a non-clickable label.
 */
export default function BackButton({ pageName }) {
  const navigate = useNavigate();
  return (
    <div className="sa-back-nav">
      <button className="sa-back-btn" onClick={() => navigate(-1)}>← Back</button>
      <span className="sa-back-sep">/</span>
      <span className="sa-back-page">{pageName}</span>
    </div>
  );
}
