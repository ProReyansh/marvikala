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

const DEFAULT_COLLECTIONS = [
  { key: 'flowers',          label: 'Flowers',          emoji: '🌸', desc: 'Handcrafted crochet bouquets, blooms & arrangements crafted for every occasion and loved one', imgSeed: 'flowers' },
  { key: 'homedecor',        label: 'Home Decor',        emoji: '🏠', desc: 'Cozy crochet accents — from wall hangings to table runners — to warm up every corner', imgSeed: 'interior' },
  { key: 'jewellery',        label: 'Jewellery',         emoji: '💍', desc: 'Delicate crochet earrings, rings & bracelets — wearable art for everyday elegance', imgSeed: 'jewelry' },
  { key: 'custom',           label: 'Custom Orders',     emoji: '🎨', desc: "Your imagination, our craft. Share your idea and we'll create something truly one-of-a-kind", imgSeed: 'craft' },
  { key: 'laddugopaldress',  label: 'Laddu Gopal',       emoji: '🕉️', desc: 'Beautiful handcrafted outfits, accessories & sets for your beloved Laddu Gopal', imgSeed: 'fabric' },
  { key: 'keychains',        label: 'Keychains',         emoji: '🔑', desc: 'Adorable crochet keychains — perfect everyday carry or a thoughtful little gift', imgSeed: 'keychain' },
  { key: 'bookmarks',        label: 'Bookmarks',         emoji: '🔖', desc: 'Charming crochet bookmarks for every book lover — mark your page in style', imgSeed: 'books' },
  { key: 'hairaccessories',  label: 'Hair Accessories',  emoji: '🎀', desc: 'Handmade bows, scrunchies & clips to express your personality every single day', imgSeed: 'ribbon' },
  { key: 'rakhi',            label: 'Rakhi',             emoji: '🪢', desc: 'Beautiful handmade Rakhis crafted with love for a cherished, heartfelt celebration', imgSeed: 'thread' },
];

function getStoredCollections() {
  try {
    const c = localStorage.getItem('mk_custom_collections');
    if (c) { const arr = JSON.parse(c); if (Array.isArray(arr) && arr.length > 0) return arr; }
  } catch {}
  return DEFAULT_COLLECTIONS;
}

function getMostLovedKey() {
  try { return localStorage.getItem('mk_most_loved_collection') || 'flowers'; } catch { return 'flowers'; }
}

