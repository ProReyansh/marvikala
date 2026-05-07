import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EnquireModal from '../components/EnquireModal';

const CAT_LABEL = {
  flowers: 'Flowers', keychains: 'Keychains', bookmarks: 'Bookmarks',
  laddugopaldress: 'Laddu Gopal', homedecor: 'Home Decor',
  hairaccessories: 'Hair Accessories', jewellery: 'Jewellery',
  rakhi: 'Rakhi', custom: 'Custom',
};

function imgUrl(src) {
  if (!src) return '';
  return src.startsWith('http') ? src : `/uploads/${src}`;
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeImg, setActiveImg]   = useState(0);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(res => { setProduct(res.data); document.title = `${res.data.name} — Marvikala`; })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <Navbar searchQuery={searchQuery} onSearch={setSearchQuery} />
      <div className="spinner-wrap" style={{ minHeight: '60vh' }}><div className="spinner" /></div>
      <Footer />
    </>
  );

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);

  return (
    <>
      <Navbar searchQuery={searchQuery} onSearch={setSearchQuery} />

      <div className="product-page">
        <button className="product-page-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="product-page-layout">

          {/* Image Gallery */}
          <div className="product-page-gallery">
            <div className="product-page-main-img">
              {images.length > 0
                ? <img src={imgUrl(images[activeImg])} alt={product.name} />
                : <span className="product-page-placeholder">🧶</span>
              }
              {product.bestseller && <span className="product-page-badge bestseller-badge">🏆 Bestseller</span>}
              {!product.inStock && <div className="product-page-oos-overlay">Out of Stock</div>}
            </div>

            {images.length > 1 && (
              <div className="product-page-thumbs">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`product-page-thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={imgUrl(img)} alt={`${product.name} ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-page-info">
            <div className="product-page-cat">{CAT_LABEL[product.category] || product.category}</div>
            <h1 className="product-page-name">{product.name}</h1>

            <div className={`product-page-stock ${product.inStock ? 'in' : 'out'}`}>
              {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
            </div>

            {product.description && (
              <p className="product-page-desc">{product.description}</p>
            )}

            <div className="product-page-divider" />

            {product.inStock ? (
              <>
                <p className="product-page-cta">Interested? Contact us to place your order!</p>
                <div className="product-page-btns">
                  <a
                    href={`https://wa.me/919769238160?text=Hi! I'm interested in: ${encodeURIComponent(product.name)}`}
                    className="product-page-btn btn-wa"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>📱</span> Chat on WhatsApp
                  </a>
                  <a
                    href="https://instagram.com/marvikala"
                    className="product-page-btn btn-ig"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>📸</span> DM on Instagram
                  </a>
                </div>
                <button className="product-page-enquire" onClick={() => setEnquireOpen(true)}>
                  Enquire Now
                </button>
              </>
            ) : (
              <div className="product-page-oos-msg">
                This product is currently out of stock. Follow us on Instagram to be notified when it's back!
                <a href="https://instagram.com/marvikala" className="product-page-btn btn-ig" target="_blank" rel="noreferrer" style={{ marginTop: 14 }}>
                  <span>📸</span> @marvikala on Instagram
                </a>
              </div>
            )}

            <div className="product-page-divider" />

            <div className="product-page-contact-row">
              <a href="https://wa.me/919769238160" className="product-page-contact-link wa" target="_blank" rel="noreferrer">📱 +91 97692 38160</a>
              <a href="https://instagram.com/marvikala" className="product-page-contact-link ig" target="_blank" rel="noreferrer">📸 @marvikala</a>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {enquireOpen && (
        <EnquireModal product={product} onClose={() => setEnquireOpen(false)} />
      )}
    </>
  );
}
