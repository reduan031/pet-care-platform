import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import { useCart } from '../context/CartC/ontext';

const CAT_ICONS = { food:'🍖', accessory:'🎀', toy:'🎾', clothing:'👕', grooming:'✂️', medicine:'💊', default:'📦' };

const Products = () => {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

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