const EMPTY_FORM = {
  name: '', description: '', category: 'flowers',
  inStock: true, bestseller: false,
  price: '', originalPrice: '',
  existingImages: [],
  newImageFiles: [],
};

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('marvikala_admin_token')}` };
}

export default function AdminDashboard() {
  const navigate    = useNavigate();
  const fileRef     = useRef();

  // Products tab state
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterCat, setFilterCat]   = useState('all');
  const [modalOpen, setModalOpen]   = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  // Tab state
  const [activeTab, setActiveTab]   = useState('products');

  // Signature Piece tab state
  const [sigPieceId, setSigPieceId] = useState(() => { try { return localStorage.getItem('mk_signature_piece_id') || ''; } catch { return ''; } });
  const [sigSaved, setSigSaved]     = useState(false);

  // Hero Image tab state
  const heroFileRef                     = useRef();
  const [heroCurrentUrl, setHeroCurrentUrl] = useState('');
  const [heroFile, setHeroFile]         = useState(null);
  const [heroPreview, setHeroPreview]   = useState('');
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroSaved, setHeroSaved]       = useState(false);
  const [heroError, setHeroError]       = useState('');

  // Hero Text tab state
  const [heroHeading, setHeroHeading]   = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroTextSaving, setHeroTextSaving] = useState(false);
  const [heroTextSaved, setHeroTextSaved]   = useState(false);
  const [heroTextError, setHeroTextError]   = useState('');

  function saveSigPiece(id) {
    setSigPieceId(id);
    try { if (id) localStorage.setItem('mk_signature_piece_id', id); else localStorage.removeItem('mk_signature_piece_id'); } catch {}
    setSigSaved(true);
    setTimeout(() => setSigSaved(false), 2000);
  }

  function handleHeroFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setHeroFile(file);
    setHeroPreview(URL.createObjectURL(file));
    setHeroError('');
    e.target.value = '';
  }

  async function handleHeroUpload() {
    if (!heroFile) return;
    setHeroUploading(true);
    setHeroError('');
    try {
      const data = new FormData();
      data.append('image', heroFile);
      const res = await axios.post('/api/settings/hero-image', data, { headers: authHeader() });
      setHeroCurrentUrl(res.data.url);
      setHeroFile(null);
      setHeroPreview('');
      setHeroSaved(true);
      setTimeout(() => setHeroSaved(false), 3000);
    } catch (err) {
      setHeroError(err.response?.data?.message || 'Upload failed');
    } finally {
      setHeroUploading(false);
    }
  }

  async function handleHeroReset() {
    if (!window.confirm('Revert to the default hero image?')) return;
    try {
      await axios.delete('/api/settings/hero-image', { headers: authHeader() });
      setHeroCurrentUrl('');
      setHeroFile(null);
      setHeroPreview('');
    } catch {
      alert('Could not reset hero image.');
    }
  }

  async function handleHeroTextSave() {
    setHeroTextSaving(true);
    setHeroTextError('');
    try {
      await axios.post('/api/settings/hero-text',
        { heading: heroHeading, subtitle: heroSubtitle },
        { headers: authHeader() }
      );
      setHeroTextSaved(true);
      setTimeout(() => setHeroTextSaved(false), 3000);
    } catch (err) {
      setHeroTextError(err.response?.data?.message || 'Save failed');
    } finally {
      setHeroTextSaving(false);
    }
  }

  async function handleHeroTextReset() {
    if (!window.confirm('Revert hero text to the default? This will clear your custom heading and subtitle.')) return;
    try {
      await axios.delete('/api/settings/hero-text', { headers: authHeader() });
      setHeroHeading('');
      setHeroSubtitle('');
    } catch {
      alert('Could not reset hero text.');
    }
  }

  // Collections tab state
  const [collections, setCollections]     = useState(getStoredCollections);
  const [mostLovedKey, setMostLovedKey]   = useState(getMostLovedKey);
  const [collSaved, setCollSaved]         = useState(false);
  const [newColl, setNewColl]             = useState({ key: '', label: '', emoji: '🧶', desc: '', imgSeed: 'crochet' });
  const [collError, setCollError]         = useState('');
  const [editingColl, setEditingColl]     = useState(null);

  function saveMostLoved(key) {
    setMostLovedKey(key);
    try { localStorage.setItem('mk_most_loved_collection', key); } catch {}
    setCollSaved(true);
    setTimeout(() => setCollSaved(false), 2000);
  }

  function saveCollections(list) {
    setCollections(list);
    try { localStorage.setItem('mk_custom_collections', JSON.stringify(list)); } catch {}
    setCollSaved(true);
    setTimeout(() => setCollSaved(false), 2000);
  }

  function handleAddCollection(e) {
    e.preventDefault();
    setCollError('');
    const key = newColl.key.trim().toLowerCase().replace(/\s+/g, '');
    if (!key || !newColl.label.trim()) { setCollError('Key and name are required.'); return; }
    if (collections.find(c => c.key === key)) { setCollError('A collection with this key already exists.'); return; }
    const added = [...collections, { ...newColl, key, label: newColl.label.trim(), desc: newColl.desc.trim() }];
    saveCollections(added);
    setNewColl({ key: '', label: '', emoji: '🧶', desc: '', imgSeed: 'crochet' });
  }

  function handleDeleteColl(key) {
    if (!window.confirm('Remove this collection from the page?')) return;
    const next = collections.filter(c => c.key !== key);
    saveCollections(next);
    if (mostLovedKey === key) saveMostLoved(next[0]?.key || 'flowers');
  }

  function handleResetCollections() {
    if (!window.confirm('Reset to default collections? This cannot be undone.')) return;
    saveCollections(DEFAULT_COLLECTIONS);
    saveMostLoved('flowers');
  }

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

  useEffect(() => {
    fetchProducts();
    document.title = 'Marvikala Admin';
    // Fetch current hero image
    axios.get('/api/settings/hero-image')
      .then(res => { if (res.data.url) setHeroCurrentUrl(res.data.url); })
      .catch(() => {});
    // Fetch current hero text
    axios.get('/api/settings/hero-text')
      .then(res => {
        if (res.data.heading)  setHeroHeading(res.data.heading);
        if (res.data.subtitle) setHeroSubtitle(res.data.subtitle);
      })
      .catch(() => {});
  }, []);

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
      price: product.price || '',
      originalPrice: product.originalPrice || '',
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
      if (form.price !== '' && form.price !== null) data.append('price', form.price);
      if (form.originalPrice !== '' && form.originalPrice !== null) data.append('originalPrice', form.originalPrice);

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
          {activeTab === 'products' && (
            <button className="btn-add" onClick={openAdd}>+ Add Product</button>
          )}
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn${activeTab === 'products' ? ' active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products
        </button>
        <button
          className={`admin-tab-btn${activeTab === 'collections' ? ' active' : ''}`}
          onClick={() => setActiveTab('collections')}
        >
          🗂 Collections
        </button>
        <button
          className={`admin-tab-btn${activeTab === 'signature' ? ' active' : ''}`}
          onClick={() => setActiveTab('signature')}
        >
          ✨ Signature Piece
        </button>
        <button
          className={`admin-tab-btn${activeTab === 'hero' ? ' active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          🖼 Hero Image
        </button>
      </div>

      <div className="admin-content">

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'products' && (
          <>
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
          </>
        )}

        {/* ── COLLECTIONS TAB ── */}
        {activeTab === 'collections' && (
          <div className="admin-collections-panel">

            {collSaved && (
              <div className="admin-coll-saved-toast">✓ Saved! Changes will appear on the Collections page.</div>
            )}

            {/* Most Loved Collection */}
            <div className="admin-coll-section">
              <h2>✦ Most Loved Collection</h2>
              <p className="admin-coll-desc">
                This collection appears as the featured banner at the top of the Collections page.
              </p>
              <div className="admin-coll-most-loved-row">
                <select
                  className="filter-select"
                  value={mostLovedKey}
                  onChange={(e) => saveMostLoved(e.target.value)}
                >
                  {collections.map(c => (
                    <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
                  ))}
                </select>
                <span className="admin-coll-preview-label">
                  Preview: <strong>{collections.find(c => c.key === mostLovedKey)?.label || '—'}</strong>
                </span>
              </div>
            </div>

            {/* Manage Collections */}
            <div className="admin-coll-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>🗂 Manage Collections</h2>
                <button className="admin-coll-reset-btn" onClick={handleResetCollections}>
                  Reset to Defaults
                </button>
              </div>
              <p className="admin-coll-desc">
                Add, reorder or remove collections shown on the Collections page.
              </p>

              {/* Existing collections list */}
              <div className="admin-coll-list">
                {collections.map((c, i) => (
                  <div key={c.key} className="admin-coll-item">
                    <span className="admin-coll-item-emoji">{c.emoji}</span>
                    <div className="admin-coll-item-info">
                      <div className="admin-coll-item-name">{c.label}</div>
                      <div className="admin-coll-item-key">key: {c.key}</div>
                    </div>
                    {c.key === mostLovedKey && (
                      <span className="admin-coll-item-badge">★ Most Loved</span>
                    )}
                    <button
                      className="btn-delete"
                      style={{ marginLeft: 'auto', flexShrink: 0 }}
                      onClick={() => handleDeleteColl(c.key)}
                      title="Remove this collection"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Add collection form */}
              <div className="admin-coll-add-form">
                <h3>+ Add New Collection</h3>
                {collError && <div className="error-msg">{collError}</div>}
                <form onSubmit={handleAddCollection}>
                  <div className="admin-coll-form-row">
                    <div className="form-group" style={{ flex: '0 0 80px' }}>
                      <label>Emoji</label>
                      <input
                        type="text"
                        value={newColl.emoji}
                        onChange={e => setNewColl(f => ({ ...f, emoji: e.target.value }))}
                        maxLength={4}
                        style={{ textAlign: 'center', fontSize: 22 }}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Name *</label>
                      <input
                        type="text"
                        value={newColl.label}
                        onChange={e => setNewColl(f => ({ ...f, label: e.target.value }))}
                        placeholder="e.g. Bags & Totes"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: '0 0 160px' }}>
                      <label>Key * <small style={{ color: '#999' }}>(no spaces)</small></label>
                      <input
                        type="text"
                        value={newColl.key}
                        onChange={e => setNewColl(f => ({ ...f, key: e.target.value.replace(/\s/g, '') }))}
                        placeholder="e.g. bags"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      value={newColl.desc}
                      onChange={e => setNewColl(f => ({ ...f, desc: e.target.value }))}
                      placeholder="Short description shown on the card"
                    />
                  </div>
                  <button type="submit" className="btn-save" style={{ marginTop: 4 }}>
                    Add Collection
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* ── HERO IMAGE TAB ── */}
        {activeTab === 'hero' && (
          <div className="admin-collections-panel">

            {/* ── Section: Hero Text ── */}
            <h3 className="admin-coll-section-title">✍️ Hero Text</h3>
            <p style={{ color: 'var(--text-mid)', fontSize: 13, marginBottom: 20 }}>
              Customise the heading and subtitle shown on the home page hero. Leave blank to use the default text.
            </p>

            {heroTextSaved && <div className="admin-coll-saved">✓ Hero text saved!</div>}
            {heroTextError && <div className="error-msg" style={{ marginBottom: 16 }}>{heroTextError}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Heading
                </label>
                <textarea
                  rows={3}
                  placeholder={`Handmade with love,\ncrafted for your\neveryday joy ♡`}
                  value={heroHeading}
                  onChange={e => setHeroHeading(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text)', background: 'var(--cream)', resize: 'vertical', outline: 'none', lineHeight: 1.5 }}
                />
                <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>
                  Use line breaks to control where text wraps on desktop.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Subtitle
                </label>
                <textarea
                  rows={2}
                  placeholder="Thoughtfully handmade creations that bring warmth, charm and happiness into your life."
                  value={heroSubtitle}
                  onChange={e => setHeroSubtitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--text)', background: 'var(--cream)', resize: 'vertical', outline: 'none', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-save"
                  onClick={handleHeroTextSave}
                  disabled={heroTextSaving}
                  style={{ flex: 'none' }}
                >
                  {heroTextSaving ? 'Saving…' : '✓ Save Text'}
                </button>
                {(heroHeading || heroSubtitle) && (
                  <button
                    type="button"
                    onClick={handleHeroTextReset}
                    style={{ fontSize: 12, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    Revert to default text
                  </button>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', margin: '28px 0' }} />

            {/* ── Section: Hero Image ── */}
            <h3 className="admin-coll-section-title">🖼 Hero Image</h3>
            <p style={{ color: 'var(--text-mid)', fontSize: 13, marginBottom: 20 }}>
              Upload a new background image for the hero section on the home page. Recommended: landscape, at least 1600px wide.
            </p>

            {heroSaved && <div className="admin-coll-saved">✓ Hero image updated!</div>}
            {heroError && <div className="error-msg" style={{ marginBottom: 16 }}>{heroError}</div>}

            {/* Current image */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Current Hero Image
              </div>
              <div style={{ width: '100%', maxWidth: 560, aspectRatio: '16/6', borderRadius: 12, overflow: 'hidden', border: '2px solid var(--border)', background: 'var(--cream-mid)' }}>
                <img
                  src={heroCurrentUrl || '/hero-bg.jpg'}
                  alt="Current hero"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              {heroCurrentUrl && (
                <button
                  onClick={handleHeroReset}
                  style={{ marginTop: 10, fontSize: 12, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  Revert to default image
                </button>
              )}
            </div>

            {/* New image picker */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Upload New Image
              </div>
              <input
                ref={heroFileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleHeroFileChange}
              />
              <button
                type="button"
                className="btn-upload-img"
                onClick={() => heroFileRef.current.click()}
                style={{ marginBottom: heroPreview ? 16 : 0 }}
              >
                {heroPreview ? '↺ Change Selected Image' : '+ Choose Image'}
              </button>

              {heroPreview && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-mid)', marginBottom: 8 }}>Preview:</div>
                  <div style={{ width: '100%', maxWidth: 560, aspectRatio: '16/6', borderRadius: 12, overflow: 'hidden', border: '2px dashed var(--rose)', background: 'var(--cream-mid)' }}>
                    <img src={heroPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <button
                    type="button"
                    className="btn-save"
                    onClick={handleHeroUpload}
                    disabled={heroUploading}
                    style={{ marginTop: 16 }}
                  >
                    {heroUploading ? 'Uploading…' : '✓ Save Hero Image'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SIGNATURE PIECE TAB ── */}
        {activeTab === 'signature' && (
          <div className="admin-collections-panel">
            <h3 className="admin-coll-section-title">✨ Signature Piece</h3>
            <p style={{ color: 'var(--text-mid)', fontSize: 13, marginBottom: 20 }}>
              Select the product to feature as the Signature Piece on the home page.
            </p>
            {sigSaved && <div className="admin-coll-saved">✓ Signature Piece saved!</div>}
            {loading ? (
              <div className="spinner" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  className={`admin-sig-option${sigPieceId === '' ? ' selected' : ''}`}
                  onClick={() => saveSigPiece('')}
                >
                  <span>Auto (first featured / bestseller)</span>
                  {sigPieceId === '' && <span className="admin-coll-saved" style={{ margin: 0, padding: '2px 10px' }}>✓ Active</span>}
                </div>
                {products.map(p => {
                  const imgs = p.images?.length > 0 ? p.images : (p.image ? [p.image] : []);
                  const imgSrc = imgs[0] ? (imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`) : null;
                  return (
                    <div
                      key={p._id}
                      className={`admin-sig-option${sigPieceId === p._id ? ' selected' : ''}`}
                      onClick={() => saveSigPiece(p._id)}
                    >
                      {imgSrc && <img src={imgSrc} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{p.category}{p.price ? ` · ₹${p.price}` : ''}</div>
                      </div>
                      {sigPieceId === p._id && <span className="admin-coll-saved" style={{ margin: 0, padding: '2px 10px' }}>✓ Active</span>}
                    </div>
                  );
                })}
              </div>
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
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 249"
                    value={form.price || ''}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="form-input"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Original Price ₹ <small style={{ color: '#999' }}>(crossed out — leave blank to hide)</small></label>
                  <input
                    type="number"
                    placeholder="e.g. 349"
                    value={form.originalPrice || ''}
                    onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                    className="form-input"
                    min="0"
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
