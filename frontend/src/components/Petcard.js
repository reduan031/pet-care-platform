// ================================
// FILE: frontend/src/components/PetCard.js
// ================================
import React from 'react';
import { Link } from 'react-router-dom';

const PetCard = ({ pet, onEdit }) => {
  const getAgeString = () => {
    if (!pet?.age) return 'Unknown';
    if (typeof pet.age === 'string') return pet.age;
    if (pet.age.years > 0) {
      return `${pet.age.years} year${pet.age.years > 1 ? 's' : ''} ${pet.age.months > 0 ? `${pet.age.months} month${pet.age.months > 1 ? 's' : ''}` : ''}`;
    }
    return `${pet.age.months} month${pet.age.months > 1 ? 's' : ''}`;
  };

  const getPetIcon = () => {
    switch(pet.type) {
      case 'cat': return '🐱';
      case 'dog': return '🐶';
      case 'bird': return '🐦';
      case 'pigeon': return '🕊️';
      default: return '🐾';
    }
  };

  return (
    <div className="pet-card">
      <Link to={`/pets/${pet._id}`} className="pet-link">
        <div className="pet-img-wrap">
          {((pet.photos && pet.photos[0]) || (pet.images && pet.images[0])) ? (
            <img src={pet.photos?.[0] || pet.images?.[0]} alt={pet.name} />
          ) : (
            <div className="pet-img-ph">{getPetIcon()}</div>
          )}
          {pet.forSale && (
            <span className="for-sale-tag">For Sale</span>
          )}
        </div>

        <div className="pet-info">
          <h3 className="pet-name">{pet.name}</h3>
          <p className="pet-breed">{pet.breed}</p>
          
          <div className="pet-details">
            <span className="pet-detail">{getPetIcon()} {pet.type}</span>
            <span className="pet-detail">📅 {getAgeString()}</span>
            <span className="pet-detail">⚖️ {pet.weight}kg</span>
          </div>

          {pet.forSale && pet.price && (
            <div className="pet-price">৳{pet.price.toLocaleString()}</div>
          )}

          <div className="pet-health-status">
            Health: <span className={`status-${pet.healthStatus}`}>{pet.healthStatus}</span>
          </div>
        </div>
      </Link>
      {onEdit && (
        <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={onEdit}>
          Edit Pet
        </button>
      )}
    </div>
  );
};

export default PetCard;