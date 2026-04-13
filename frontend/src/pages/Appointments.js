import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const STATUS_COLORS = {
  scheduled: '#10b981',
  completed: '#3b82f6',
  cancelled: '#ef4444',
  pending:   '#f59e0b',
};

const TYPE_ICONS = {
  checkup:       '🩺',
  vaccination:   '💉',
  grooming:      '✂️',
  surgery:       '🔬',
  consultation:  '💬',
  emergency:     '🚑',
  default:       '🏥',
};

const APPOINTMENT_TYPES = [
  { key: 'checkup', label: 'Health Checkup', icon: '🩺' },
  { key: 'vaccination', label: 'Vaccination', icon: '💉' },
  { key: 'grooming', label: 'Grooming', icon: '✂️' },
  { key: 'surgery', label: 'Surgery', icon: '🔬' },
  { key: 'consultation', label: 'Consultation', icon: '💬' },
  { key: 'emergency', label: 'Emergency', icon: '🚑' },
];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [selectedPet, setSelectedPet]   = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(null);
  const [userPets, setUserPets] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    petId: '',
    appointmentType: 'checkup',
    doctorName: '',
    date: '',
    timeSlot: '',
    symptoms: '',
    fee: ''
  });

  useEffect(() => { fetchAppointments(); }, []);
  
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [appointments, loading]);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/my-appointments');
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (aptId) => {
    try {
      await api.delete(`/appointments/${aptId}`);
      setShowCancelModal(null);
      fetchAppointments();
    } catch (err) {
      alert('Failed to cancel appointment');
    }
  };

  const fetchUserPets = async () => {
    try {
      const res = await api.get('/pets/my-pets');
      setUserPets(res.data.data || []);
    } catch (err) {
      console.error('Failed to load pets:', err);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.petId) {
      alert('Please select a pet');
      return;
    }
    try {
      // Build request body - doctor field is optional
      const requestBody = {
        pet: bookingForm.petId,
        appointmentType: bookingForm.appointmentType,
        date: bookingForm.date,
        timeSlot: bookingForm.timeSlot,
        symptoms: bookingForm.symptoms,
        fee: Number(bookingForm.fee) || 0
      };
      // Only add doctor if provided (must be valid doctor user ID)
      if (bookingForm.doctorName?.trim()) {
        requestBody.doctor = bookingForm.doctorName.trim();
      }
      await api.post('/appointments', requestBody);
      setShowBookingModal(false);
      setBookingForm({
        petId: '',
        appointmentType: 'checkup',
        doctorName: '',
        date: '',
        timeSlot: '',
        symptoms: '',
        fee: ''
      });
      fetchAppointments();
      alert('Appointment booked successfully!');
    } catch (err) {
      alert('Failed to book appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  // Get unique pets from appointments
  const pets = [...new Set(appointments.map(apt => apt.pet?.name).filter(Boolean))];

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const statusMatch = filter === 'all' || apt.status === filter;
    const petMatch = selectedPet === 'all' || apt.pet?.name === selectedPet;
    return statusMatch && petMatch;
  });

  // Separate upcoming and past
  const now = new Date();
  const upcoming = filteredAppointments.filter(apt => 
    new Date(apt.date) >= now && apt.status !== 'cancelled'
  ).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  const past = filteredAppointments.filter(apt => 
    new Date(apt.date) < now || apt.status === 'completed' || apt.status === 'cancelled'
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Stats
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(apt => new Date(apt.date) >= now && apt.status !== 'cancelled').length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    pending: appointments.filter(apt => apt.status === 'pending').length,
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      weekday: date.toLocaleString('default', { weekday: 'short' }),
      full: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    };
  };

  return (
    <div className="appointments-page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }} className="reveal">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span className="label-tag">📅 Veterinary</span>
            <button 
            className="btn-ghost" 
            style={{ fontSize: '13px', padding: '8px 16px' }}
            onClick={() => {
              fetchUserPets();
              setShowBookingModal(true);
            }}
          >
            + Book New Appointment
          </button>
          </div>
          <h1 className="display-lg">My <span className="gradient-text">Appointments</span></h1>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
            All your scheduled vet visits in one place. Track, manage, and book appointments easily.
          </p>
        </div>

        {/* Stats Cards */}
        {!loading && appointments.length > 0 && (
          <div className="appt-stats-grid reveal">
            <div className="appt-stat-card">
              <span className="appt-stat-value" style={{ color: '#10b981' }}>{stats.upcoming}</span>
              <span className="appt-stat-label">Upcoming</span>
            </div>
            <div className="appt-stat-card">
              <span className="appt-stat-value" style={{ color: '#3b82f6' }}>{stats.completed}</span>
              <span className="appt-stat-label">Completed</span>
            </div>
            <div className="appt-stat-card">
              <span className="appt-stat-value" style={{ color: '#f59e0b' }}>{stats.pending}</span>
              <span className="appt-stat-label">Pending</span>
            </div>
            <div className="appt-stat-card">
              <span className="appt-stat-value">{stats.total}</span>
              <span className="appt-stat-label">Total</span>
            </div>
          </div>
        )}

        {/* Filters */}
        {!loading && appointments.length > 0 && (
          <div className="appt-filters reveal">
            <div className="filter-group">
              <label>Status</label>
              <div className="filter-buttons">
                {['all', 'scheduled', 'pending', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    className={`filter-btn ${filter === status ? 'active' : ''}`}
                    onClick={() => setFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {pets.length > 1 && (
              <div className="filter-group">
                <label>Pet</label>
                <select 
                  className="filter-select" 
                  value={selectedPet} 
                  onChange={(e) => setSelectedPet(e.target.value)}
                >
                  <option value="all">All Pets</option>
                  {pets.map(pet => (
                    <option key={pet} value={pet}>{pet}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="loading-paw">🐾</div>
            <div className="loading-text">Loading appointments...</div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state reveal">
            <span className="empty-icon">📅</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '10px' }}>
              No appointments yet
            </h3>
            <p style={{ marginBottom: '20px' }}>Schedule your first vet visit for your beloved pet.</p>
            <button 
              className="btn-primary"
              onClick={() => {
                fetchUserPets();
                setShowBookingModal(true);
              }}
            >
              🏥 Book Appointment
            </button>
          </div>
        ) : (
          <div>
            {/* Upcoming Appointments */}
            {upcoming.length > 0 && (
              <div className="appt-section reveal">
                <h2 className="appt-section-title">
                  <span style={{ color: '#10b981' }}>●</span> Upcoming ({upcoming.length})
                </h2>
                <div className="appt-list">
                  {upcoming.map(apt => {
                    const icon = TYPE_ICONS[apt.appointmentType?.toLowerCase()] || TYPE_ICONS.default;
                    const date = formatDate(apt.date);
                    return (
                      <div key={apt._id} className="appt-card-v2">
                        <div className="appt-date-box">
                          <span className="appt-month">{date.month}</span>
                          <span className="appt-day">{date.day}</span>
                          <span className="appt-weekday">{date.weekday}</span>
                        </div>
                        <div className="appt-content">
                          <div className="appt-header">
                            <div className="appt-type">
                              <span className="appt-icon">{icon}</span>
                              <span>{apt.appointmentType}</span>
                            </div>
                            <span 
                              className="appt-status" 
                              style={{ 
                                background: STATUS_COLORS[apt.status] + '20',
                                color: STATUS_COLORS[apt.status],
                                border: `1px solid ${STATUS_COLORS[apt.status]}40`
                              }}
                            >
                              {apt.status}
                            </span>
                          </div>
                          <div className="appt-pet-name">{apt.pet?.name}</div>
                          <div className="appt-details">
                            {(apt.doctor?.name || apt.doctorName) && (
                              <span>👨‍⚕️ {apt.doctor?.name || apt.doctorName}</span>
                            )}
                            {apt.timeSlot && (
                              <span>⏰ {apt.timeSlot}</span>
                            )}
                            {apt.fee && (
                              <span>💰 ৳{apt.fee}</span>
                            )}
                          </div>
                          {apt.symptoms && (
                            <div className="appt-symptoms">
                              <strong>Symptoms:</strong> {apt.symptoms}
                            </div>
                          )}
                        </div>
                        <div className="appt-actions">
                          {apt.status !== 'cancelled' && (
                            <button 
                              className="appt-btn cancel"
                              onClick={() => setShowCancelModal(apt._id)}
                            >
                              Cancel
                            </button>
                          )}
                          <button 
                            className="appt-btn view"
                            onClick={() => setShowViewModal(apt)}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Appointments */}
            {past.length > 0 && (
              <div className="appt-section reveal">
                <h2 className="appt-section-title">
                  <span style={{ color: '#6b7280' }}>●</span> Past & Completed ({past.length})
                </h2>
                <div className="appt-list">
                  {past.map(apt => {
                    const icon = TYPE_ICONS[apt.appointmentType?.toLowerCase()] || TYPE_ICONS.default;
                    const date = formatDate(apt.date);
                    return (
                      <div key={apt._id} className="appt-card-v2 past">
                        <div className="appt-date-box">
                          <span className="appt-month">{date.month}</span>
                          <span className="appt-day">{date.day}</span>
                          <span className="appt-weekday">{date.weekday}</span>
                        </div>
                        <div className="appt-content">
                          <div className="appt-header">
                            <div className="appt-type">
                              <span className="appt-icon">{icon}</span>
                              <span>{apt.appointmentType}</span>
                            </div>
                            <span 
                              className="appt-status" 
                              style={{ 
                                background: STATUS_COLORS[apt.status] + '20',
                                color: STATUS_COLORS[apt.status],
                                border: `1px solid ${STATUS_COLORS[apt.status]}40`
                              }}
                            >
                              {apt.status}
                            </span>
                          </div>
                          <div className="appt-pet-name">{apt.pet?.name}</div>
                          <div className="appt-details">
                            {(apt.doctor?.name || apt.doctorName) && (
                              <span>👨‍⚕️ {apt.doctor?.name || apt.doctorName}</span>
                            )}
                            {apt.timeSlot && (
                              <span>⏰ {apt.timeSlot}</span>
                            )}
                          </div>
                          {apt.diagnosis && (
                            <div className="appt-diagnosis">
                              <strong>✓ Diagnosis:</strong> {apt.diagnosis}
                            </div>
                          )}
                          {apt.prescription && (
                            <div className="appt-prescription">
                              <strong>💊 Prescription:</strong> {apt.prescription}
                            </div>
                          )}
                        </div>
                        <div className="appt-actions">
                          <button 
                            className="appt-btn view"
                            onClick={() => setShowViewModal(apt)}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredAppointments.length === 0 && (
              <div className="empty-state reveal">
                <span className="empty-icon">🔍</span>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No appointments found</h3>
                <p>Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Appointment Modal */}
      {showViewModal && (
        <div className="modal-overlay" onClick={() => setShowViewModal(null)}>
          <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🏥 Appointment Details</h3>
            <div style={{ marginBottom: '16px' }}>
              <strong>Pet:</strong> {showViewModal.pet?.name}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Type:</strong> {showViewModal.appointmentType}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Date:</strong> {new Date(showViewModal.date).toLocaleDateString()}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Time:</strong> {showViewModal.timeSlot}
            </div>
            {(showViewModal.doctor?.name || showViewModal.doctorName) && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Doctor:</strong> {showViewModal.doctor?.name || showViewModal.doctorName}
              </div>
            )}
            {showViewModal.symptoms && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Symptoms:</strong> {showViewModal.symptoms}
              </div>
            )}
            {showViewModal.fee && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Fee:</strong> ৳{showViewModal.fee}
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <strong>Status:</strong>{' '}
              <span style={{ 
                color: STATUS_COLORS[showViewModal.status],
                textTransform: 'capitalize'
              }}>
                {showViewModal.status}
              </span>
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowViewModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Appointment?</h3>
            <p>Are you sure you want to cancel this appointment?</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowCancelModal(null)}>Keep It</button>
              <button 
                className="btn-danger" 
                onClick={() => handleCancel(showCancelModal)}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🏥 Book New Appointment</h3>
            
            {userPets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ marginBottom: '16px' }}>You need to add a pet first before booking an appointment.</p>
                <Link to="/my-pets" className="btn-primary" style={{ textDecoration: 'none' }}>
                  + Add Pet
                </Link>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label>Select Pet *</label>
                  <select 
                    className="form-input"
                    value={bookingForm.petId}
                    onChange={(e) => setBookingForm({...bookingForm, petId: e.target.value})}
                    required
                  >
                    <option value="">Choose your pet</option>
                    {userPets.map(pet => (
                      <option key={pet._id} value={pet._id}>{pet.name} ({pet.type})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Appointment Type *</label>
                  <div className="appt-type-grid">
                    {APPOINTMENT_TYPES.map(type => (
                      <button
                        key={type.key}
                        type="button"
                        className={`appt-type-btn ${bookingForm.appointmentType === type.key ? 'active' : ''}`}
                        onClick={() => setBookingForm({...bookingForm, appointmentType: type.key})}
                      >
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Date *</label>
                    <input 
                      type="date"
                      className="form-input"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Time Slot *</label>
                    <select 
                      className="form-input"
                      value={bookingForm.timeSlot}
                      onChange={(e) => setBookingForm({...bookingForm, timeSlot: e.target.value})}
                      required
                    >
                      <option value="">Select time</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Doctor/Veterinarian</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Dr. Name (optional)"
                    value={bookingForm.doctorName}
                    onChange={(e) => setBookingForm({...bookingForm, doctorName: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Symptoms / Reason for Visit</label>
                  <textarea 
                    className="form-input"
                    rows="3"
                    placeholder="Describe symptoms or reason..."
                    value={bookingForm.symptoms}
                    onChange={(e) => setBookingForm({...bookingForm, symptoms: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Expected Fee (৳)</label>
                  <input 
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={bookingForm.fee}
                    onChange={(e) => setBookingForm({...bookingForm, fee: e.target.value})}
                  />
                </div>

                <div className="modal-actions" style={{ marginTop: '24px' }}>
                  <button type="button" className="btn-ghost" onClick={() => setShowBookingModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Book Appointment
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
