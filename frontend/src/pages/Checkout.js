// ================================
// FILE: frontend/src/pages/Checkout.js
// ================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../config/api';

// Order Slip Component for printing
const OrderSlip = ({ order, onClose }) => {
  const printSlip = () => {
    window.print();
  };

  const orderDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="order-confirmation-overlay">
      <div className="order-confirmation-modal">
        {/* Print-only slip content */}
        <div className="order-slip-print">
          <div className="slip-header">
            <h2>🐾 PawVerse Pet Shop</h2>
            <p>Order Receipt</p>
            <p className="slip-order-no">Order #: {order._id || order.orderId}</p>
            <p className="slip-date">{orderDate}</p>
          </div>

          <div className="slip-section">
            <h4>📍 Shipping Address</h4>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
            <p>📞 {order.shippingAddress?.phone}</p>
          </div>

          <div className="slip-section">
            <h4>💳 Payment</h4>
            <p>Method: {order.paymentMethod?.toUpperCase()}</p>
            <p>Status: PAID</p>
          </div>

          <div className="slip-items">
            <h4>🛒 Items</h4>
            <table className="slip-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name || item.product?.name}</td>
                    <td>{item.quantity}</td>
                    <td>৳{item.price}</td>
                    <td>৳{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="slip-totals">
            <div className="slip-row">
              <span>Subtotal:</span>
              <span>৳{order.subTotal?.toFixed(2) || order.items?.reduce((a,b)=>a+(b.price*b.quantity),0).toFixed(2)}</span>
            </div>
            <div className="slip-row">
              <span>Delivery Charge:</span>
              <span>৳{order.deliveryCharge || 50}</span>
            </div>
            <div className="slip-row grand-total">
              <span>GRAND TOTAL:</span>
              <span>৳{order.finalAmount?.toFixed(2) || (order.subTotal + (order.deliveryCharge||50)).toFixed(2)}</span>
            </div>
          </div>

          <div className="slip-footer">
            <p>Thank you for shopping with PawVerse! 🐾</p>
            <p>Questions? Contact: support@pawverse.com</p>
          </div>
        </div>

        {/* Action buttons (hidden when printing) */}
        <div className="slip-actions no-print">
          <button className="btn-primary" onClick={printSlip}>🖨️ Print Slip</button>
          <button className="btn-ghost" onClick={onClose}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    paymentMethod: 'cash'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate cart items
    const invalidItems = cart.filter(item => !item._id || !item.quantity || item.quantity < 1);
    if (invalidItems.length > 0) {
      setError('Some items in cart are invalid. Please remove and add them again.');
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          _id: item._id,
          quantity: item.quantity || 1,
          price: item.discountPrice || item.price,
          name: item.name || item.title
        })),
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod,
        deliveryCharge: 50,
        discount: 0
      };

      console.log('Sending order:', orderData); // Debug
      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        clearCart();
        // Show order confirmation with print slip
        setCompletedOrder({
          _id: response.data.data?._id || 'ORDER-' + Date.now(),
          items: orderData.items,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod,
          subTotal: getCartTotal(),
          deliveryCharge: 50,
          finalAmount: getCartTotal() + 50
        });
      }
    } catch (err) {
      console.error('Order error:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Show order confirmation modal after successful order
  if (completedOrder) {
    return (
      <div className="checkout-page">
        <OrderSlip
          order={completedOrder}
          onClose={() => navigate('/my-orders')}
        />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add products before checkout</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form">
          <h3>Shipping Address</h3>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <h3>Payment Method</h3>

          <div className="payment-methods">
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={formData.paymentMethod === 'cash'}
                onChange={handleChange}
              />
              <span>Cash on Delivery</span>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="bkash"
                checked={formData.paymentMethod === 'bkash'}
                onChange={handleChange}
              />
              <span>bKash</span>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="nagad"
                checked={formData.paymentMethod === 'nagad'}
                onChange={handleChange}
              />
              <span>Nagad</span>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={formData.paymentMethod === 'card'}
                onChange={handleChange}
              />
              <span>Card</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        <div className="order-summary">
          <h3>Order Summary</h3>

          <div className="summary-items">
            {cart.map(item => (
              <div key={item._id} className="summary-item">
                <span>{item.name} (×{item.quantity})</span>
                <span>৳{((item.discountPrice || item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>৳{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery:</span>
              <span>৳50</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total:</span>
              <span>৳{(getCartTotal() + 50).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;