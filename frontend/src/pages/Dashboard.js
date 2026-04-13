import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';

const QUICK_LINKS = [
  { to: '/my-pets',      icon: '🐾', title: 'My Pets',      desc: 'Manage your beloved companions' },
  { to: '/my-orders',    icon: '📦', title: 'My Orders',     desc: 'Track your order history' },
  { to: '/appointments', icon: '📅', title: 'Appointments',  desc: 'View vet appointments' },
  { to: '/products?from=dashboard', icon: '🛍️', title: 'Shop',          desc: 'Browse premium products' },
  { to: '/marketplace-pro?from=dashboard', icon: '🏪', title: 'Marketplace',   desc: 'Sell, Pet boarding, and adopt by location' },
  { to: '/pet-social?from=dashboard', icon: '📱', title: 'Pet Social',    desc: 'Connect, share, and discover with pet lovers' },
  { to: '/cart',         icon: '🛒', title: 'Cart',          desc: 'View your shopping cart' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Pet Parent';
  const links = user?.role === 'admin'
    ? [
        { to: '/admin', icon: '🛡️', title: 'Admin Panel', desc: 'Manage platform modules and approvals' },
        ...QUICK_LINKS,
      ]
    : QUICK_LINKS;

  React.useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [user]);

  return (
    <div className="dashboard-page">
      <div className="container">
        <div style={{ marginBottom: '48px' }} className="reveal">
          <span className="label-tag">👤 Dashboard</span>
          <h1 className="display-lg">
            Welcome back, <span className="accent-cursive">{firstName}!</span>
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
            Manage your pets, orders, and appointments all in one place.
          </p>
        </div>

        {/* User card */}
        <div className="glass-panel reveal" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', flexShrink: 0,
            boxShadow: '0 8px 24px rgba(139,92,246,0.4)'
          }}>
            🐾
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>{user?.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>{user?.email}</div>
            {user?.phone && <div style={{ color: 'var(--muted)', fontSize: '14px' }}>{user.phone}</div>}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className="label-tag" style={{ marginBottom: 0 }}>
              {user?.role === 'admin' ? '👑 Admin' : '🐾 Pet Parent'}
            </span>
          </div>
        </div>

        {/* Quick links grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="glass-panel reveal"
              style={{
                display: 'flex', alignItems: 'center', gap: '18px',
                textDecoration: 'none', color: 'inherit',
                transition: 'transform 0.3s, border-color 0.3s',
                cursor: 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '15px',
                background: 'rgba(139,92,246,0.2)',
                border: '1px solid rgba(167,139,250,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px', flexShrink: 0,
              }}>
                {link.icon}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}>{link.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '3px' }}>{link.desc}</div>
              </div>
              <div style={{ marginLeft: 'auto', color: 'var(--violet-light)', fontSize: '18px' }}>→</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;