import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '52px', marginBottom: '14px' }}>🐾</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 700, marginBottom: '8px' }}>
            Welcome Back
          </h1>
          <p className="auth-sub" style={{ fontSize: '14px', color: 'var(--muted)' }}>
            Sign in to your PawVerse account
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '6px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '🐾 Signing in...' : '🚀 Sign In'}
          </button>
        </form>

        <p className="auth-footer-link" style={{ marginTop: '24px' }}>
          New to PawVerse?{' '}
          <Link to="/register">Create your account →</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
