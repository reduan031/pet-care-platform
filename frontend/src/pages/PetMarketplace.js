import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../config/api';

const PET_ICONS = { cat: '🐱', dog: '🐶', bird: '🦜', pigeon: '🕊️', fish: '🐟', rabbit: '🐰', default: '🐾' };

const PetMarketplace = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => { fetchPets(); }, []); // eslint-disable-line

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [pets, loading]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      const res = await api.get(`/pets/for-sale?${params}`);
      setPets(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch pets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const getAge = (pet) => {
    if (!pet?.age) return 'Unknown';
    if (typeof pet.age === 'string') return pet.age;
    if (pet.age.years > 0) return `${pet.age.years}yr ${pet.age.months > 0 ? pet.age.months + 'mo' : ''}`.trim();
    return `${pet.age.months} months`;
  };

  const healthColor = (h) => {
    const m = { excellent: 'status-excellent', good: 'status-good', fair: 'status-fair', poor: 'status-poor' };
    return m[h?.toLowerCase()] || '';
  };

  return (
    <div className="pets-page">
      <div className="container">
        <div className="products-page-header reveal">
          <span className="label-tag">🐾 Marketplace</span>
          <h1 className="display-lg">Find Your <span className="accent-cursive">Forever</span> Companion</h1>
          <p>Browse thousands of adorable pets from verified owners &amp; trusted breeders.</p>
        </div>

        <div className="products-layout">
          {/* Filters */}
          <aside className="filters-panel reveal">
            <h3>🔍 Filters</h3>
            <div className="filter-group">
              <label>Pet Type</label>
              <select name="type" value={filters.type} onChange={handleChange} className="filter-select">
                <option value="">All Types</option>
                <option value="cat">🐱 Cat</option>
                <option value="dog">🐶 Dog</option>
                <option value="bird">🦜 Bird</option>
                <option value="pigeon">🕊️ Pigeon</option>
                <option value="fish">🐟 Fish</option>
                <option value="rabbit">🐰 Rabbit</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Price Range (৳)</label>
              <input type="number" name="minPrice" value={filters.minPrice} onChange={handleChange} placeholder="Min price" className="form-input" style={{ marginBottom: '10px' }} />
              <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleChange} placeholder="Max price" className="form-input" />
            </div>
            <button onClick={fetchPets} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }}>Apply Filters</button>
            <button onClick={() => { setFilters({ type: '', minPrice: '', maxPrice: '' }); }} className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Clear All</button>
          </aside>

          {/* Pet cards */}
          <div>
            {loading ? (
              <div className="loading-state">
                <div className="loading-paw">🐾</div>
                <div className="loading-text">Finding your companions...</div>
              </div>
            ) : pets.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🐾</span>
                <p>No pets available right now. Check back soon!</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px' }}>
                  {pets.length} pet{pets.length !== 1 ? 's' : ''} available for adoption
                </p>
                <div className="products-grid">
                  {pets.map(pet => {
                    const icon = PET_ICONS[pet.type?.toLowerCase()] || PET_ICONS.default;
                    return (
                      <div key={pet._id} className="pet-card reveal">
                        <div className="pet-img-wrap">
                          {pet.images?.[0] ? (
                            <img src={pet.images[0]} alt={pet.name} />
                          ) : (
                            <div className="pet-img-ph">{icon}</div>
                          )}
                          {pet.isForSale && <div className="for-sale-tag">For Adoption</div>}
                        </div>
                        <div className="pet-info">
                          <div className="pet-name">{pet.name}</div>
                          <div className="pet-breed-tag">{pet.breed || pet.type} · {getAge(pet)}</div>
                          <div className="pet-chips">
                            {pet.gender && <span className="pet-chip">{pet.gender}</span>}
                            {pet.color && <span className="pet-chip">{pet.color}</span>}
                            {pet.vaccinated && <span className="pet-chip">💉 Vaccinated</span>}
                            {pet.healthStatus && (
                              <span className={`pet-chip ${healthColor(pet.healthStatus)}`}>
                                ❤️ {pet.healthStatus}
                              </span>
                            )}
                          </div>
                          {pet.price > 0 && <div className="pet-price">৳{pet.price}</div>}
                        </div>
                        <Link to={`/pets/${pet._id}`} className="view-pet-btn">
                          Meet {pet.name || 'this pet'} →
                        </Link>
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

export default PetMarketplace;