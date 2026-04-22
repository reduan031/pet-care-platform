import React, { useState, useEffect } from 'react';
import api from '../config/api';
import './LostFoundPage.css';
import { fileToDataUrl } from '../utils/file';
import { MapViewer, MapPicker, LocationSearchInput, lostIcon, foundIcon, reverseGeocode } from '../components/MapComponent';

const LostFoundPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lost');
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    type: 'lost',
    address: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    contactPhone: '',
    contactEmail: '',
    photo: '',
    lat: '',
    lng: '',
  });
  const [showMap, setShowMap] = useState(true);

  const fetchReports = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/lostfound?type=${activeTab}&status=active`);
      setReports(response.data.data);
    } catch (error) {
      console.error('Failed to fetch reports', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchReports();
  }, [activeTab, fetchReports]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const photo = await fileToDataUrl(file);
    setFormData((prev) => ({ ...prev, photo }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lostfound', {
        ...formData,
        contactInfo: {
          phone: formData.contactPhone,
          email: formData.contactEmail
        },
        photos: formData.photo ? [formData.photo] : []
      });
      alert('Report submitted successfully!');
      setShowAddForm(false);
      setFormData({
        type: 'lost',
        address: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        contactPhone: '',
        contactEmail: '',
        photo: '',
        lat: '',
        lng: '',
      });
      fetchReports();
    } catch (error) {
      alert('Failed to submit report. Please log in first.');
    }
  };

  return (
    <div className="lost-found-container">
      <div className="lf-header">
        <h1>🔍 Lost & Found Radar</h1>
        <p>Help re-unite pets with their families within your community.</p>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel Report' : '🚨 Report a Pet!'}
        </button>
      </div>

      <div className="lf-tabs">
        <button className={`lf-tab ${activeTab === 'lost' ? 'active' : ''}`} onClick={() => setActiveTab('lost')}>💔 Lost Pets</button>
        <button className={`lf-tab ${activeTab === 'found' ? 'active' : ''}`} onClick={() => setActiveTab('found')}>🤍 Found Pets</button>
        <button className="btn-ghost" onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const name = await reverseGeocode(lat, lng);
                setFormData((p) => ({ ...p, lat: String(lat), lng: String(lng), address: name || p.address }));
              },
              () => alert('Location access denied. Search below instead.')
            );
          }
        }}>
          📍 Use My Location
        </button>
      </div>

      {showAddForm && (
        <form className="lf-form slide-in" onSubmit={handleSubmit}>
          <h3>Submit a {formData.type === 'lost' ? 'Lost' : 'Found'} Report</h3>
          
          <div className="form-group">
            <label>Report Type</label>
            <select name="type" className="form-input" value={formData.type} onChange={handleChange}>
              <option value="lost">I lost my pet</option>
              <option value="found">I found a wandering pet</option>
            </select>
          </div>

          <div className="form-group">
            <label>📍 Where did you see the pet?</label>
            <LocationSearchInput
              value={formData.address}
              placeholder="🔍 Search area, road name or landmark..."
              onSelect={({ lat, lng, name }) => setFormData((p) => ({ ...p, lat: String(lat), lng: String(lng), address: name }))}
              onChange={(val) => setFormData((p) => ({ ...p, address: val }))}
            />
            <button type="button" className="btn-ghost" style={{ width: '100%', marginTop: 6, justifyContent: 'center' }} onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    const name = await reverseGeocode(lat, lng);
                    setFormData((p) => ({ ...p, lat: String(lat), lng: String(lng), address: name }));
                  },
                  () => alert('Location access denied. Search above instead.')
                );
              }
            }}>📍 Use My Current Location</button>
            <div style={{ marginTop: 10 }}>
              <div className="map-section-title">🗺️ Or click on map</div>
              <MapPicker
                onLocationSelect={({ lat, lng, name }) => setFormData((p) => ({ ...p, lat: String(lat), lng: String(lng), address: name || p.address }))}
                height="220px"
              />
              {formData.lat && formData.lng && (
                <div className="map-selected-coords">
                  📍 {formData.address || `${parseFloat(formData.lat).toFixed(4)}, ${parseFloat(formData.lng).toFixed(4)}`}
                </div>
              )}
              <p className="map-hint">Type to search, or click anywhere on map</p>
            </div>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" required className="form-input" value={formData.date} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Description & Appearance</label>
            <textarea name="description" required rows="4" className="form-input" placeholder="Breed, color, collar, unique marks..." value={formData.description} onChange={handleChange}></textarea>
          </div>

          <div className="form-group">
            <label>Device Image</label>
            <input type="file" accept="image/*" className="form-input" onChange={handleFileChange} />
            {formData.photo && <img src={formData.photo} alt="Report preview" style={{ width: '100%', marginTop: 10, borderRadius: 12, maxHeight: 220, objectFit: 'cover' }} />}
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Contact Phone</label>
              <input type="tel" name="contactPhone" className="form-input" value={formData.contactPhone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input type="email" name="contactEmail" className="form-input" value={formData.contactEmail} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="btn-primary">Broadast Report 📡</button>
        </form>
      )}

      <div style={{ marginBottom: 20 }}>
        <div className="map-section-title">🗺️ Lost & Found Map</div>
        <button className="btn-ghost" style={{ marginBottom: 10 }} onClick={() => setShowMap(!showMap)}>
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
        {showMap && (
          <MapViewer
            markers={reports
              .filter((r) => r.location?.coordinates)
              .map((r) => ({
                id: r._id,
                position: [r.location.coordinates[1], r.location.coordinates[0]],
                title: r.address,
                description: r.description,
                icon: r.type === 'lost' ? lostIcon : foundIcon,
              }))}
            center={[23.8103, 90.4125]}
            zoom={11}
            height="350px"
          />
        )}
      </div>

      {loading ? (
        <div className="lf-loading">Scanning Radar...</div>
      ) : (
        <div className="lf-grid">
          {reports.length === 0 ? (
            <div className="empty-state">No active reports in your area.</div>
          ) : (
            reports.map(report => (
              <div key={report._id} className="lf-card">
                <div className={`lf-badge ${report.type}`}>{report.type.toUpperCase()}</div>
                {(report.photos?.[0] || report.petId?.photos?.[0]) && (
                  <img src={report.photos?.[0] || report.petId?.photos?.[0]} alt="Lost or found pet" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
                )}
                <h4>{report.address}</h4>
                <p className="lf-date">📅 {new Date(report.date).toLocaleDateString()}</p>
                <p className="lf-desc">{report.description}</p>
                <div className="lf-contact">
                  {report.contactInfo?.phone && <span>📞 {report.contactInfo.phone}</span>}
                  {report.contactInfo?.email && <span>📧 {report.contactInfo.email}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LostFoundPage;
