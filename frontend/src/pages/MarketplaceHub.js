import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { useAuth } from '../context/Authcontext';
import { useLocation } from 'react-router-dom';
import { fileToDataUrl } from '../utils/file';

const MarketplaceHub = () => {
  // eslint-disable-next-line no-unused-vars
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const fromDashboard = new URLSearchParams(location.search).get('from') === 'dashboard';
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    q: '',
    type: '',
    petType: '',
    breed: '',
    minPrice: '',
    maxPrice: '',
    minAge: '',
    maxAge: '',
    lat: '',
    lng: '',
    radiusKm: '10',
  });
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    listingType: 'adopt',
    petType: 'cat',
    breed: '',
    ageMonths: '',
    price: '',
    locationText: '',
    lat: '',
    lng: '',
    media: [],
  });
  const [imageMode, setImageMode] = useState('device');
  const [urlInput, setUrlInput] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(form).forEach(([k, v]) => v && params.append(k, v));
      const res = await api.get(`/marketplace/listings?${params}`);
      setListings(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []); // eslint-disable-line

  const onFilterChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onCreateChange = (e) => setNewListing((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const newImages = await Promise.all(
      files.slice(0, 8 - newListing.media.length).map(file => fileToDataUrl(file))
    );
    
    setNewListing((prev) => ({
      ...prev,
      media: [...prev.media, ...newImages].slice(0, 8)
    }));
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    if (newListing.media.length >= 8) {
      alert('Maximum 8 images allowed');
      return;
    }
    setNewListing((prev) => ({
      ...prev,
      media: [...prev.media, urlInput.trim()]
    }));
    setUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setNewListing((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const createListing = async (e) => {
    e.preventDefault();
    try {
      await api.post('/marketplace/listings', {
        ...newListing,
        media: newListing.media,
      });
      setNewListing({
        title: '',
        description: '',
        listingType: 'adopt',
        petType: 'cat',
        breed: '',
        ageMonths: '',
        price: '',
        locationText: '',
        lat: '',
        lng: '',
        media: [],
      });
      setUrlInput('');
      fetchListings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create listing');
    }
  };

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-page-header">
          <span className="label-tag">🏪 Marketplace</span>
          <h1 className="display-lg">Sell • Pet boarding • Adopt Near You</h1>
          <p>Location-aware pet marketplace with adoption mode, advanced filters, and payment-ready listings.</p>
        </div>

        <div className="products-layout">
          <aside className="filters-panel">
            <h3>📍 Location + Filters</h3>
            {['q', 'breed', 'lat', 'lng', 'radiusKm', 'minPrice', 'maxPrice', 'minAge', 'maxAge'].map((field) => (
              <div key={field} className="filter-group">
                <label>{field}</label>
                <input className="form-input" name={field} value={form[field]} onChange={onFilterChange} />
              </div>
            ))}
            <div className="filter-group">
              <label>Type</label>
              <select className="filter-select" name="type" value={form.type} onChange={onFilterChange}>
                <option value="">All</option>
                <option value="sell">Sell</option>
                <option value="boarding">Pet boarding</option>
                <option value="adopt">Adopt</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Pet Type</label>
              <select className="filter-select" name="petType" value={form.petType} onChange={onFilterChange}>
                <option value="">All</option>
                <option value="cat">Cat</option>
                <option value="dog">Dog</option>
                <option value="bird">Bird</option>
                <option value="rabbit">Rabbit</option>
                <option value="fish">Fish</option>
              </select>
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={fetchListings}>
              Search Near Me
            </button>
          </aside>

          <div>
            {fromDashboard && (
            <div className="glass-panel">
              <h3>Create Listing</h3>
              <form onSubmit={createListing}>
                <div className="form-row-2">
                  <input className="form-input" name="title" placeholder="Title" value={newListing.title} onChange={onCreateChange} required />
                  <select className="filter-select" name="listingType" value={newListing.listingType} onChange={onCreateChange}>
                    <option value="sell">Sell</option>
                    <option value="boarding">Pet boarding</option>
                    <option value="adopt">Adopt</option>
                  </select>
                </div>
                <textarea className="form-input" style={{ marginTop: 10 }} rows="3" name="description" placeholder="Description" value={newListing.description} onChange={onCreateChange} required />
                <div className="form-row-2" style={{ marginTop: 10 }}>
                  <input className="form-input" name="breed" placeholder="Breed" value={newListing.breed} onChange={onCreateChange} />
                  <input className="form-input" name="ageMonths" placeholder="Age (months)" value={newListing.ageMonths} onChange={onCreateChange} />
                </div>
                <div className="form-row-2" style={{ marginTop: 10 }}>
                  <input className="form-input" name="price" placeholder="Price (0 for free adoption)" value={newListing.price} onChange={onCreateChange} />
                  <input className="form-input" name="locationText" placeholder="Location text" value={newListing.locationText} onChange={onCreateChange} required />
                </div>
                <div style={{ marginTop: 10 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Images ({newListing.media.length}/8)</label>
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
                  
                  {newListing.media.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      {newListing.media.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', width: 80, height: 80 }}>
                          <img src={img} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                          <button type="button" onClick={() => handleRemoveImage(idx)} style={{ position: 'absolute', top: -4, right: -4, background: '#ff4444', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button className="btn-primary" type="submit" style={{ marginTop: 10 }}>Publish Listing</button>
              </form>
            </div>
            )}

            {loading ? (
              <div className="loading-state"><div className="loading-paw">🐾</div><div className="loading-text">Loading nearby listings...</div></div>
            ) : (
              <div className="products-grid">
                {listings.map((item) => (
                  <div key={item._id} className="product-card">
                    <div className="product-img-wrap">
                      {item.media?.[0] ? <img src={item.media[0]} alt={item.title} /> : <div className="product-img-ph">🐾</div>}
                      {item.isFreeAdoption && <div className="product-discount-tag">Free Adoption</div>}
                    </div>
                    <div className="product-info">
                      <div className="product-name">{item.title}</div>
                      <div className="product-category-tag">{item.petType} · {item.listingType} · {item.locationText}</div>
                      <div className="product-price-row">
                        <span className="product-price">৳{item.price}</span>
                        <span className="product-original">⭐ {item.avgRating || 0}</span>
                      </div>
                      <button 
                        className="btn-message-seller" 
                        onClick={() => {
                          // Backend returns ownerId populated with user data
                          const sellerId = item.ownerId?._id || item.ownerId;
                          if (sellerId) {
                            const seller = {
                              _id: sellerId,
                              name: item.ownerId?.name || 'Seller'
                            };
                            // Use global chat context
                            window.dispatchEvent(new CustomEvent('openChat', { detail: seller }));
                          } else {
                            alert('Seller information not available');
                          }
                        }}
                        style={{ width: '100%', marginTop: 8 }}
                      >
                        💬 {item.listingType === 'selling' ? 'Message Seller' : 
                            item.listingType === 'boarding' ? 'Message Boarding' : 
                            item.listingType === 'adoption' ? 'Message for Adoption' : 
                            'Message'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHub;
