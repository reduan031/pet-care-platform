import React, { useState, useEffect } from 'react';
import api from '../config/api';

const STATUS_CLS = {
  scheduled: 'status-confirmed',
  completed: 'status-delivered',
  cancelled: 'status-cancelled',
  pending:   'status-pending',
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

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);

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

  return (
    <div className="appointments-page">
      <div className="container">
        <div style={{ marginBottom: '40px' }} className="reveal">
          <span className="label-tag">📅 Veterinary</span>
          <h1 className="display-lg">My <span className="gradient-text">Appointments</span></h1>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>All your scheduled vet visits in one place.</p>
        </div>

        {loading ? (
          <div className="loading-state"><div className="loading-paw">🐾</div><div className="loading-text">Loading appointments...</div></div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '10px' }}>No appointments yet</h3>
            <p>Schedule your first vet visit for your beloved pet.</p>
          </div>
        ) : (
          <div>
            {appointments.map(apt => {
              const icon = TYPE_ICONS[apt.appointmentType?.toLowerCase()] || TYPE_ICONS.default;
              return (
                <div key={apt._id} className="appt-card reveal">
                  <div className="appt-icon-wrap">{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700 }}>
                        {apt.pet?.name} — {apt.appointmentType}
                      </div>
                      <span className={`order-status ${STATUS_CLS[apt.status] || ''}`}>{apt.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                      {[
                        { label: '👨‍⚕️ Doctor',  val: apt.doctor?.name },
                        { label: '📅 Date',    val: apt.date ? new Date(apt.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : null },
                        { label: '⏰ Time',    val: apt.timeSlot },
                        { label: '💰 Fee',     val: apt.fee ? `৳${apt.fee}` : null },
                      ].filter(f => f.val).map(f => (
                        <div key={f.label} style={{ fontSize: '13px', color: 'var(--muted)' }}>
                          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{f.label}:</span> {f.val}
                        </div>
                      ))}
                    </div>
                    {apt.symptoms && (
                      <div style={{ marginTop: '10px', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', color: 'var(--muted)' }}>
                        <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Symptoms:</strong> {apt.symptoms}
                      </div>
                    )}
                    {apt.diagnosis && (
                      <div style={{ marginTop: '8px', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--muted)' }}>
                        <strong style={{ color: 'var(--emerald)' }}>✓ Diagnosis:</strong> {apt.diagnosis}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
