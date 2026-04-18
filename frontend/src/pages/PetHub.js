// ================================
// FILE: frontend/src/pages/PetHub.js
// ================================
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/Authcontext';
import { useLocation } from 'react-router-dom';
import api from '../config/api';

const PET_TYPES = [
  { id: 'dog', name: 'Dog', icon: '🐶', color: '#4ECDC4' },
  { id: 'cat', name: 'Cat', icon: '🐱', color: '#FF6B9D' },
  { id: 'bird', name: 'Bird', icon: '🦜', color: '#45B7D1' },
  { id: 'fish', name: 'Fish', icon: '🐠', color: '#FFE66D' },
  { id: 'rabbit', name: 'Rabbit', icon: '🐰', color: '#96CEB4' },
  { id: 'horse', name: 'Horse', icon: '🐴', color: '#8B4513' }
];

const CATEGORIES = [
  { id: 'food', displayName: 'Food', icon: '🍽️', description: 'Premium nutrition for your pet' },
  { id: 'accessories', displayName: 'Accessories', icon: '🎀', description: 'Collars, beds, leashes, and more' },
  { id: 'pharmacy', displayName: 'Pharmacy / Medicine', icon: '💊', description: 'Dewormers, vitamins, first aid' },
  { id: 'grooming', displayName: 'Grooming', icon: '🧼', description: 'Grooming supplies for your pet' },
  { id: 'housing', displayName: 'Housing / Bedding', icon: '🏠', description: 'Homes, cages, tanks, bedding' },
  { id: 'toys', displayName: 'Toys', icon: '�', description: 'Fun and engaging toys' },
  { id: 'training', displayName: 'Training', icon: '🎓', description: 'Pads, clickers, sprays' },
  { id: 'health', displayName: 'Health & Wellness', icon: '💪', description: 'Supplements, dental care, wellness' }
];

const SERVICES = [
  { id: 'boarding', name: 'Pet Boarding', icon: '🏨', description: 'Safe and comfortable boarding for your pets' },
  { id: 'grooming', name: 'Pet Grooming', icon: '✂️', description: 'Professional grooming services' },
  { id: 'training', name: 'Pet Training', icon: '🎓', description: 'Expert training for your pets' },
  { id: 'veterinary', name: 'Veterinary Care', icon: '🏥', description: 'Healthcare and medical services' },
  { id: 'walking', name: 'Pet Walking', icon: '�', description: 'Daily walking services' },
  { id: 'sitting', name: 'Pet Sitting', icon: '👤', description: 'In-home pet sitting' },
];

