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

  // New Arrivals tab state
  const [naToggling, setNaToggling] = useState(null); // product._id being toggled

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

  // Workshops tab state
  const EMPTY_WS = { title: '', description: '', duration: '', level: 'All Levels', date: '', time: '11:00', seatsLeft: 10, totalSeats: 10, price: '', emoji: '🧶', color: '#F5F0E8', badge: '', upcoming: true, includes: '' };
  const [wsItems, setWsItems]               = useState([]);
  const [wsLoading, setWsLoading]           = useState(false);
  const [wsModalOpen, setWsModalOpen]       = useState(false);
  const [wsEditing, setWsEditing]           = useState(null);
  const [wsForm, setWsForm]                 = useState(EMPTY_WS);
  const [wsSaving, setWsSaving]             = useState(false);
  const [wsError, setWsError]               = useState('');

  async function handleToggleNewArrival(product) {
    setNaToggling(product._id);
    try {
      await axios.patch(`/api/products/${product._id}`, { newArrival: !product.newArrival }, { headers: authHeader() });
      fetchProducts();
    } catch { alert('Could not update product.'); }
    finally { setNaToggling(null); }
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

  // Workshop helpers
  async function fetchWorkshops() {
    setWsLoading(true);
    try {
      const res = await axios.get('/api/workshops');
      setWsItems(res.data);
    } catch { /* ignore */ }
    finally { setWsLoading(false); }
  }

  function openAddWs() {
    setWsEditing(null);
    setWsForm(EMPTY_WS);
    setWsError('');
    setWsModalOpen(true);
  }

  function openEditWs(ws) {
    const d = new Date(ws.date);
    const dateStr = d.toISOString().slice(0, 10);
    const timeStr = d.toTimeString().slice(0, 5);
    setWsEditing(ws);
    setWsForm({
      title: ws.title,
      description: ws.description || '',
      duration: ws.duration || '',
      level: ws.level || 'All Levels',
      date: dateStr,
      time: timeStr,
      seatsLeft: ws.seatsLeft ?? 10,
      totalSeats: ws.totalSeats ?? 10,
      price: ws.price || '',
      emoji: ws.emoji || '🧶',
      color: ws.color || '#F5F0E8',
      badge: ws.badge || '',
      upcoming: ws.upcoming !== false,
      includes: Array.isArray(ws.includes) ? ws.includes.join('\n') : '',
    });
    setWsError('');
    setWsModalOpen(true);
  }

  async function handleWsSave() {
    if (!wsForm.title.trim()) { setWsError('Title is required'); return; }
    if (!wsForm.date)         { setWsError('Date is required'); return; }
    setWsSaving(true);
    setWsError('');
    try {
      const dateTime = new Date(`${wsForm.date}T${wsForm.time || '11:00'}`);
      const payload = {
        ...wsForm,
        date: dateTime.toISOString(),
        seatsLeft: Number(wsForm.seatsLeft),
        totalSeats: Number(wsForm.totalSeats),
        includes: wsForm.includes.split('\n').map(s => s.trim()).filter(Boolean),
      };
      delete payload.time;
      if (wsEditing) {
        await axios.put(`/api/workshops/${wsEditing._id}`, payload, { headers: authHeader() });
      } else {
        await axios.post('/api/workshops', payload, { headers: authHeader() });
      }
      setWsModalOpen(false);
      fetchWorkshops();
    } catch (err) {
      setWsError(err.response?.data?.message || 'Save failed');
    } finally {
      setWsSaving(false);
    }
  }

  async function handleWsDelete(ws) {
    if (!window.confirm(`Delete "${ws.title}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/workshops/${ws._id}`, { headers: authHeader() });
      fetchWorkshops();
    } catch { alert('Could not delete workshop.'); }
  }

  // Collections tab state
  const [collections, setCollections]     = useState(getStoredCollections);
  const [mostLovedKey, setMostLovedKey]   = useState(getMostLovedKey);
  const [collSaved, setCollSaved]         = useState(false);
  const [newColl, setNewColl]             = useState({ key: '', label: '', emoji: '🧶', desc: '', imgSeed: 'crochet' });
  const [collError, setCollError]         = useState('');
  const [editingColl, setEditingColl]     = useState(null);
  const [editCollForm, setEditCollForm]   = useState({ label: '', emoji: '', desc: '', img: '' });

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

  function startEditColl(c) {
    setEditingColl(c.key);
    setEditCollForm({ label: c.label, emoji: c.emoji || '🧶', desc: c.desc || '', img: c.img || '' });
  }

  function cancelEditColl() {
    setEditingColl(null);
  }

  function saveEditColl() {
    if (!editCollForm.label.trim()) return;
    const updated = collections.map(c =>
      c.key === editingColl
        ? { ...c, label: editCollForm.label.trim(), emoji: editCollForm.emoji, desc: editCollForm.desc.trim(), img: editCollForm.img || '' }
        : c
    );
    saveCollections(updated);
    setEditingColl(null);
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
    fetchWorkshops();
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
          <img src="/logo-new.png" alt="Marvikala" className="admin-logo-icon" />
          <h1>Admin</h1>
        </div>
        <div className="admin-navbar-right">
          <a href="/" target="_blank" rel="noreferrer" className="admin-view-site">
            View Site →
          </a>
          {activeTab === 'products' && (
            <button className="btn-add" onClick={openAdd}>+ Add Product</button>
          )}
          {activeTab === 'workshops' && (
            <button className="btn-add" onClick={openAddWs}>+ Add Workshop</button>
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
          className={`admin-tab-btn${activeTab === 'newArrivals' ? ' active' : ''}`}
          onClick={() => setActiveTab('newArrivals')}
        >
          ✨ New Arrivals
        </button>
        <button
          className={`admin-tab-btn${activeTab === 'hero' ? ' active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          🖼 Hero Image
        </button>
        <button
          className={`admin-tab-btn${activeTab === 'workshops' ? ' active' : ''}`}
          onClick={() => setActiveTab('workshops')}
        >
          🧶 Workshops
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
                          {(product.price || product.originalPrice) && (
                            <div className="admin-product-price">
                              {product.price && <span className="admin-price-current">₹{product.price}</span>}
                              {product.originalPrice && <span className="admin-price-original">₹{product.originalPrice}</span>}
                            </div>
                          )}
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
                {collections.map((c) => (
                  <div key={c.key}>
                    {editingColl === c.key ? (
                      /* ── Inline edit row ── */
                      <div className="admin-coll-edit-row">
                        <div className="admin-coll-edit-fields">
                          <div className="form-group" style={{ flex: 1 }}>
                            <label>Name *</label>
                            <input
                              type="text"
                              value={editCollForm.label}
                              onChange={e => setEditCollForm(f => ({ ...f, label: e.target.value }))}
                              placeholder="Collection name"
                            />
                          </div>
                          <div className="form-group" style={{ flex: 2 }}>
                            <label>Description</label>
                            <input
                              type="text"
                              value={editCollForm.desc}
                              onChange={e => setEditCollForm(f => ({ ...f, desc: e.target.value }))}
                              placeholder="Short description"
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Cover Image <small style={{ color: '#999', fontWeight: 400 }}>(click to select)</small></label>
                          <div className="admin-coll-img-picker">
                            {[
                              { path: '/images/flower-collection.png',          label: 'Flowers' },
                              { path: '/images/keychain-collection.png',         label: 'Keychains' },
                              { path: '/images/bookmarks-collection.png',        label: 'Bookmarks' },
                              { path: '/images/laddugopaldress-collection.png',  label: 'Laddu Gopal' },
                              { path: '/images/jewellery-collection.png',        label: 'Jewellery' },
                              { path: '/images/homedecor-collection.png',        label: 'Home Decor' },
                              { path: '/images/hairaccessories-collection.png',  label: 'Hair Acc.' },
                              { path: '/images/rakhi-collection.png',            label: 'Rakhi' },
                            ].map(img => (
                              <div
                                key={img.path}
                                className={`admin-coll-img-option${editCollForm.img === img.path ? ' selected' : ''}`}
                                onClick={() => setEditCollForm(f => ({ ...f, img: f.img === img.path ? '' : img.path }))}
                                title={img.label}
                              >
                                <img src={img.path} alt={img.label} />
                                <span>{img.label}</span>
                                {editCollForm.img === img.path && <span className="admin-coll-img-check">✓</span>}
                              </div>
                            ))}
                          </div>
                          {editCollForm.img && (
                            <button type="button" style={{ fontSize: 11, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', textDecoration: 'underline' }} onClick={() => setEditCollForm(f => ({ ...f, img: '' }))}>
                              Remove — use auto photo
                            </button>
                          )}
                        </div>
                        <div className="admin-coll-edit-actions">
                          <button className="btn-save" style={{ padding: '6px 14px', fontSize: 12 }} onClick={saveEditColl}>Save</button>
                          <button className="btn-cancel" style={{ padding: '6px 14px', fontSize: 12 }} onClick={cancelEditColl}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      /* ── Normal row ── */
                      <div className="admin-coll-item">
                        <span className="admin-coll-item-emoji">{c.emoji}</span>
                        <div className="admin-coll-item-info">
                          <div className="admin-coll-item-name">{c.label}</div>
                          <div className="admin-coll-item-desc">{c.desc || <span style={{ color: '#bbb', fontStyle: 'italic' }}>No description</span>}</div>
                          <div className="admin-coll-item-key">key: {c.key}</div>
                        </div>
                        {c.key === mostLovedKey && (
                          <span className="admin-coll-item-badge">★ Most Loved</span>
                        )}
                        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
                          <button className="btn-edit" onClick={() => startEditColl(c)}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDeleteColl(c.key)}>Remove</button>
                        </div>
                      </div>
                    )}
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

        {/* ── NEW ARRIVALS TAB ── */}
        {activeTab === 'newArrivals' && (
          <div className="admin-collections-panel">
            <h3 className="admin-coll-section-title">✨ New Arrivals</h3>
            <p style={{ color: 'var(--text-mid)', fontSize: 13, marginBottom: 20 }}>
              Toggle which products appear in the New Arrivals section on the home page. Marked products show a <strong>New</strong> badge on their card.
            </p>
            {loading ? (
              <div className="spinner" />
            ) : products.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: 13 }}>No products yet — add some in the Products tab first.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...products].sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0)).map(p => {
                  const imgs = p.images?.length > 0 ? p.images : (p.image ? [p.image] : []);
                  const imgSrc = imgs[0] ? (imgs[0].startsWith('http') ? imgs[0] : `/uploads/${imgs[0]}`) : null;
                  const isToggling = naToggling === p._id;
                  return (
                    <div key={p._id} className="admin-sig-option" style={{ opacity: isToggling ? 0.6 : 1 }}>
                      {imgSrc
                        ? <img src={imgSrc} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                        : <span style={{ fontSize: 28, flexShrink: 0 }}>🧶</span>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{CATEGORIES.find(c => c.key === p.category)?.label || p.category}{p.price ? ` · ₹${p.price}` : ''}</div>
                      </div>
                      {p.newArrival && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(45,191,167,0.13)', color: 'var(--teal)', borderRadius: 99, padding: '2px 8px', flexShrink: 0 }}>✦ New</span>
                      )}
                      <button
                        disabled={isToggling}
                        onClick={() => handleToggleNewArrival(p)}
                        style={{
                          background: p.newArrival ? '#fee2e2' : 'var(--olive)',
                          color: p.newArrival ? '#dc2626' : '#fff',
                          border: 'none', borderRadius: 8, padding: '6px 12px',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          fontFamily: 'var(--sans)', flexShrink: 0,
                          transition: 'background 0.15s',
                        }}
                      >
                        {isToggling ? '…' : p.newArrival ? 'Remove' : '+ Mark as New'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── WORKSHOPS TAB ── */}
        {activeTab === 'workshops' && (
          <div className="admin-collections-panel">
            <h3 className="admin-coll-section-title">🧶 Workshops</h3>
            <p style={{ color: 'var(--text-mid)', fontSize: 13, marginBottom: 20 }}>
              Add, edit or remove workshop sessions shown on the Workshops page.
            </p>

            {wsLoading ? (
              <div className="spinner" />
            ) : wsItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-light)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🧶</div>
                <p style={{ fontSize: 14 }}>No workshops yet. Click <strong>+ Add Workshop</strong> to create one.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {wsItems.map(ws => {
                  const d = new Date(ws.date);
                  const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                  const isFull  = ws.seatsLeft === 0;
                  return (
                    <div key={ws._id} className="admin-ws-row">
                      <span className="admin-ws-row-emoji">{ws.emoji}</span>
                      <div className="admin-ws-row-info">
                        <div className="admin-ws-row-title-row">
                          <span className="admin-ws-row-title">{ws.title}</span>
                          {ws.upcoming
                            ? <span className="admin-ws-badge admin-ws-badge-upcoming">Upcoming</span>
                            : <span className="admin-ws-badge admin-ws-badge-past">Past</span>
                          }
                          {isFull && <span className="admin-ws-badge admin-ws-badge-full">Full</span>}
                        </div>
                        <div className="admin-ws-row-meta">
                          📅 {dateStr} · {timeStr} &nbsp;·&nbsp; {ws.seatsLeft}/{ws.totalSeats} seats &nbsp;·&nbsp; {ws.price}
                        </div>
                      </div>
                      <div className="admin-ws-row-actions">
                        <button className="admin-ws-btn-edit" onClick={() => openEditWs(ws)}>Edit</button>
                        <button className="admin-ws-btn-delete" onClick={() => handleWsDelete(ws)}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Workshop Add / Edit Modal */}
      {wsModalOpen && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setWsModalOpen(false)}>
          <div className="admin-modal">
            <div className="admin-modal-scroll">
              <h2>{wsEditing ? 'Edit Workshop' : 'Add Workshop'}</h2>
              {wsError && <div className="error-msg">{wsError}</div>}

              <div className="form-group">
                <label>Title *</label>
                <input className="form-input" value={wsForm.title} onChange={e => setWsForm(f => ({ ...f, title: e.target.value }))} placeholder="Beginner Crochet — Flowers & Keychain" />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input form-textarea" rows={3} value={wsForm.description} onChange={e => setWsForm(f => ({ ...f, description: e.target.value }))} placeholder="What participants will learn and do..." />
              </div>

              <div className="admin-ws-form-grid">
                <div className="form-group">
                  <label>Date *</label>
                  <input className="form-input" type="date" value={wsForm.date} onChange={e => setWsForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input className="form-input" type="time" value={wsForm.time} onChange={e => setWsForm(f => ({ ...f, time: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input className="form-input" value={wsForm.duration} onChange={e => setWsForm(f => ({ ...f, duration: e.target.value }))} placeholder="3 hours" />
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select className="form-input" value={wsForm.level} onChange={e => setWsForm(f => ({ ...f, level: e.target.value }))}>
                    {['Beginner', 'Beginner–Intermediate', 'Intermediate', 'Advanced', 'All Levels'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Seats Left</label>
                  <input className="form-input" type="number" min={0} value={wsForm.seatsLeft} onChange={e => setWsForm(f => ({ ...f, seatsLeft: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Total Seats</label>
                  <input className="form-input" type="number" min={1} value={wsForm.totalSeats} onChange={e => setWsForm(f => ({ ...f, totalSeats: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Price (e.g. ₹799)</label>
                  <input className="form-input" value={wsForm.price} onChange={e => setWsForm(f => ({ ...f, price: e.target.value }))} placeholder="₹799" />
                </div>
                <div className="form-group">
                  <label>Emoji</label>
                  <input className="form-input" value={wsForm.emoji} onChange={e => setWsForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🌸" />
                </div>
                <div className="form-group">
                  <label>Card Colour</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={wsForm.color} onChange={e => setWsForm(f => ({ ...f, color: e.target.value }))} style={{ width: 40, height: 36, border: 'none', cursor: 'pointer', borderRadius: 6 }} />
                    <input className="form-input" value={wsForm.color} onChange={e => setWsForm(f => ({ ...f, color: e.target.value }))} style={{ flex: 1 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Badge (optional)</label>
                  <input className="form-input" value={wsForm.badge} onChange={e => setWsForm(f => ({ ...f, badge: e.target.value }))} placeholder="Most Popular" />
                </div>
              </div>

              <div className="form-group">
                <label>What's Included (one item per line)</label>
                <textarea className="form-input form-textarea" rows={4} value={wsForm.includes} onChange={e => setWsForm(f => ({ ...f, includes: e.target.value }))} placeholder={'All materials provided\nTake-home kit\nLight refreshments'} />
              </div>

              <div className="checkbox-row">
                <label className="checkbox-label">
                  <input type="checkbox" checked={wsForm.upcoming} onChange={e => setWsForm(f => ({ ...f, upcoming: e.target.checked }))} />
                  Show as Upcoming (uncheck for Past)
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setWsModalOpen(false)}>Cancel</button>
                <button type="button" className="btn-save" onClick={handleWsSave} disabled={wsSaving}>
                  {wsSaving ? 'Saving…' : wsEditing ? '✓ Save Changes' : '✓ Add Workshop'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
