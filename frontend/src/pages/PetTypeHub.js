import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const PRODUCT_CATEGORIES = [
  { key: 'food', label: 'Food', icon: '🍽️', category: 'food' },
  { key: 'toys', label: 'Toys', icon: '🧸', category: 'toy' },
  { key: 'accessory', label: 'Accessories', icon: '🎀', category: 'accessory' },
  { key: 'clothing', label: 'Clothing', icon: '👕', category: 'clothing' },
  { key: 'grooming', label: 'Grooming', icon: '🧼', category: 'grooming' },
  { key: 'pharmacy', label: 'Pharmacy', icon: '💊', category: 'medicine' },
];

const SERVICE_MODULES = [
  { key: 'vets', label: 'Veterinarians', icon: '🏥', path: '/appointments' },
  { key: 'boarding', label: 'Boarding Centers', icon: '🏠', path: '/appointments' },
  { key: 'rentals', label: 'Rental Homes', icon: '🏡', path: '/pets' },
  { key: 'breeding', label: 'Breeding', icon: '❤️', path: '/pets' },
  { key: 'lostfound', label: 'Lost & Found', icon: '📢', path: '/lost-found' },
  { key: 'adoption', label: 'Adoption', icon: '🏡', path: '/pets' },
];

const PET_TYPES = [
  { key: 'cat', name: 'Cat', emoji: '🐱', color: '#ff6b6b' },
  { key: 'dog', name: 'Dog', emoji: '🐶', color: '#4ecdc4' },
  { key: 'bird', name: 'Bird', emoji: '🦜', color: '#ffe66d' },
  { key: 'rabbit', name: 'Rabbit', emoji: '🐰', color: '#a18cd1' },
  { key: 'fish', name: 'Fish', emoji: '🐟', color: '#74b9ff' },
  { key: 'pigeon', name: 'Pigeon', emoji: '🕊️', color: '#fd79a8' },
];

const PetTypeHub = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedPet, setSelectedPet] = useState(searchParams.get('type') || '');

  const handlePetSelect = (petKey) => {
    setSelectedPet(petKey);
    setSearchParams({ type: petKey });
  };

  const clearSelection = () => {
    setSelectedPet('');
    setSearchParams({});
  };

  const selectedPetData = PET_TYPES.find(p => p.key === selectedPet);

  // If no pet selected, show pet selector
  if (!selectedPet) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="label-tag">🐾 Pet Hub</span>
            <h1 className="display-lg">Select Your Pet</h1>
            <p style={{ color: 'var(--muted)', maxWidth: '500px', margin: '0 auto' }}>
              Choose a pet type to see relevant products, services, and care options.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
            gap: '20px',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {PET_TYPES.map((pet) => (
              <button
                key={pet.key}
                onClick={() => handlePetSelect(pet.key)}
                className="glass-panel"
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit', 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '30px 20px',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'all 0.3s',
                  background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, ${pet.color}20 100%)`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = pet.color;
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '56px', marginBottom: '12px' }}>{pet.emoji}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px' }}>
                  {pet.name}
                </div>
                <div style={{ color: 'var(--muted)', marginTop: '8px', fontSize: '13px' }}>
                  Click to explore
                </div>
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/products" className="btn-primary" style={{ textDecoration: 'none' }}>
              🛍️ Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show categories for selected pet
  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header with selected pet */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span className="label-tag" style={{ background: selectedPetData?.color + '30', color: selectedPetData?.color }}>
              {selectedPetData?.emoji} {selectedPetData?.name} Hub
            </span>
            <button 
              onClick={clearSelection}
              className="btn-ghost"
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              ← Change Pet
            </button>
          </div>
          <h1 className="display-lg">{selectedPetData?.name} Products & Services</h1>
          <p style={{ color: 'var(--muted)' }}>
            Showing products and services specifically for {selectedPetData?.name.toLowerCase()}s.
            Select a category below to filter results.
          </p>
        </div>

        {/* Product Categories - These link to Products with both petType and category */}
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#fff' }}>🛍️ Shop by Category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {PRODUCT_CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              to={`/products?petType=${selectedPet}&category=${cat.category}`}
              className="glass-panel"
              style={{ 
                textDecoration: 'none', 
                color: 'inherit', 
                display: 'block',
                padding: '24px',
                transition: 'all 0.3s',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = selectedPetData?.color;
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{cat.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>
                {selectedPetData?.name} {cat.label}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
                Browse {selectedPet} {cat.label.toLowerCase()}
              </div>
            </Link>
          ))}
        </div>

        {/* Services */}
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#fff' }}>🎯 Services</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {SERVICE_MODULES.map((mod) => (
            <Link
              key={mod.key}
              to={`${mod.path}?petType=${selectedPet}`}
              className="glass-panel"
              style={{ 
                textDecoration: 'none', 
                color: 'inherit', 
                display: 'block',
                padding: '20px',
                transition: 'all 0.3s',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{mod.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px' }}>
                {selectedPetData?.name} {mod.label}
              </div>
            </Link>
          ))}
        </div>

        {/* Quick link to all products for this pet */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <Link to={`/products?petType=${selectedPet}`} className="btn-primary" style={{ textDecoration: 'none' }}>
            🛍️ See All {selectedPetData?.name} Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PetTypeHub;
