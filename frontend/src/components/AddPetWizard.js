import React, { useEffect, useState } from 'react';
import api from '../config/api';
import './AddPetWizard.css'; // Will create this next
import { fileToDataUrl } from '../utils/file';

const toInitialForm = (initialData) => {
  const safe = initialData || {};
  return {
    name: safe.name || '',
    type: safe.type || 'cat',
    photo: safe.photos?.[0] || safe.images?.[0] || '',
    breed: safe.breed || '',
    birthDate: safe.birthDate ? new Date(safe.birthDate).toISOString().split('T')[0] : '',
    gender: safe.gender || 'male',
    weight: safe.weight || '',
    weightUnit: safe.weightUnit || 'kg',
    color: safe.color || '',
    microchip: safe.microchip || '',
    allergies: Array.isArray(safe.allergies) ? safe.allergies.join(', ') : '',
    medicalHistory: safe.medicalHistory || '',
    vaccinations: safe.vaccinationRecords || [],
    documents: safe.documents || [],
  };
};

const AddPetWizard = ({ onComplete, onCancel, initialData = null, petId = null }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(toInitialForm(initialData));
  const [imageMode, setImageMode] = useState('url');

  useEffect(() => {
    setFormData(toInitialForm(initialData));
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setFormData((prev) => ({ ...prev, photo: dataUrl }));
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Data transformations for arrays and complex types
      const payload = {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()).filter(a => a) : [],
        weight: parseFloat(formData.weight) || 0,
        photos: formData.photo ? [formData.photo] : []
      };
      
      // Clean up empty strings for optional fields that Mongoose will strict-cast (like Date)
      if (!payload.birthDate) delete payload.birthDate;
      delete payload.photo;
      if (!payload.microchip) delete payload.microchip;
      if (!payload.color) delete payload.color;
      if (!payload.breed) delete payload.breed;
      if (!payload.medicalHistory) delete payload.medicalHistory;

      if (petId) {
        await api.put(`/pets/${petId}`, payload);
        alert('Pet profile updated successfully!');
      } else {
        await api.post('/pets', payload);
        alert('Pet profile created successfully!');
      }
      onComplete();
    } catch (error) {
      alert('Failed to add pet: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-pet-wizard">
      <div className="wizard-header">
        <h3>{petId ? '✏️ Edit Pet Profile' : '✨ Add New Pet Profile'}</h3>
        <button className="btn-close" onClick={onCancel}>✕</button>
      </div>
      
      <div className="wizard-progress">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Basic</div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Details</div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Medical</div>
      </div>

      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
        {step === 1 && (
          <div className="wizard-step-content slide-in">
            <div className="form-group">
              <label>Pet Photo</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <button type="button" className="btn-ghost" onClick={() => setImageMode('url')}>Use URL</button>
                <button type="button" className="btn-ghost" onClick={() => setImageMode('device')}>Use Device Image</button>
              </div>
              {imageMode === 'url' ? (
                <input type="text" name="photo" className="form-input" placeholder="https://..." value={formData.photo} onChange={handleChange} />
              ) : (
                <input type="file" accept="image/*" className="form-input" onChange={handleFileChange} />
              )}
              {formData.photo && (
                <div className="pet-image-preview">
                  <img src={formData.photo} alt="Pet preview" />
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Pet Name *</label>
              <input type="text" name="name" className="form-input" required value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Pet Type *</label>
              <select name="type" className="form-input" value={formData.type} onChange={handleChange}>
                <option value="cat">Cat</option>
                <option value="dog">Dog</option>
                <option value="bird">Bird</option>
                <option value="pigeon">Pigeon</option>
                <option value="rabbit">Rabbit</option>
                <option value="fish">Fish</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step-content slide-in">
            <div className="form-row-2">
              <div className="form-group">
                <label>Breed</label>
                <input type="text" name="breed" className="form-input" value={formData.breed} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Birth Date</label>
                <input type="date" name="birthDate" className="form-input" value={formData.birthDate} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" className="form-input" value={formData.gender} onChange={handleChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>Color</label>
                <input type="text" name="color" className="form-input" value={formData.color} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Weight</label>
                <input type="number" step="0.1" name="weight" className="form-input" value={formData.weight} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select name="weightUnit" className="form-input" value={formData.weightUnit} onChange={handleChange}>
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Microchip Number</label>
              <input type="text" name="microchip" className="form-input" value={formData.microchip} onChange={handleChange} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step-content slide-in">
            <div className="form-group">
              <label>Allergies (comma separated)</label>
              <input type="text" name="allergies" className="form-input" placeholder="e.g. Peanuts, Dust" value={formData.allergies} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Medical History Details</label>
              <textarea name="medicalHistory" className="form-input" rows="4" placeholder="Ongoing conditions, past surgeries..." value={formData.medicalHistory} onChange={handleChange}></textarea>
            </div>
            <div className="form-group">
              <label>Vaccination Note</label>
              <p style={{fontSize: '12px', color: 'var(--muted)'}}>You can upload detailed vaccine schedules from the Pet Dashboard later.</p>
            </div>
          </div>
        )}


        <div className="wizard-actions">
          {step > 1 && <button type="button" className="btn-secondary" onClick={handleBack}>← Back</button>}
          {step < 3 && <button type="submit" className="btn-primary" style={{marginLeft:'auto'}}>Next →</button>}
          {step === 3 && <button type="submit" className="btn-primary" style={{marginLeft:'auto'}} disabled={loading}>{loading ? 'Saving...' : '💾 Finish & Save'}</button>}
        </div>
      </form>
    </div>
  );
};

export default AddPetWizard;
