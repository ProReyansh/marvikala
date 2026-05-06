import { useState } from 'react';

const CAT_LABEL = {
  flowers: 'Flowers', keychains: 'Keychains', bookmarks: 'Bookmarks',
  laddugopaldress: 'Laddu Gopal', homedecor: 'Home Decor',
  hairaccessories: 'Hair Accessories', jewellery: 'Jewellery',
  rakhi: 'Rakhi', custom: 'Custom',
};

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
      <div className={`product-modal${closing ? ' closing' : ''}`}>

        {/* Image */}
        <div className="product-modal-img">
          {product.image
            ? <img src={product.image.startsWith('http') ? product.image : `/uploads/${product.image}`} alt={product.name} />
            : <span>🧶</span>
          }
          {product.featured && <span className="product-modal-badge">⭐ Featured</span>}
          {!product.inStock && <div className="product-modal-oos">Out of Stock</div>}
        </div>

        {/* Info */}
        <div className="product-modal-body">
          <div className="product-modal-cat">{CAT_LABEL[product.category] || product.category}</div>
          <h2 className="product-modal-name">{product.name}</h2>
          {product.description && (
            <p className="product-modal-desc">{product.description}</p>
          )}

          {product.inStock ? (
            <>
              <p className="product-modal-cta-text">Interested? Reach out to us to place your order!</p>
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
            </>
          ) : (
            <div className="product-modal-oos-msg">
              This product is currently out of stock. DM us on Instagram to be notified when it's back!
              <a href="https://instagram.com/marvikala" className="modal-btn modal-ig" target="_blank" rel="noreferrer" style={{ marginTop: 14, display: 'flex' }}>
                <span>📸</span> @marvikala on Instagram
              </a>
            </div>
          )}

          <button className="modal-close" onClick={handleClose}>✕ Close</button>
        </div>

      </div>
    </div>
  );
}