const PetHub = () => {
  const { user } = useAuth();
  const location = useLocation();
  const fromDashboard = new URLSearchParams(location.search).get('from') === 'dashboard';
  const canEdit = fromDashboard && (user?.role === 'seller' || user?.role === 'admin');

  const [selectedPetType, setSelectedPetType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    images: '',
    imageFiles: [],
    brand: ''
  });
  const hasProcessedUrlParam = useRef(false);

  const fetchCategories = async (petType) => {
    setLoading(true);
    try {
      const response = await api.get(`/categories?petType=${petType}`);
      const categoriesData = response.data.data;
      
      // If API returns empty array, use fallback categories
      if (!categoriesData || categoriesData.length === 0) {
        const fallbackCats = CATEGORIES.map(cat => ({
          _id: `${petType}-${cat.id}`,
          name: `${petType}-${cat.id}`,
          displayName: cat.displayName,
          icon: cat.icon,
          description: cat.description,
          petType: petType
        }));
        setCategories(fallbackCats);
      } else {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      const fallbackCats = CATEGORIES.map(cat => ({
        _id: `${petType}-${cat.id}`,
        name: `${petType}-${cat.id}`,
        displayName: cat.displayName,
        icon: cat.icon,
        description: cat.description,
        petType: petType
      }));
      setCategories(fallbackCats);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (petType, categoryName) => {
    try {
      const categoryId = `${petType}-${categoryName}`;
      const response = await api.get(`/products?petType=${petType}&category=${categoryId}`);
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const handlePetTypeSelect = (petType) => {
    setSelectedPetType(petType);
    setSelectedCategory(null);
    setSelectedService(null);
    setProducts([]);
    fetchCategories(petType);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedService(null);
    fetchProducts(selectedPetType, category.name.split('-')[1]);
  };

  const handleCategoryAdd = (category, e) => {
    e.stopPropagation(); // Prevent triggering the card click
    setSelectedCategory(category);
    setSelectedService(null);
    setEditingProduct(null);
    resetProductForm();
    setShowProductModal(true);
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setSelectedCategory(null);
    setProducts([]);
  };

  const handleBackToPets = () => {
    setSelectedPetType(null);
    setSelectedCategory(null);
    setSelectedService(null);
    setCategories([]);
    setProducts([]);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedService(null);
    setProducts([]);
  };

  // Handle URL parameter for auto-selecting pet type
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const typeParam = urlParams.get('type');
    if (typeParam && !hasProcessedUrlParam.current) {
      const petType = PET_TYPES.find(p => p.id === typeParam);
      if (petType) {
        hasProcessedUrlParam.current = true;
        setSelectedPetType(petType.id);
        setSelectedCategory(null);
        setSelectedService(null);
        setProducts([]);
        fetchCategories(petType.id);
      }
    }
  }, [location.search]);

  const handleProductInputChange = (e) => {
    setProductFormData({ ...productFormData, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files);
    setProductFormData({ ...productFormData, imageFiles: files });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Product form data:', productFormData);
    console.log('User:', user);
    console.log('Selected pet type:', selectedPetType);
    console.log('Selected category:', selectedCategory);
    console.log('Can edit:', canEdit);
    
    // Validate required fields
    if (!productFormData.name || !productFormData.name.trim()) {
      alert('Product name is required');
      return;
    }
    if (!productFormData.description || !productFormData.description.trim()) {
      alert('Description is required');
      return;
    }
    if (!productFormData.price || Number(productFormData.price) <= 0) {
      alert('Price is required and must be greater than 0');
      return;
    }
    if (!productFormData.stock || Number(productFormData.stock) < 0) {
      alert('Stock is required and must be 0 or greater');
      return;
    }
    
    if (!user || !user._id) {
      alert('You must be logged in to add products');
      return;
    }
    
    if (user.role !== 'seller' && user.role !== 'admin') {
      alert('You must be logged in as a seller or admin to add products');
      return;
    }
    
    try {
      let images = [];
      
      if (productFormData.imageFiles && productFormData.imageFiles.length > 0) {
        const filePromises = productFormData.imageFiles.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        });
        
        images = await Promise.all(filePromises);
      } else if (productFormData.images) {
        images = productFormData.images.split(',').map(img => img.trim()).filter(img => img);
      }

      const categoryId = `${selectedPetType}-${selectedCategory.name.split('-')[1]}`;
      
      const productData = {
        name: productFormData.name,
        description: productFormData.description,
        price: Number(productFormData.price),
        stock: Number(productFormData.stock),
        brand: productFormData.brand,
        category: categoryId,
        petType: selectedPetType,
        images,
        sellerId: user._id
      };
      
      console.log('Sending product data:', productData);

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productData);
      } else {
        await api.post('/products', productData);
      }
      
      fetchProducts(selectedPetType, selectedCategory.name.split('-')[1]);
      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || error.message || 'Failed to save product';
      const errorDetails = errorData?.details;
      
      let alertMessage = `Error: ${errorMessage}`;
      if (errorDetails) {
        alertMessage += `\nDetails: ${JSON.stringify(errorDetails)}`;
      }
      
      if (errorMessage.includes('Not authorized') || errorMessage.includes('403')) {
        alert('You must be logged in as a seller or admin to add products');
      } else if (errorMessage.includes('401')) {
        alert('You must be logged in to add products');
      } else {
        alert(alertMessage);
      }
    }
  };

  const resetProductForm = () => {
    setProductFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      images: '',
      imageFiles: [],
      brand: ''
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      images: product.images?.join(', '),
      imageFiles: [],
      brand: product.brand || ''
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${id}`);
      fetchProducts(selectedPetType, selectedCategory.name.split('-')[1]);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  // Pet Type Selection View
  if (!selectedPetType) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div style={{ marginBottom: '48px' }}>
            <span className="label-tag">🏠 Pet Hub</span>
            <h1 className="display-lg">Select Pet Type</h1>
            <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
              Choose a pet type to browse products and services
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
                  View {pet.name.toLowerCase()} products and services
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Category and Service Selection View
  if (!selectedCategory && !selectedService) {
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
              {PET_TYPES.find(p => p.id === selectedPetType)?.icon} {PET_TYPES.find(p => p.id === selectedPetType)?.name} Products & Services
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
              Select a category or service to browse
            </p>
          </div>

          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
              📦 Product Categories
            </h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: '48px' }}>⏳</div>
                <p>Loading categories...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {categories.map((category) => (
                  <div
                    key={category._id || category.name}
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

                    {canEdit && (
                      <button
                        onClick={(e) => handleCategoryAdd(category, e)}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          width: '100%',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        ➕ Add Product
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Services Section */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
              🛠️ Services
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {SERVICES.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className="glass-panel"
                  style={{
                    padding: '24px', borderRadius: '16px',
                    transition: 'transform 0.3s',
                    cursor: 'pointer',
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
                      {service.icon}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                        {service.name}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                        Click to view services →
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Product or Service View
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
            ← Back to Categories & Services
          </button>
          <span className="label-tag">🏠 Pet Hub</span>
          <h1 className="display-lg">
            {selectedCategory ? selectedCategory.icon : selectedService?.icon} {selectedCategory ? selectedCategory.displayName : selectedService?.name}
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '10px' }}>
            {selectedCategory ? selectedCategory.description : selectedService?.description}
          </p>
        </div>

        {selectedCategory && canEdit && (
          <div style={{ marginBottom: '32px' }}>
            <button
              onClick={() => {
                setEditingProduct(null);
                resetProductForm();
                setShowProductModal(true);
              }}
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

        {selectedService ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>
              {selectedService.icon}
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>
              {selectedService.name}
            </h3>
            <p style={{ color: 'var(--muted)' }}>
              Services will be available soon! Check back later.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>No products yet</h3>
            <p style={{ color: 'var(--muted)' }}>
              {canEdit 
                ? "Add some products to get started!" 
                : "Check back later for products in this category!"}
            </p>
          </div>
        ) : (
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
                  {product.description?.substring(0, 100)}{product.description?.length > 100 ? '...' : ''}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: canEdit ? '12px' : '0' }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#8B5CF6' }}>
                    ${product.price}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Stock: {product.stock}
                  </span>
                </div>

                {canEdit && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditProduct(product)}
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
                      onClick={() => handleDeleteProduct(product._id)}
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
                {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
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
                    placeholder="e.g., Premium Dog Food"
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
                    Upload Product Images
                  </label>
                  <input
                    type="file"
                    name="imageFiles"
                    onChange={handleImageFileChange}
                    accept="image/*"
                    multiple
                    style={{
                      width: '100%', padding: '12px', borderRadius: '10px',
                      border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(255,255,255,0.05)',
                      color: 'white', fontSize: '14px',
                    }}
                  />
                  {productFormData.imageFiles && productFormData.imageFiles.length > 0 && (
                    <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--muted)' }}>
                      {productFormData.imageFiles.length} file(s) selected
                    </div>
                  )}
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
                    {editingProduct ? '💾 Update' : '➕ Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      setEditingProduct(null);
                      resetProductForm();
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
