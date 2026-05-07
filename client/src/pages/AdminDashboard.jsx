import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CATEGORIES = [
  { key: 'flowers',          label: 'Flowers' },
  { key: 'keychains',        label: 'Keychains' },
  { key: 'bookmarks',        label: 'Bookmarks' },
  { key: 'laddugopaldress',  label: 'Laddu Gopal Dress' },
  { key: 'homedecor',        label: 'Home Decor' },
  { key: 'hairaccessories',  label: 'Hair Accessories' },
  { key: 'jewellery',        label: 'Jewellery' },
  { key: 'rakhi',            label: 'Rakhi' },
  { key: 'custom',           label: 'Custom' },
];

const EMPTY_FORM = {
  name: '', description: '', category: 'flowers',
  inStock: true, bestseller: false,
  existingImages: [],
  newImageFiles: [],
};

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('marvikala_admin_token')}` };
}

export default function AdminDashboard() {
  const navigate    = useNavigate();
  const fileRef     = useRef();

  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterCat, setFilterCat]   = useState('all');
  const [modalOpen, setModalOpen]   = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  function closeModal() {
    setModalClosing(true);
    setTimeout(() => { setModalOpen(false); setModalClosing(false); document.body.style.overflow = ''; }, 230);
  }

  useEffect(() => {
    if (modalOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  async function fetchProducts() {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch {
      // token may have expired
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProducts(); document.title = 'Marvikala Admin'; }, []);

  function logout() {
    localStorage.removeItem('marvikala_admin_token');
    navigate('/admin/login');
  }

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    const imgs = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
    setForm({
      name: product.name,
      description: product.description || '',
      category: product.category,
      inStock: product.inStock,
      bestseller: product.bestseller || product.featured || false,
      existingImages: imgs,
      newImageFiles: [],
    });
    setError('');
    setModalOpen(true);
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const currentCount = form.existingImages.length + form.newImageFiles.length;
    const remaining = Math.max(0, 5 - currentCount);
    const toAdd = files.slice(0, remaining);
    setForm(f => ({ ...f, newImageFiles: [...f.newImageFiles, ...toAdd] }));
    e.target.value = '';
  }

  function removeExistingImage(idx) {
    setForm(f => ({ ...f, existingImages: f.existingImages.filter((_, i) => i !== idx) }));
  }

  function removeNewImage(idx) {
    setForm(f => ({ ...f, newImageFiles: f.newImageFiles.filter((_, i) => i !== idx) }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('description', form.description);
      data.append('category', form.category);
      data.append('inStock', form.inStock);
      data.append('bestseller', form.bestseller);

      if (editing) {
        data.append('existingImages', JSON.stringify(form.existingImages));
      }

      for (const file of form.newImageFiles) {
        data.append('images', file);
      }

      if (editing) {
        await axios.put(`/api/products/${editing._id}`, data, { headers: authHeader() });
      } else {
        await axios.post('/api/products', data, { headers: authHeader() });
      }

      closeModal();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/products/${product._id}`, { headers: authHeader() });
      fetchProducts();
    } catch {
      alert('Could not delete product.');
    }
  }

  const filtered =
    filterCat === 'all' ? products : products.filter((p) => p.category === filterCat);

  const inStockCount    = products.filter((p) => p.inStock).length;
  const bestsellerCount = products.filter((p) => p.bestseller || p.featured).length;

  const totalImages = form.existingImages.length + form.newImageFiles.length;

  return (
    <div className="admin-page">
      {/* Admin Navbar */}
      <div className="admin-navbar">
        <div className="admin-navbar-brand">
          <img src="/logo.jpg" alt="Marvikala" className="admin-logo-icon" />
          <h1>Marvi<span>kala</span> Admin</h1>
        </div>
        <div className="admin-navbar-right">
          <a href="/" target="_blank" rel="noreferrer" className="admin-view-site">
            View Site →
          </a>
          <button className="btn-add" onClick={openAdd}>+ Add Product</button>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="admin-content">
        {/* Stats */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{products.length}</div>
            <div className="stat-icon">📦</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Stock</div>
            <div className="stat-value">{inStockCount}</div>
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Out of Stock</div>
            <div className="stat-value">{products.length - inStockCount}</div>
            <div className="stat-icon">⚠️</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Bestsellers</div>
            <div className="stat-value">{bestsellerCount}</div>
            <div className="stat-icon">🏆</div>
          </div>
        </div>

        {/* Products header + filter */}
        <div className="admin-products-header">
          <h2>Products</h2>
          <select
            className="filter-select"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div className="admin-grid">
            {filtered.length === 0 ? (
              <div className="no-products" style={{ gridColumn: '1/-1' }}>
                <div className="icon">🧶</div>
                <p>No products yet. Click "+ Add Product" to get started.</p>
              </div>
            ) : (
              filtered.map((product) => {
                const imgSrc = (() => {
                  const imgs = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
                  if (!imgs[0]) return null;
                  return imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`;
                })();
                return (
                  <div key={product._id} className="admin-product-card">
                    <div className="admin-product-img">
                      {imgSrc
                        ? <img src={imgSrc} alt={product.name} />
                        : <span>🧶</span>
                      }
                      {(product.bestseller || product.featured) && (
                        <span className="bestseller-badge admin-badge">🏆 Bestseller</span>
                      )}
                      <span className={`stock-badge ${product.inStock ? 'in' : 'out'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="admin-product-info">
                      <div className="admin-product-name">{product.name}</div>
                      <div className="admin-product-cat">
                        {CATEGORIES.find((c) => c.key === product.category)?.label || product.category}
                      </div>
                      {product.description && (
                        <div className="admin-product-desc">{product.description}</div>
                      )}
                      <div className="admin-product-actions">
                        <button className="btn-edit"   onClick={() => openEdit(product)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(product)}>Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className={`admin-modal-overlay${modalClosing ? ' closing' : ''}`} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className={`admin-modal${modalClosing ? ' closing' : ''}`}>
            <div className="admin-modal-scroll">
              <h2>{editing ? 'Edit Product' : 'Add New Product'}</h2>

              {error && <div className="error-msg">{error}</div>}

              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Crochet Flower Bouquet"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the product…"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Multi-image upload */}
                <div className="form-group">
                  <label>Product Images (up to 5)</label>

                  {totalImages > 0 ? (
                    <div className="multi-img-grid">
                      {form.existingImages.map((url, i) => (
                        <div key={`ex-${i}`} className="multi-img-item">
                          <img
                            src={url.startsWith('http') ? url : `/uploads/${url}`}
                            alt={`Image ${i + 1}`}
                          />
                          <button
                            type="button"
                            className="multi-img-remove"
                            onClick={() => removeExistingImage(i)}
                          >✕</button>
                        </div>
                      ))}
                      {form.newImageFiles.map((file, i) => (
                        <div key={`new-${i}`} className="multi-img-item">
                          <img src={URL.createObjectURL(file)} alt={`New ${i + 1}`} />
                          <button
                            type="button"
                            className="multi-img-remove"
                            onClick={() => removeNewImage(i)}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="image-placeholder">No images selected</div>
                  )}

                  {totalImages < 5 && (
                    <>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />
                      <button
                        type="button"
                        className="btn-upload-img"
                        onClick={() => fileRef.current.click()}
                      >
                        + Add Images {totalImages > 0 ? `(${totalImages}/5)` : ''}
                      </button>
                    </>
                  )}
                  {totalImages >= 5 && (
                    <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>Maximum 5 images reached</p>
                  )}
                </div>

                <div className="checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.inStock}
                      onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
                    />
                    In Stock
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.bestseller}
                      onChange={(e) => setForm((f) => ({ ...f, bestseller: e.target.checked }))}
                    />
                    Bestseller
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
