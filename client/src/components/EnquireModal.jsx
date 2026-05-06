import { useState } from 'react';

export default function EnquireModal({ product, onClose }) {
  const [closing, setClosing] = useState(false);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 230);
  }

  if (!product) return null;

  return (
    <div
      className={`modal-overlay${closing ? ' closing' : ''}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`modal${closing ? ' closing' : ''}`}>
        <div className="modal-emoji">🛍️</div>
        <h3>Love this product?</h3>
        <p>
          Reach out to us on WhatsApp or Instagram — we'll help you place your
          order for <strong>{product.name}</strong>!
        </p>
        <div className="modal-btns">
          <a
            href={`https://wa.me/919769238160?text=Hi! I'm interested in: ${encodeURIComponent(product.name)}`}
            className="modal-btn modal-wa"
            target="_blank"
            rel="noreferrer"
          >
            <span>📱</span> Chat on WhatsApp
          </a>
          <a
            href="https://instagram.com/marvikala"
            className="modal-btn modal-ig"
            target="_blank"
            rel="noreferrer"
          >
            <span>📸</span> DM on Instagram
          </a>
        </div>
        <button className="modal-close" onClick={handleClose}>✕ Close</button>
      </div>
    </div>
  );
}
