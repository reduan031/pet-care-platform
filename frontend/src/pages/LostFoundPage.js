import React, { useState, useEffect } from 'react';
import api from '../config/api';
import './LostFoundPage.css';

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
    contactEmail: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lostfound', {
        ...formData,
        contactInfo: {
          phone: formData.contactPhone,
          email: formData.contactEmail
        }
      });
      alert('Report submitted successfully!');
      setShowAddForm(false);
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
            <label>Approximate Address / Map Location</label>
            <input type="text" name="address" required className="form-input" placeholder="e.g. Near Central Park, NY" value={formData.address} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" required className="form-input" value={formData.date} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Description & Appearance</label>
            <textarea name="description" required rows="4" className="form-input" placeholder="Breed, color, collar, unique marks..." value={formData.description} onChange={handleChange}></textarea>
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
