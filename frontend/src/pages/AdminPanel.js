import React from 'react';
import { useEffect, useState } from 'react';
import api from '../config/api';

const ACCESS_MATRIX = [
  ['Dashboard Analytics', 'Full Read/Write'],
  ['User Management', 'Create/Edit/Delete/Suspend'],
  ['Pet Profiles', 'View/Edit/Delete'],
  ['Marketplace Products', 'Add/Edit/Delete/Approve'],
  ['Food Products', 'Add/Edit/Delete'],
  ['Accessories', 'Add/Edit/Delete'],
  ['Clothing', 'Add/Edit/Delete'],
  ['Grooming Products', 'Add/Edit/Delete'],
  ['Pharmacy/Medicine', 'Add/Edit/Delete'],
  ['Toys', 'Add/Edit/Delete'],
  ['Veterinary Doctors', 'Add/Edit/Delete/Verify'],
  ['Caretakers', 'Add/Edit/Delete/Verify'],
  ['Boarding Centers', 'Add/Edit/Delete/Verify'],
  ['Breeding Listings', 'Moderate'],
  ['Adoption Listings', 'Moderate'],
  ['Lost & Found Posts', 'Moderate'],
  ['AI Assistant Content', 'Edit/Update'],
  ['Reminder Templates', 'Create/Edit'],
  ['Payment Transactions', 'View/Refund'],
  ['Reports', 'Generate/Export'],
];

const WORKFLOWS = [
  {
    title: 'Marketplace Product Publish',
    steps: [
      'Login to Admin Panel -> Marketplace -> Add Product',
      'Select category: Pet/Food/Accessories/Clothing/Grooming/Pharmacy/Toys',
      'Fill details: Name, Description, Price (BDT), Stock, Brand, Age Category, Nutrition Type (for food), Images (max 5)',
      'Set Seller Info (platform seller or existing seller)',
      'Publish -> product goes live',
    ],
  },
  {
    title: 'Shop Item Publish',
    steps: [
      'Admin Panel -> Shop Management -> Add Shop Item',
      'Select shop type: Food Store/Accessories Store/Pet Store/Pharmacy',
      'Enter title, category/subcategory, regular/discount price, weight/size, expiry date (food/medicine), tags',
      'Upload product images',
      'Set stock status and save',
    ],
  },
  {
    title: 'Add Veterinary Doctor',
    steps: [
      'Admin Panel -> Veterinary -> Add Doctor',
      'Provide name, photo, specialization, chamber address + GPS, consultation fee, schedule, phone, email',
      'Upload degree/certificate',
      'Set verification status and save',
    ],
  },
  {
    title: 'Add Caretaker',
    steps: [
      'Admin Panel -> Pet Care Services -> Add Caretaker',
      'Fill profile: name, location (GPS), daily price, available slots, experience, services',
      'Upload verification documents',
      'Approve/Reject for booking visibility',
    ],
  },
  {
    title: 'Manage Users',
    steps: [
      'Admin Panel -> Users -> All Users',
      'Search by name/email/phone',
      'View profile and pet profiles',
      'Edit, suspend (with reason), delete, reset password, or view transaction history',
    ],
  },
  {
    title: 'Manage Pet Profiles',
    steps: [
      'Admin Panel -> Pet Management -> All Pets',
      'Filter by owner/type/breed',
      'Review health records, vaccination history, medical documents',
      'Edit, delete on abuse reports, or add admin health notes',
    ],
  },
];

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [socialPosts, setSocialPosts] = useState([]);

  const load = async () => {
    const [statsRes, usersRes, listingsRes, postsRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/listings'),
      api.get('/admin/social-posts'),
    ]);
    setStats(statsRes.data.data);
    setUsers(usersRes.data.data || []);
    setListings(listingsRes.data.data || []);
    setSocialPosts(postsRes.data.data || []);
  };

  useEffect(() => {
    load().catch((error) => console.error(error));
  }, []);

  const toggleUser = async (userId, isActive) => {
    await api.patch(`/admin/users/${userId}/status`, { isActive: !isActive });
    load();
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div style={{ marginBottom: '28px' }}>
          <span className="label-tag">🛡️ Admin Panel</span>
          <h1 className="display-lg">Operations & Access Control</h1>
          <p style={{ color: 'var(--muted)' }}>
            Configured admin privileges and standard operation flows for marketplace, services, users, and pets.
          </p>
        </div>

        <div className="glass-panel" style={{ marginBottom: '24px', overflowX: 'auto' }}>
          <h3 style={{ marginTop: 0 }}>Full Access Matrix</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Module</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Access Type</th>
              </tr>
            </thead>
            <tbody>
              {ACCESS_MATRIX.map(([module, access]) => (
                <tr key={module} style={{ borderTop: '1px solid rgba(167,139,250,0.2)' }}>
                  <td style={{ padding: '10px 8px' }}>{module}</td>
                  <td style={{ padding: '10px 8px', color: 'var(--muted)' }}>{access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dashboard-stats">
          <div className="d-stat-card"><div className="d-stat-num">{stats?.users || 0}</div><div className="d-stat-label">Users</div></div>
          <div className="d-stat-card"><div className="d-stat-num">{stats?.pets || 0}</div><div className="d-stat-label">Pets</div></div>
          <div className="d-stat-card"><div className="d-stat-num">{stats?.listings || 0}</div><div className="d-stat-label">Listings</div></div>
          <div className="d-stat-card"><div className="d-stat-num">{stats?.posts || 0}</div><div className="d-stat-label">Social Posts</div></div>
        </div>

        <div className="glass-panel" style={{ marginBottom: '18px' }}>
          <h3 style={{ marginTop: 0 }}>User Management</h3>
          {users.slice(0, 12).map((u) => (
            <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, gap: 10 }}>
              <span>{u.name} ({u.email})</span>
              <button className="btn-ghost" onClick={() => toggleUser(u._id, u.isActive)}>
                {u.isActive ? 'Suspend' : 'Activate'}
              </button>
            </div>
          ))}
        </div>

        <div className="glass-panel" style={{ marginBottom: '18px' }}>
          <h3 style={{ marginTop: 0 }}>Listings Moderation</h3>
          {listings.slice(0, 10).map((l) => <p key={l._id} style={{ color: 'var(--muted)' }}>• {l.title} ({l.listingType}) by {l.ownerId?.name || 'Unknown'}</p>)}
        </div>

        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0 }}>Social Content Moderation</h3>
          {socialPosts.slice(0, 10).map((p) => <p key={p._id} style={{ color: 'var(--muted)' }}>• {p.authorId?.name || 'User'}: {p.text?.slice(0, 90) || '(media post)'}</p>)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {WORKFLOWS.map((flow) => (
            <div key={flow.title} className="glass-panel">
              <h3 style={{ marginTop: 0 }}>{flow.title}</h3>
              {flow.steps.map((step) => (
                <p key={step} style={{ margin: '8px 0', color: 'var(--muted)' }}>- {step}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
