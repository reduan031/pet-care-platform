import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active-link' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">🐾</div>
          PawVerse
        </Link>

        {/* Links */}
        <div className="nav-links">
          <Link to="/products" className={isActive('/products')}>Shop</Link>
          <Link to="/marketplace-pro" className={isActive('/marketplace-pro')}>Marketplace</Link>
          <Link to="/pet-social" className={isActive('/pet-social')}>Pet Social</Link>
          <Link to="/pet-hub" className="nav-link">Pet Hub</Link>
          <Link to="/#services" className="nav-link">Services</Link>
          <Link to="/appointments" className={isActive('/appointments')}>Veterinary</Link>
          <Link to="/lost-found" className={isActive('/lost-found')}>Lost & Found</Link>
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>
          )}
          {isAuthenticated && (
            <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
          )}
        </div>

        {/* Actions */}
        <div className="nav-actions">
          <Link to="/cart" className="nav-cart-btn">
            🛒 Cart
            {getCartCount() > 0 && (
              <span className="nav-cart-count">{getCartCount()}</span>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-user-btn">
                👤 {user?.name?.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="nav-logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-user-btn">Login</Link>
              <Link to="/register" className="btn-join-pack">🐾 Join the Pack</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
