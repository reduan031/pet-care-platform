// ================================
// FILE: frontend/src/pages/PetHub.js
// ================================
import React, { useState } from 'react';
import { useAuth } from '../context/Authcontext';
import api from '../config/api';

const PET_TYPES = [
  { id: 'cat', name: 'Cat', icon: '🐱', color: '#FF6B9D' },
  { id: 'dog', name: 'Dog', icon: '🐶', color: '#4ECDC4' },
  { id: 'bird', name: 'Bird', icon: '🦜', color: '#45B7D1' },
  { id: 'pigeon', name: 'Pigeon', icon: '🕊️', color: '#96CEB4' },
];

const PetHub = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [selectedPetType, setSelectedPetType] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    displayName: '',
    icon: '📦',
    description: '',
    petType: 'cat'
  });
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    images: '',
    brand: '',
    specifications: {}
  });

  const fetchCategories = async (petType) => {
    setLoading(true);
    try {
      const response = await api.get(`/categories?petType=${petType}`);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (categoryId) => {
    try {
      const response = await api.get(`/products?category=${categoryId}`);
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handlePetTypeSelect = (petType) => {
    setSelectedPetType(petType);
    setCategoryFormData({ ...categoryFormData, petType: petType });
    fetchCategories(petType);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    fetchProducts(category._id);
  };

  const handleBackToPets = () => {
    setSelectedPetType(null);
    setSelectedCategory(null);
    setCategories([]);
    setProducts([]);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setProducts([]);
  };

  const handleCategoryInputChange = (e) => {
    setCategoryFormData({ ...categoryFormData, [e.target.name]: e.target.value });
  };

  const handleProductInputChange = (e) => {
    setProductFormData({ ...productFormData, [e.target.name]: e.target.value });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, categoryFormData);
      } else {
        await api.post('/categories', categoryFormData);
      }
      fetchCategories(selectedPetType);
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryFormData({ name: '', displayName: '', icon: '📦', description: '', petType: selectedPetType });
    } catch (error) {
      console.error('Error saving category:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 401) {
        alert('Please log in to save categories');
      } else if (error.response?.status === 403) {
        alert('Only admins can save categories');
      } else {
        alert(error.response?.data?.message || `Failed to save category: ${error.message}`);
      }
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const images = productFormData.images.split(',').map(img => img.trim()).filter(img => img);
      
      await api.post('/products', {
        ...productFormData,
        category: selectedCategory.name,
        petType: selectedPetType,
        price: Number(productFormData.price),
        stock: Number(productFormData.stock),
        images,
        sellerId: user._id
      });
      
      fetchProducts(selectedCategory._id);
      setShowProductModal(false);
      setProductFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        images: '',
        brand: '',
        specifications: {}
      });
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      displayName: category.displayName,
      icon: category.icon,
      description: category.description,
      petType: category.petType
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories(selectedPetType);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const ICON_OPTIONS = ['🍽️', '🧸', '🎀', '👕', '🧼', '💊', '🏠', '🐾', '📦', '🎁', '⚡', '🌟'];

  // Pet Type Selection View
  if (!selectedPetType) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div style={{ marginBottom: '48px' }}>
            <span className="label-tag">🏠 Pet Hub</span>
            <h1 className="display-lg">Select Pet Type</h1>
            <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
              Choose a pet type to manage its categories and products
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {PET_TYPES.map((pet) => (
              <div
                key={pet.id}
                onClick={() => handlePetTypeSelect(pet.id)}
                className="glass-panel"
                style={{
                  padding: '40px 24px', borderRadius: '20px',
                  textAlign: 'center', cursor: 'pointer',
                  transition: 'transform 0.3s, border-color 0.3s',
                  border: '2px solid transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = pet.color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  background: `${pet.color}20`,
                  border: `3px solid ${pet.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '48px', margin: '0 auto 20px',
                }}>
                  {pet.icon}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, margin: 0 }}>
                  {pet.name}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '8px' }}>
                  Manage {pet.name.toLowerCase()} categories
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Category Selection View
  if (!selectedCategory) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div style={{ marginBottom: '48px' }}>
            <button
              onClick={handleBackToPets}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '16px',
              }}
            >
              ← Back to Pet Types
            </button>
            <span className="label-tag">🏠 Pet Hub</span>
            <h1 className="display-lg">
              {PET_TYPES.find(p => p.id === selectedPetType)?.icon} {PET_TYPES.find(p => p.id === selectedPetType)?.name} Categories
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
              Select a category to manage products
            </p>
          </div>

          {isAdmin && (
            <div style={{ marginBottom: '32px' }}>
              <button
                onClick={() => setShowCategoryModal(true)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                ➕ Add New Category
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '48px' }}>⏳</div>
              <p>Loading categories...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {categories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => handleCategoryClick(category)}
                  className="glass-panel"
                  style={{
                    padding: '24px', borderRadius: '16px',
                    transition: 'transform 0.3s, border-color 0.3s',
                    cursor: 'pointer',
                    border: '2px solid transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = PET_TYPES.find(p => p.id === selectedPetType)?.color;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '16px',
                      background: 'rgba(139,92,246,0.2)',
                      border: '1px solid rgba(167,139,250,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '32px',
                    }}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                        {category.displayName}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                        Click to view products →
                      </p>
                    </div>
                  </div>

                  {category.description && (
                    <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>
                      {category.description}
                    </p>
                  )}

                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditCategory(category); }}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: 'rgba(139,92,246,0.1)',
                          border: '1px solid rgba(139,92,246,0.3)',
                          borderRadius: '8px',
                          color: 'var(--violet-light)',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category._id); }}
                        style={{
                          flex: 1,
                          padding: '8px 16px',
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: '8px',
                          color: '#ef4444',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {showCategoryModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000,
            }}>
              <div className="glass-panel" style={{
                width: '90%', maxWidth: '500px', padding: '32px', borderRadius: '20px',
                maxHeight: '90vh', overflowY: 'auto',
              }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
                  {editingCategory ? '✏️ Edit Category' : '➕ Add New Category'}
                </h2>

                <form onSubmit={handleCategorySubmit}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Category Name (internal)
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={categoryFormData.name}
                      onChange={handleCategoryInputChange}
                      placeholder="e.g., cat-food"
                      required
                      style={{
                        width: '100%', padding: '12px', borderRadius: '10px',
                        border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(255,255,255,0.05)',
                        color: 'white', fontSize: '14px',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={categoryFormData.displayName}
                      onChange={handleCategoryInputChange}
                      placeholder="e.g., Cat Food"
                      required
                      style={{
                        width: '100%', padding: '12px', borderRadius: '10px',
                        border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(255,255,255,0.05)',
                        color: 'white', fontSize: '14px',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Icon
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {ICON_OPTIONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setCategoryFormData({ ...categoryFormData, icon })}
                          style={{
                            width: '48px', height: '48px', borderRadius: '10px',
                            border: categoryFormData.icon === icon ? '2px solid #8B5CF6' : '1px solid rgba(139,92,246,0.3)',
                            background: categoryFormData.icon === icon ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)',
                            fontSize: '24px', cursor: 'pointer', transition: 'all 0.2s',
                          }}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={categoryFormData.description}
                      onChange={handleCategoryInputChange}
                      placeholder="Category description..."
                      rows={3}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '10px',
                        border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(255,255,255,0.05)',
                        color: 'white', fontSize: '14px', resize: 'vertical',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1, padding: '12px 24px',
                        background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                        color: 'white', border: 'none', borderRadius: '10px',
                        fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {editingCategory ? '💾 Update' : '➕ Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryModal(false);
                        setEditingCategory(null);
                        setCategoryFormData({ name: '', displayName: '', icon: '📦', description: '', petType: selectedPetType });
                      }}
                      style={{
                        flex: 1, padding: '12px 24px',
                        background: 'rgba(255,255,255,0.1)', color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px',
                        fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Product View
  return (
    <div className="dashboard-page">
      <div className="container">
        <div style={{ marginBottom: '48px' }}>
          <button
            onClick={handleBackToCategories}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            ← Back to Categories
          </button>
          <span className="label-tag">🏠 Pet Hub</span>
          <h1 className="display-lg">
            {selectedCategory.icon} {selectedCategory.displayName}
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
            {selectedCategory.description}
          </p>
        </div>

        {isAdmin && (
          <div style={{ marginBottom: '32px' }}>
            <button
              onClick={() => setShowProductModal(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              ➕ Add Product
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {products.map((product) => (
            <div
              key={product._id}
              className="glass-panel"
              style={{
                padding: '20px', borderRadius: '16px',
                transition: 'transform 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {product.images && product.images.length > 0 && (
                <div style={{
                  width: '100%', height: '180px', borderRadius: '12px',
                  overflow: 'hidden', marginBottom: '16px',
                  background: 'rgba(139,92,246,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
                {product.name}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: '1.4' }}>
                {product.description?.substring(0, 100)}...
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#8B5CF6' }}>
                  ${product.price}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Stock: {product.stock}
                </span>
              </div>
            </div>
          ))}
        </div>

        {showProductModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div className="glass-panel" style={{
              width: '90%', maxWidth: '500px', padding: '32px', borderRadius: '20px',
              maxHeight: '90vh', overflowY: 'auto',
            }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
                ➕ Add New Product
              </h2>

              <form onSubmit={handleProductSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productFormData.name}
                    onChange={handleProductInputChange}
                    placeholder="e.g., Premium Cat Food"
                    required
                    style={{
                      width: '100%', padding: '12px', borderRadius: '10px',
                      border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(255,255,255,0.05)',
                      color: 'white', fontSize: '14px',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={productFormData.description}
                    onChange={handleProductInputChange}
                    placeholder="Product description..."
                    rows={3}
                    required
                    style={{
                      width: '100%', padding: '12px', borderRadius: '10px',
                      border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(255,255,255,0.05)',
                      color: 'white', fontSize: '14px', resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={productFormData.price}
                      onChange={handleProductInputChange}
                      placeholder="0.00"
                      required
                      style={{
                        width: '100%', padding: '12px', borderRadius: '10px',
                        border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(255,255,255,0.05)',
                        color: 'white', fontSize: '14px',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={productFormData.stock}
                      onChange={handleProductInputChange}
                      placeholder="0"
                      required
                      style={{
                        width: '100%', padding: '12px', borderRadius: '10px',
                        border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(255,255,255,0.05)',
                        color: 'white', fontSize: '14px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={productFormData.brand}
                    onChange={handleProductInputChange}
                    placeholder="e.g., Purina"
                    style={{
                      width: '100%', padding: '12px', borderRadius: '10px',
                      border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(255,255,255,0.05)',
                      color: 'white', fontSize: '14px',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Image URLs (comma-separated)
                  </label>
                  <textarea
                    name="images"
                    value={productFormData.images}
                    onChange={handleProductInputChange}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    rows={2}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '10px',
                      border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(255,255,255,0.05)',
                      color: 'white', fontSize: '14px', resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1, padding: '12px 24px',
                      background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                      color: 'white', border: 'none', borderRadius: '10px',
                      fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    ➕ Add Product
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      setProductFormData({
                        name: '',
                        description: '',
                        price: '',
                        stock: '',
                        images: '',
                        brand: '',
                        specifications: {}
                      });
                    }}
                    style={{
                      flex: 1, padding: '12px 24px',
                      background: 'rgba(255,255,255,0.1)', color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px',
                      fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetHub;
