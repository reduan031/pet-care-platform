// ================================
// FILE: frontend/src/pages/MyPets.js
// ================================
import React, { useState, useEffect } from 'react';
import api from '../config/api';
import PetCard from '../components/Petcard';
import AddPetWizard from '../components/AddPetWizard';

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchMyPets();
  }, []);

  const fetchMyPets = async () => {
    try {
      const response = await api.get('/pets/my-pets');
      setPets(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="my-pets-page">
      <div className="page-header">
        <h1>My Pets</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          {showAddForm ? 'Cancel' : '+ Add Pet'}
        </button>
      </div>

      {showAddForm && (
        <AddPetWizard 
          onComplete={() => { setShowAddForm(false); fetchMyPets(); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {pets.length === 0 ? (
        <div className="empty-state">
          <p>You haven't added any pets yet</p>
        </div>
      ) : (
        <div className="products-grid">
          {pets.map(pet => (
            <PetCard key={pet._id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPets;
