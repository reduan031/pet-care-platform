import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/Authcontext';
import { CartProvider } from './context/CartContext';
import { ChatProvider } from './context/ChatContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import PetMarketplace from './pages/PetMarketplace';
import PetDetail from './pages/Petdetail';
import MyPets from './pages/MyPets';
import Appointments from './pages/Appointments';
import Dashboard from './pages/Dashboard';
import LostFoundPage from './pages/LostFoundPage';
import ProtectedRoute from './components/Protectedroute';
import AdminRoute from './components/AdminRoute';
import AIChatWidget from './components/AIChatWidget';
import ChatButton from './components/ChatButton';
import AdminPanel from './pages/AdminPanel';
import PetHub from './pages/PetHub';
import MarketplaceHub from './pages/MarketplaceHub';
import PetSocial from './pages/PetSocial';

import './App.css';

/* ── Background Canvas (animated orbs + pet silhouettes) ── */
function BgCanvas() {
  return (
    <div className="bg-canvas">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />
      <div className="bg-orb orb-4" />
      <div className="bg-orb orb-5" />
      {/* Floating pet silhouettes */}
      <div className="pet-sil" style={{ top: '8%', left: '4%', animationDuration: '14s' }}>🐾</div>
      <div className="pet-sil" style={{ top: '62%', right: '6%', animationDuration: '18s', animationDelay: '-5s', fontSize: '64px' }}>🐱</div>
      <div className="pet-sil" style={{ bottom: '14%', left: '22%', animationDuration: '16s', animationDelay: '-8s', fontSize: '70px' }}>🦜</div>
      <div className="pet-sil" style={{ top: '35%', right: '18%', animationDuration: '20s', animationDelay: '-3s', fontSize: '56px' }}>🐶</div>
    </div>
  );
}

/* ── Custom Paw Cursor ── */
function PawCursor() {
  useEffect(() => {
    const paw = document.getElementById('paw-cursor');
    if (!paw) return;
    
    const move = (e) => {
      paw.style.left = `${e.clientX}px`;
      paw.style.top = `${e.clientY}px`;
    };

    const addCta = () => paw.classList.add('cursor-cta');
    const remCta = () => paw.classList.remove('cursor-cta');

    const setupCtaListeners = () => {
      const ctaEls = document.querySelectorAll('a, button, .clickable, select, input[type="submit"], input[type="button"]');
      ctaEls.forEach(el => {
        el.removeEventListener('mouseenter', addCta);
        el.removeEventListener('mouseleave', remCta);
        el.addEventListener('mouseenter', addCta);
        el.addEventListener('mouseleave', remCta);
      });
    };

    window.addEventListener('mousemove', move);
    
    // Initial setup
    setupCtaListeners();
    
    // Observer for dynamic content
    const observer = new MutationObserver(() => setupCtaListeners());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', move);
      observer.disconnect();
    };
  }, []);

  return (
    <div id="paw-cursor">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="18" r="9" fill="#A78BFA" />
        <circle cx="10" cy="10" r="3.5" fill="#A78BFA" />
        <circle cx="16" cy="7.5" r="3.5" fill="#A78BFA" />
        <circle cx="22" cy="10" r="3.5" fill="#A78BFA" />
        <circle cx="6.5" cy="15" r="3" fill="#A78BFA" />
        <circle cx="25.5" cy="15" r="3" fill="#A78BFA" />
      </svg>
    </div>
  );
}

/* ── Loading Screen ── */
function Loader() {
  useEffect(() => {
    const loader = document.getElementById('paw-loader');
    const onLoad = () => {
      setTimeout(() => {
        if (loader) loader.classList.add('loader-gone');
      }, 1800);
    };
    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  return (
    <div id="paw-loader">
      <div className="loader-dog-walk">🐕</div>
      <div className="loader-brand">PawVerse</div>
      <div className="loader-bar-wrap">
        <div className="loader-bar-fill" />
      </div>
      <div className="loader-text">Preparing your pet paradise...</div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ChatProvider>
            {/* Global UI layers */}
            <BgCanvas />
            <PawCursor />
            <Loader />
            <AIChatWidget />

            <div className="App">
              <Navbar />
              <Routes>
                <Route path="/"              element={<Home />} />
                <Route path="/login"         element={<Login />} />
                <Route path="/register"      element={<Register />} />
                <Route path="/products"      element={<Products />} />
                <Route path="/products/:id"  element={<ProductDetail />} />
                <Route path="/pets"          element={<PetMarketplace />} />
                <Route path="/pets/:id"      element={<PetDetail />} />
                <Route path="/cart"          element={<Cart />} />
                <Route path="/lost-found"    element={<LostFoundPage />} />
                <Route path="/checkout"      element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/my-orders"     element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/my-pets"       element={<ProtectedRoute><MyPets /></ProtectedRoute>} />
                <Route path="/appointments"  element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
                <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/admin"         element={<AdminRoute><AdminPanel /></AdminRoute>} />
                <Route path="/pet-hub"       element={<ProtectedRoute><PetHub /></ProtectedRoute>} />
                <Route path="/marketplace-pro" element={<MarketplaceHub />} />
                <Route path="/pet-social" element={<PetSocial />} />
              </Routes>
            </div>
            
            {/* Global Chat Button */}
            <ChatButton />
          </ChatProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
