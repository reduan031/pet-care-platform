import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: '', role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    
    // Simulate hitting the new /api/auth/otp/send stub on the backend
    setTimeout(() => {
      setLoading(false);
      setStep(2); // Proceed to OTP verification UI
    }, 1000);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Enter valid OTP');
      return;
    }
    setLoading(true);
    // Proceed with actual registration (backend handles the DB injection of the complex objects)
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address,
      role: formData.role,
    });
    setLoading(false);
    if (result.success) navigate('/');
    else setError(result.message);
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '560px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '50px', marginBottom: '14px' }}>🐾</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            {step === 1 ? 'Join the Pack' : 'Verify Your Email'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            {step === 1 ? 'Create your free PawVerse account' : `We sent an OTP to ${formData.email}`}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {step === 1 ? (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-field">
            <label>Full Name</label>
            <input type="text" name="name" className="form-input" placeholder="Your full name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Email Address</label>
            <input type="email" name="email" className="form-input" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label>Password</label>
              <input type="password" name="password" className="form-input" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" className="form-input" placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label>Phone (optional)</label>
              <input type="tel" name="phone" className="form-input" placeholder="+880..." value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>City / Address</label>
              <input type="text" name="address" className="form-input" placeholder="Dhaka, Bangladesh" value={formData.address} onChange={handleChange} />
            </div>
          </div>

          <div className="form-field">
            <label>Account Type</label>
            <select name="role" className="form-input" value={formData.role} onChange={handleChange} style={{ cursor: 'pointer' }}>
              <option value="user">🐾 Pet Parent (User)</option>
              <option value="seller">🏪 Seller (Sell products)</option>
              <option value="doctor">👨‍⚕️ Doctor (Veterinary services)</option>
              <option value="admin">⚠️ Admin (Restricted)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '6px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '🐾 Processing...' : '🚀 Next Step'}
          </button>
        </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-field">
              <label>Enter OTP</label>
              <input type="text" name="otp" className="form-input" placeholder="1234" value={otp} onChange={(e) => setOtp(e.target.value)} required style={{letterSpacing: '8px', fontSize: '20px', textAlign: 'center'}} maxLength="4" />
            </div>
            <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '6px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '🐾 Creating account...' : '✅ Verify & Register'}
            </button>
          </form>
        )}

        {step === 1 && (
        <p className="auth-footer-link" style={{ marginTop: '24px' }}>
          Already have an account?{' '}
          <Link to="/login">Sign in →</Link>
        </p>
        )}
      </div>
    </div>
  );
};

export default Register;