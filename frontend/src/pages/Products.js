import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import api from '../config/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/Authcontext';
import { fileToDataUrl } from '../utils/file';

const CAT_ICONS = { food:'🍖', accessory:'🎀', toy:'🎾', clothing:'👕', grooming:'✂️', medicine:'💊', default:'📦' };

const Products = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const fromDashboard = new URLSearchParams(location.search).get('from') === 'dashboard';
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'food',
    petType: 'cat',
    price: '',
    stock: '',
    brand: '',
    images: [],
  });
  const [imageMode, setImageMode] = useState('device');
  const [urlInput, setUrlInput] = useState('');

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    petType:  searchParams.get('petType')  || '',
    minPrice: '',
    maxPrice: '',
    search:   '',
  });

  useEffect(() => { fetchProducts(); }, [searchParams]); // eslint-disable-line
  
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [products, loading]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchParams.get('category')) params.append('category', searchParams.get('category'));
      if (searchParams.get('petType'))  params.append('petType',  searchParams.get('petType'));
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.search)   params.append('search',   filters.search);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ category: '', petType: '', minPrice: '', maxPrice: '', search: '' });
    setSearchParams({});
  };

  const getDiscount = (p) => p.originalPrice && p.originalPrice > p.price
    ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const newImages = await Promise.all(
      files.slice(0, 5 - productForm.images.length).map(file => fileToDataUrl(file))
    );
    
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 5)
    }));
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (productForm.images.length >= 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setProductForm((prev) => ({
      ...prev,
      images: [...prev.images, urlInput.trim()]
    }));
    setUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        petType: productForm.petType,
        price: Number(productForm.price || 0),
        stock: Number(productForm.stock || 0),
        brand: productForm.brand,
        images: productForm.images,
      });
      setProductForm({ name: '', description: '', category: 'food', petType: 'cat', price: '', stock: '', brand: '', images: [] });
      setUrlInput('');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    }
  };

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-page-header reveal">
          <span className="label-tag">🛍️ Shop</span>
          <h1 className="display-lg">Pet <span className="gradient-text">Products</span></h1>
          <p>Premium supplies, food, toys &amp; accessories for every companion.</p>
        </div>

        <div className="products-layout">
          {/* Filters */}
          <aside className="filters-panel reveal">
            <h3>🔍 Filters</h3>

            <div className="filter-group">
              <label>Category</label>
              <select name="category" value={filters.category} onChange={handleChange} className="filter-select">
                <option value="">All Categories</option>
                <option value="food">🍖 Food</option>
                <option value="accessory">🎀 Accessories</option>
                <option value="toy">🎾 Toys</option>
                <option value="clothing">👕 Clothing</option>
                <option value="grooming">✂️ Grooming</option>
                <option value="medicine">💊 Medicine</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Pet Type</label>
              <select name="petType" value={filters.petType} onChange={handleChange} className="filter-select">
                <option value="">All Pets</option>
                <option value="cat">🐱 Cat</option>
                <option value="dog">🐶 Dog</option>
                <option value="bird">🦜 Bird</option>
                <option value="pigeon">🕊️ Pigeon</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range (৳)</label>
              <input type="number" name="minPrice" value={filters.minPrice} onChange={handleChange} placeholder="Min price" className="form-input" style={{ marginBottom: '10px' }} />
              <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleChange} placeholder="Max price" className="form-input" />
            </div>

            <div className="filter-group">
              <label>Search</label>
              <input type="text" name="search" value={filters.search} onChange={handleChange} placeholder="Search products..." className="form-input" />
            </div>

            <button onClick={applyFilters} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }}>Apply Filters</button>
            <button onClick={clearFilters} className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Clear All</button>
          </aside>

          {/* Products */}
          <div>
            {error && <div className="auth-error" style={{ marginBottom: '20px' }}>{error}</div>}

            {fromDashboard && isAuthenticated && ['seller', 'admin'].includes(user?.role) && (
              <div className="glass-panel reveal" style={{ marginBottom: 20 }}>
                <h3 style={{ marginTop: 0 }}>Add Product</h3>
                <form onSubmit={createProduct}>
                  <div className="form-row-2">
                    <input className="form-input" placeholder="Product Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                    <input className="form-input" placeholder="Brand" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} />
                  </div>
                  <textarea className="form-input" rows="3" style={{ marginTop: 10 }} placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} required />
                  <div className="form-row-2" style={{ marginTop: 10 }}>
                    <select className="filter-select" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                      <option value="food">Food</option>
                      <option value="accessory">Accessory</option>
                      <option value="toy">Toy</option>
                      <option value="clothing">Clothing</option>
                      <option value="grooming">Grooming</option>
                      <option value="medicine">Medicine</option>
                    </select>
                    <select className="filter-select" value={productForm.petType} onChange={(e) => setProductForm({ ...productForm, petType: e.target.value })}>
                      <option value="cat">Cat</option>
                      <option value="dog">Dog</option>
                      <option value="bird">Bird</option>
                      <option value="pigeon">Pigeon</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  <div className="form-row-2" style={{ marginTop: 10 }}>
                    <input className="form-input" type="number" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                    <input className="form-input" type="number" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} required />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Images ({productForm.images.length}/5)</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <button type="button" className={`btn-ghost ${imageMode === 'device' ? 'active' : ''}`} onClick={() => setImageMode('device')}>📁 From Device</button>
                      <button type="button" className={`btn-ghost ${imageMode === 'url' ? 'active' : ''}`} onClick={() => setImageMode('url')}>🔗 From URL</button>
                    </div>
                    
                    {imageMode === 'device' ? (
                      <input type="file" accept="image/*" multiple className="form-input" onChange={handleFileChange} />
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input type="text" className="form-input" placeholder="https://example.com/image.jpg" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
                        <button type="button" className="btn-ghost" onClick={handleAddUrl}>Add</button>
                      </div>
                    )}
                    
                    {productForm.images.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                        {productForm.images.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', width: 80, height: 80 }}>
                            <img src={img} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                            <button type="button" onClick={() => handleRemoveImage(idx)} style={{ position: 'absolute', top: -4, right: -4, background: '#ff4444', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="btn-primary" type="submit" style={{ marginTop: 10 }}>Save Product</button>
                </form>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <div className="loading-paw">🐾</div>
                <div className="loading-text">Loading products...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🛍️</span>
                <p>No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px' }}>
                  {products.length} product{products.length !== 1 ? 's' : ''} found
                </p>
                <div className="products-grid">
                  {products.map(product => {
                    const disc = getDiscount(product);
                    const icon = CAT_ICONS[product.category] || CAT_ICONS.default;
                    return (
                      <div key={product._id} className="product-card reveal">
                        <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div className="product-img-wrap">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} />
                            ) : (
                              <div className="product-img-ph">{icon}</div>
                            )}
                            {disc > 0 && <div className="product-discount-tag">-{disc}%</div>}
                          </div>
                          <div className="product-info">
                            <div className="product-name">{product.name}</div>
                            <div className="product-category-tag">{product.category} · {product.petType}</div>
                            <div className="product-price-row">
                              <span className="product-price">৳{product.price}</span>
                              {product.originalPrice > product.price && (
                                <span className="product-original">৳{product.originalPrice}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                        <button
                          className="add-cart-btn"
                          onClick={() => addToCart(product)}
                        >
                          🛒 Add to Cart
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;