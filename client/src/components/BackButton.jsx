import { useNavigate } from 'react-router-dom';

/**
 * Shared back-navigation row used on all sub-pages.
 * "Home" always navigates to "/".
 * Optional parentName + parentPath adds a middle crumb (e.g. "Collections" → /collections).
 */
export default function BackButton({ pageName, parentName, parentPath }) {
  const navigate = useNavigate();
  return (
    <div className="sa-back-nav">
      <button className="sa-back-btn" onClick={() => navigate('/')}>Home</button>
      {parentName && parentPath && (
        <>
          <span className="sa-back-sep">/</span>
          <button className="sa-back-btn" onClick={() => navigate(parentPath)}>{parentName}</button>
        </>
      )}
      <span className="sa-back-sep">/</span>
      <span className="sa-back-page">{pageName}</span>
    </div>
  );
}
