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
  inStock: true, featured: false, image: null,
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
  const [preview, setPreview]       = useState('');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  function closeModal() {
    setModalClosing(true);
    setTimeout(() => { setModalOpen(false); setModalClosing(false); }, 230);
  }

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
    setPreview('');
    setError('');
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || '',
      category: product.category,
      inStock: product.inStock,
      featured: product.featured,
      image: null,
    });
    setPreview(product.image ? (product.image.startsWith('http') ? product.image : `/uploads/${product.image}`) : '');
    setError('');
    setModalOpen(true);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({ ...f, image: file }));
    setPreview(URL.createObjectURL(file));
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
      data.append('featured', form.featured);
      if (form.image) data.append('image', form.image);

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

  const inStockCount  = products.filter((p) => p.inStock).length;
  const featuredCount = products.filter((p) => p.featured).length;

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
            <div className="stat-label">Featured</div>
            <div className="stat-value">{featuredCount}</div>
            <div className="stat-icon">⭐</div>
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
              filtered.map((product) => (
                <div key={product._id} className="admin-product-card">
                  <div className="admin-product-img">
                    {product.image
                      ? <img src={product.image.startsWith('http') ? product.image : `/uploads/${product.image}`} alt={product.name} />
                      : <span>🧶</span>
                    }
                    {product.featured && <span className="featured-badge">⭐ Featured</span>}
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
              ))
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className={`admin-modal-overlay${modalClosing ? ' closing' : ''}`} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className={`admin-modal${modalClosing ? ' closing' : ''}`}>
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

              <div className="form-group">
                <label>Product Image</label>
                {preview
                  ? <img src={preview} alt="preview" className="image-preview" />
                  : <div className="image-placeholder">No image selected</div>
                }
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  style={{
                    background: '#f8f9fa', border: '1.5px solid #e5e5e5',
                    padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontFamily: 'Poppins, sans-serif', fontWeight: 600,
                  }}
                >
                  {preview ? 'Change Image' : 'Upload Image'}
                </button>
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
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                  Featured on Homepage
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
      )}
    </div>
  );
}
