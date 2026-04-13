import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CAT_ICONS = { food:'🍖', accessory:'🎀', toy:'🎾', clothing:'👕', grooming:'✂️', medicine:'💊', default:'📦' };

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const DELIVERY = 50;

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: '80px' }}>
            <span className="empty-icon">🛒</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '12px' }}>Your cart is empty</h2>
            <p style={{ marginBottom: '28px' }}>Add some amazing products to get started!</p>
            <Link to="/products" className="btn-primary">🛍️ Shop Now</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div style={{ marginBottom: '36px' }}>
          <span className="label-tag">🛒 Cart</span>
          <h1 className="display-lg">Your <span className="gradient-text">Cart</span></h1>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>{cart.length} item{cart.length > 1 ? 's' : ''} ready for checkout</p>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items-list">
            {cart.map(item => {
              const displayPrice = item.discountPrice || item.price;
              const icon = CAT_ICONS[item.category] || CAT_ICONS.default;
              return (
                <div key={item._id} className="cart-item-card reveal">
                  <div className="cart-item-img">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} />
                    ) : (
                      <div className="cart-item-ph">{icon}</div>
                    )}
                  </div>

                  <div>
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">{item.category} · {item.petType} · ৳{displayPrice} each</div>
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="qty-controller" style={{ marginBottom: 0 }}>
                        <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                        <span className="qty-value" style={{ fontSize: '16px' }}>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                      </div>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--violet-light)', fontWeight: 700 }}>
                        ৳{(displayPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button className="cart-remove-btn" onClick={() => removeFromCart(item._id)} title="Remove">✕</button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="cart-summary-card">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>৳{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Charge</span>
              <span>৳{DELIVERY}</span>
            </div>
            <div className="summary-row">
              <span>Discount</span>
              <span style={{ color: 'var(--emerald)' }}>-৳0</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>৳{(getCartTotal() + DELIVERY).toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '14px' }}
            >
              🚀 Proceed to Checkout
            </button>
            <button
              onClick={clearCart}
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '13px' }}
            >
              Clear Cart
            </button>
            <Link
              to="/products"
              style={{ display: 'block', textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
