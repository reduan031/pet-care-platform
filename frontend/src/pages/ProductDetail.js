import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../config/api';
import { useAuth } from '../context/Authcontext';

const CAT_ICONS = { food:'🍖', accessory:'🎀', toy:'🎾', clothing:'👕', grooming:'✂️', medicine:'💊', default:'📦' };

const ProductDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded]       = useState(false);
  const [editForm, setEditForm] = useState(null);
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => { fetchProduct(); }, [id]); // eslint-disable-line

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.data);
      setEditForm({
        name: res.data.data.name || '',
        description: res.data.data.description || '',
        price: res.data.data.price || '',
        stock: res.data.data.stock || '',
        brand: res.data.data.brand || '',
        imageUrl: res.data.data.images?.[0] || '',
      });
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

  const isEditMode = searchParams.get('edit') === '1';
  const canManage = isAuthenticated && (user?.role === 'admin' || user?._id === product?.sellerId?._id);

  useEffect(() => {
    if (isEditMode && !isAuthenticated && !loading) navigate('/login', { replace: true });
  }, [isEditMode, isAuthenticated, loading, navigate]);

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${id}`, {
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price || 0),
        stock: Number(editForm.stock || 0),
        brand: editForm.brand,
        images: editForm.imageUrl ? [editForm.imageUrl] : [],
      });
      await fetchProduct();
      navigate(`/products/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update product');
    }
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
            {isEditMode && canManage ? (
              <div className="glass-panel" style={{ marginBottom:'22px', padding:'18px 22px' }}>
                <h3 style={{ fontSize:'16px', marginBottom:'12px' }}>Edit Product</h3>
                <form onSubmit={handleUpdateProduct}>
                  <input className="form-input" placeholder="Name" value={editForm?.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                  <textarea className="form-input" rows="3" style={{ marginTop: 10 }} placeholder="Description" value={editForm?.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required />
                  <div className="form-row-2" style={{ marginTop: 10 }}>
                    <input className="form-input" type="number" placeholder="Price" value={editForm?.price || ''} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} required />
                    <input className="form-input" type="number" placeholder="Stock" value={editForm?.stock || ''} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} required />
                  </div>
                  <input className="form-input" style={{ marginTop: 10 }} placeholder="Brand" value={editForm?.brand || ''} onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })} />
                  <input className="form-input" style={{ marginTop: 10 }} placeholder="Image URL" value={editForm?.imageUrl || ''} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} />
                  <div style={{ display:'flex', gap: 10, marginTop: 10, flexWrap:'wrap' }}>
                    <button className="btn-primary" type="submit">Save Changes</button>
                    <Link to={`/products/${id}`} className="btn-ghost">Cancel</Link>
                  </div>
                </form>
              </div>
            ) : null}

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
                {!isAuthenticated && (
                  <Link to="/login" className="btn-ghost" style={{ marginTop: 12, display:'inline-flex' }}>
                    Login to Edit
                  </Link>
                )}
                {canManage && !isEditMode && (
                  <Link to={`/products/${id}?edit=1`} className="btn-ghost" style={{ marginTop: 12, display:'inline-flex' }}>
                    Edit Product
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;