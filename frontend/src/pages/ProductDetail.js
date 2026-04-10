import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartC/ontext';
import api from '../config/api';

const CAT_ICONS = { food:'🍖', accessory:'🎀', toy:'🎾', clothing:'👕', grooming:'✂️', medicine:'💊', default:'📦' };

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded]       = useState(false);
  const { addToCart } = useCart();

  useEffect(() => { fetchProduct(); }, [id]); // eslint-disable-line

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="detail-page"><div className="container">
      <div className="loading-state"><div className="loading-paw">🐾</div><div className="loading-text">Loading product...</div></div>
    </div></div>
  );
  if (!product) return (
    <div className="detail-page"><div className="container">
      <div className="empty-state"><span className="empty-icon">📦</span><p>Product not found.</p><Link to="/products" className="btn-primary" style={{marginTop:'20px', display:'inline-flex'}}>← Back to Shop</Link></div>
    </div></div>
  );

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount  = product.discountPrice && product.discountPrice < product.price;
  const discPct      = hasDiscount ? Math.round((1 - product.discountPrice/product.price)*100) : 0;
  const icon         = CAT_ICONS[product.category] || CAT_ICONS.default;

  return (
    <div className="detail-page">
      <div className="container">
        <Link to="/products" className="btn-ghost" style={{ display:'inline-flex', marginBottom:'28px', padding:'10px 20px' }}>← Back to Shop</Link>

        <div className="detail-layout reveal">
          {/* Image */}
          <div className="detail-img-wrap">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} />
            ) : (
              <div className="detail-img-ph">{icon}</div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <div className="detail-meta-tags">
              <span className="detail-tag">{product.category}</span>
              {product.petType && <span className="detail-tag">{product.petType}</span>}
              {product.brand   && <span className="detail-tag">{product.brand}</span>}
              {hasDiscount     && <span className="detail-tag" style={{ background:'rgba(244,63,94,0.18)', borderColor:'rgba(244,63,94,0.35)', color:'#FDA4AF' }}>-{discPct}% OFF</span>}
            </div>

            <h1>{product.name}</h1>

            {product.rating?.count > 0 && (
              <p style={{ color:'var(--amber)', marginBottom:'12px' }}>
                ⭐ {product.rating.average?.toFixed(1)} <span style={{ color:'var(--muted)', fontWeight:400 }}>({product.rating.count} reviews)</span>
              </p>
            )}

            <div className="detail-price">
              ৳{displayPrice}
              {hasDiscount && (
                <span style={{ fontSize:'20px', color:'rgba(255,255,255,0.35)', textDecoration:'line-through', marginLeft:'14px', fontWeight:400 }}>৳{product.price}</span>
              )}
            </div>

            <p className="detail-desc">{product.description}</p>

            <p style={{ marginBottom:'20px', fontSize:'14px' }}>
              {product.stock > 0
                ? <span style={{ color:'var(--emerald)', fontWeight:600 }}>✓ In Stock ({product.stock} available)</span>
                : <span style={{ color:'var(--rose)', fontWeight:600 }}>✗ Out of Stock</span>}
            </p>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="glass-panel" style={{ marginBottom:'22px', padding:'18px 22px' }}>
                <h3 style={{ fontSize:'16px', marginBottom:'12px' }}>Specifications</h3>
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', fontSize:'14px' }}>
                    <span style={{ color:'var(--muted)' }}>{k}</span>
                    <span style={{ fontWeight:500 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="qty-controller">
              <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q-1))}>−</button>
              <span className="qty-value">{quantity}</span>
              <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stock, q+1))} disabled={quantity >= product.stock}>+</button>
            </div>

            <div className="detail-actions">
              <button
                className="btn-primary"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{ flex:1, justifyContent:'center', opacity: product.stock === 0 ? 0.5 : 1 }}
              >
                {added ? '✓ Added!' : '🛒 Add to Cart'}
              </button>
              <Link to="/cart" className="btn-ghost" style={{ padding:'15px 22px' }}>View Cart</Link>
            </div>

            {product.sellerId && (
              <div className="glass-panel" style={{ marginTop:'28px', padding:'20px' }}>
                <h3 style={{ fontSize:'15px', marginBottom:'14px' }}>🏪 Seller Info</h3>
                <p style={{ fontSize:'14px', color:'var(--muted)', marginBottom:'6px' }}><strong style={{ color:'#fff' }}>Name:</strong> {product.sellerId.name}</p>
                <p style={{ fontSize:'14px', color:'var(--muted)', marginBottom:'6px' }}><strong style={{ color:'#fff' }}>Email:</strong> {product.sellerId.email}</p>
                {product.sellerId.phone && <p style={{ fontSize:'14px', color:'var(--muted)' }}><strong style={{ color:'#fff' }}>Phone:</strong> {product.sellerId.phone}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;