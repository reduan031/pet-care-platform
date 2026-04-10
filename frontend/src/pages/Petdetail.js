import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../config/api';

const PET_ICONS = { cat:'🐱', dog:'🐶', bird:'🦜', pigeon:'🕊️', fish:'🐟', rabbit:'🐰', default:'🐾' };

const PetDetail = () => {
  const { id } = useParams();
  const [pet, setPet]         = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPet(); }, [id]); // eslint-disable-line

  const fetchPet = async () => {
    try {
      const res = await api.get(`/pets/${id}`);
      setPet(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAge = (pet) => {
    if (!pet?.age) return 'Unknown';
    if (pet.age.years > 0) return `${pet.age.years}yr ${pet.age.months > 0 ? pet.age.months+'mo' : ''}`.trim();
    return `${pet.age.months} months`;
  };

  if (loading) return (
    <div className="detail-page"><div className="container">
      <div className="loading-state"><div className="loading-paw">🐾</div><div className="loading-text">Loading pet profile...</div></div>
    </div></div>
  );
  if (!pet) return (
    <div className="detail-page"><div className="container">
      <div className="empty-state"><span className="empty-icon">🐾</span><p>Pet not found.</p><Link to="/pets" className="btn-primary" style={{marginTop:'20px',display:'inline-flex'}}>← Back to Marketplace</Link></div>
    </div></div>
  );

  const icon = PET_ICONS[pet.type?.toLowerCase()] || PET_ICONS.default;
  const healthCls = { excellent:'status-excellent', good:'status-good', fair:'status-fair', poor:'status-poor' }[pet.healthStatus?.toLowerCase()] || '';

  return (
    <div className="detail-page">
      <div className="container">
        <Link to="/pets" className="btn-ghost" style={{ display:'inline-flex', marginBottom:'28px', padding:'10px 20px' }}>← Back to Marketplace</Link>

        <div className="detail-layout reveal">
          {/* Image */}
          <div className="detail-img-wrap">
            {pet.images?.[0] ? (
              <img src={pet.images[0]} alt={pet.name} />
            ) : (
              <div className="detail-img-ph">{icon}</div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <div className="detail-meta-tags">
              <span className="detail-tag">{pet.type}</span>
              {pet.breed  && <span className="detail-tag">{pet.breed}</span>}
              {pet.gender && <span className="detail-tag">{pet.gender}</span>}
              {pet.forSale && <span className="detail-tag" style={{ background:'rgba(249,115,22,0.18)', borderColor:'rgba(249,115,22,0.35)', color:'#FED7AA' }}>For Adoption</span>}
            </div>

            <h1>{pet.name}</h1>

            {pet.forSale && pet.price > 0 && (
              <div className="detail-price" style={{ background:'linear-gradient(135deg,#F97316,#F43F5E)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                ৳{pet.price?.toLocaleString()}
              </div>
            )}

            {/* Quick chips */}
            <div className="pet-chips" style={{ marginBottom:'22px' }}>
              {pet.age     && <span className="pet-chip">🎂 {getAge(pet)}</span>}
              {pet.weight  && <span className="pet-chip">⚖️ {pet.weight} kg</span>}
              {pet.color   && <span className="pet-chip">🎨 {pet.color}</span>}
              {pet.vaccinated && <span className="pet-chip" style={{ color:'var(--emerald)' }}>💉 Vaccinated</span>}
              {pet.healthStatus && <span className={`pet-chip ${healthCls}`}>❤️ {pet.healthStatus}</span>}
            </div>

            {pet.description && <p className="detail-desc">{pet.description}</p>}

            {/* Vaccinations */}
            {pet.vaccinations?.length > 0 && (
              <div className="glass-panel" style={{ marginBottom:'20px', padding:'18px 22px' }}>
                <h3 style={{ fontSize:'15px', marginBottom:'14px' }}>💉 Vaccination History</h3>
                {pet.vaccinations.map((v, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', fontSize:'13px' }}>
                    <span style={{ fontWeight:600 }}>{v.name}</span>
                    <span style={{ color:'var(--muted)' }}>{new Date(v.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Medical history */}
            {pet.medicalHistory?.length > 0 && (
              <div className="glass-panel" style={{ marginBottom:'20px', padding:'18px 22px' }}>
                <h3 style={{ fontSize:'15px', marginBottom:'14px' }}>🏥 Medical History</h3>
                {pet.medicalHistory.map((r, i) => (
                  <div key={i} style={{ padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize:'13px', marginBottom:'4px' }}><strong>Condition:</strong> {r.condition}</p>
                    <p style={{ fontSize:'13px', marginBottom:'4px', color:'var(--muted)' }}><strong style={{ color:'rgba(255,255,255,0.7)' }}>Treatment:</strong> {r.treatment}</p>
                    <p style={{ fontSize:'12px', color:'var(--muted)' }}>{new Date(r.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Owner info */}
            {pet.userId && (
              <div className="glass-panel" style={{ marginBottom:'22px', padding:'18px 22px' }}>
                <h3 style={{ fontSize:'15px', marginBottom:'14px' }}>👤 Owner Information</h3>
                <p style={{ fontSize:'14px', marginBottom:'6px', color:'var(--muted)' }}><strong style={{ color:'#fff' }}>Name:</strong> {pet.userId.name}</p>
                <p style={{ fontSize:'14px', marginBottom:'6px', color:'var(--muted)' }}><strong style={{ color:'#fff' }}>Email:</strong> {pet.userId.email}</p>
                {pet.userId.phone && <p style={{ fontSize:'14px', color:'var(--muted)' }}><strong style={{ color:'#fff' }}>Phone:</strong> {pet.userId.phone}</p>}
              </div>
            )}

            {pet.forSale && (
              <div className="detail-actions">
                <button className="btn-primary" style={{ flex:1, justifyContent:'center' }}>
                  🐾 Contact Owner
                </button>
                <Link to="/pets" className="btn-ghost" style={{ padding:'15px 22px' }}>Browse More</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetail;
