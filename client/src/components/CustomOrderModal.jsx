import { useState, useEffect } from 'react';

export default function CustomOrderModal({ onClose }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const waMsg = encodeURIComponent("Hi! I'd like to place a custom crochet order.");

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 230);
  }

  return (
    <div
      className={`modal-overlay${closing ? ' closing' : ''}`}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={`modal${closing ? ' closing' : ''}`}>
        <div className="modal-emoji">✨</div>
        <h3>Custom Order</h3>
        <p>
          Tell us your idea — colour, size, design — and we'll create something
          special, handmade just for you!
        </p>
        <div className="modal-btns">
          <a
            href={`https://wa.me/918767797815?text=${waMsg}`}
            className="modal-btn modal-wa"
            target="_blank"
            rel="noreferrer"
          >
            <span>📱</span>
            <span>WhatsApp Us</span>
          </a>
          <a
            href="https://instagram.com/marvikala"
            className="modal-btn modal-ig"
            target="_blank"
            rel="noreferrer"
          >
            <span>📸</span>
            <span>@marvikala on Instagram</span>
          </a>
        </div>
        <button className="modal-close" onClick={handleClose}>✕ Close</button>
      </div>
    </div>
  );
}
