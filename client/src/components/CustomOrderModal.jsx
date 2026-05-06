export default function CustomOrderModal({ onClose }) {
  const waMsg = encodeURIComponent("Hi! I'd like to place a custom crochet order.");

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-emoji">✨</div>
        <h3>Custom Order</h3>
        <p>
          Tell us your idea — colour, size, design — and we'll create something
          special, handmade just for you!
        </p>
        <div className="modal-btns">
          <a
            href={`https://wa.me/919769238160?text=${waMsg}`}
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
            <span>Instagram @marvikala</span>
          </a>
        </div>
        <button className="modal-close" onClick={onClose}>✕ Close</button>
      </div>
    </div>
  );
}
