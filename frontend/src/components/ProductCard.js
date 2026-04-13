// ================================
// FILE: frontend/src/components/ProductCard.js
// ================================
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    alert('Product added to cart!');
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-link">
        <div className="product-image">
          {product.images && product.images[0] ? (
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <div className="product-placeholder">No Image</div>
          )}
          {hasDiscount && (
            <span className="discount-badge">
              {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
            </span>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.category} • {product.petType}</p>
          
          <div className="product-pricing">
            <span className="product-price">৳{displayPrice}</span>
            {hasDiscount && (
              <span className="product-original-price">৳{product.price}</span>
            )}
          </div>

          {product.rating && product.rating.count > 0 && (
            <div className="product-rating">
              ⭐ {product.rating.average.toFixed(1)} ({product.rating.count})
            </div>
          )}
        </div>
      </Link>

      <button onClick={handleAddToCart} className="add-to-cart-btn">
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;