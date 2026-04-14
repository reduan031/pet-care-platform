// ================================
// FILE: frontend/src/pages/PetHub.js
// ================================
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/Authcontext';
import api from '../config/api';

const PetHub = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    icon: '📦',
    description: '',
    petType: 'all'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      fetchCategories();
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', displayName: '', icon: '📦', description: '', petType: 'all' });
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      displayName: category.displayName,
      icon: category.icon,
      description: category.description,
      petType: category.petType
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', displayName: '', icon: '📦', description: '', petType: 'all' });
  };

  const ICON_OPTIONS = ['🍽️', '🧸', '🎀', '👕', '🧼', '💊', '🏠', '🐾', '📦', '🎁', '⚡', '🌟'];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{ fontSize: '48px' }}>⏳</div>
            <p>Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div style={{ marginBottom: '48px' }}>
          <span className="label-tag">🏠 Pet Hub</span>
          <h1 className="display-lg">Product Categories</h1>
          <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
            Manage product categories for your pet shop
          </p>
        </div>

        {isAdmin && (
          <div style={{ marginBottom: '32px' }}>
            <button
              onClick={() => setShowModal(true)}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {categories.map((category) => (
            <div
              key={category._id}
              className="glass-panel"
              style={{
                padding: '24px',
                borderRadius: '16px',
                transition: 'transform 0.3s, border-color 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
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
                    {category.petType === 'all' ? 'All Pets' : category.petType}
                  </p>
                </div>
              </div>

              {category.description && (
                <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>
                  {category.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => handleEdit(category)}
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
                      onClick={() => handleDelete(category._id)}
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
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {showModal && (
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

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Category Name (internal)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
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
                    value={formData.displayName}
                    onChange={handleInputChange}
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
                        onClick={() => setFormData({ ...formData, icon })}
                        style={{
                          width: '48px', height: '48px', borderRadius: '10px',
                          border: formData.icon === icon ? '2px solid #8B5CF6' : '1px solid rgba(139,92,246,0.3)',
                          background: formData.icon === icon ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.05)',
                          fontSize: '24px', cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Pet Type
                  </label>
                  <select
                    name="petType"
                    value={formData.petType}
                    onChange={handleInputChange}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '10px',
                      border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(255,255,255,0.05)',
                      color: 'white', fontSize: '14px',
                    }}
                  >
                    <option value="all">All Pets</option>
                    <option value="cat">Cat</option>
                    <option value="dog">Dog</option>
                    <option value="bird">Bird</option>
                    <option value="pigeon">Pigeon</option>
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
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
                    onClick={handleCloseModal}
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
