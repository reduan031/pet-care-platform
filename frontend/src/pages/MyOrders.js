import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

const STATUS_CLS = {
  pending:   'status-pending',
  confirmed: 'status-confirmed',
  processing:'status-confirmed',
  shipped:   'status-confirmed',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
};

const MyOrders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-orders-page">
      <div className="container">
        <div style={{ marginBottom: '40px' }} className="reveal">
          <span className="label-tag">📦 Orders</span>
          <h1 className="display-lg">My <span className="gradient-text">Orders</span></h1>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Track and manage all your purchases.</p>
        </div>

        {loading ? (
          <div className="loading-state"><div className="loading-paw">🐾</div><div className="loading-text">Loading your orders...</div></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '10px' }}>No orders yet</h3>
            <p style={{ marginBottom: '28px' }}>Your purchase history will appear here.</p>
            <Link to="/products" className="btn-primary">🛍️ Start Shopping</Link>
          </div>
        ) : (
          <div>
            {orders.map(order => (
              <div key={order._id} className="order-card reveal">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                  <div>
                    <div className="order-id">Order #{order._id?.slice(-8)}</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                      Placed {new Date(order.orderDate).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                    </div>
                  </div>
                  <span className={`order-status ${STATUS_CLS[order.orderStatus] || ''}`}>
                    {order.orderStatus}
                  </span>
                </div>

                {/* Order items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                        📦
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.product?.name || 'Product'}</div>
                        <div style={{ color: 'var(--muted)', fontSize: '12px' }}>Qty: {item.quantity}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--violet-light)' }}>৳{item.price}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    📍 {order.shippingAddress?.street}, {order.shippingAddress?.city}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>
                    Total: <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>৳{order.finalAmount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;