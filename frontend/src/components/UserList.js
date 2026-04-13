import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import api from '../config/api';

const UserList = ({ onClose, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { openChat } = useChat();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Try to fetch from users endpoint, fallback to marketplace users if needed
      let res;
      try {
        res = await api.get('/users');
      } catch (err) {
        // If /users doesn't exist, try marketplace listings to get sellers
        const listingsRes = await api.get('/marketplace');
        const sellers = listingsRes.data.data?.map(l => ({
          _id: l.user?._id,
          name: l.user?.name,
          email: l.user?.email,
          role: l.user?.role,
          activity: `Listed: ${l.title}`
        })).filter(u => u._id) || [];
        
        // Remove duplicates
        const uniqueSellers = sellers.filter((v, i, a) => a.findIndex(t => t._id === v._id) === i);
        res = { data: { data: uniqueSellers } };
      }
      
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (user) => {
    openChat(user);
    if (onSelectUser) onSelectUser(user);
    if (onClose) onClose();
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-list-modal">
      <div className="user-list-header">
        <h3>👥 Discover Users</h3>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>

      <div className="user-list-search">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="user-list-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>😕 No users found</p>
            <p className="text-muted">
              {searchTerm ? 'Try a different search term' : 'Users will appear here when available'}
            </p>
          </div>
        ) : (
          <div className="user-grid">
            {filteredUsers.map(user => (
              <div key={user._id} className="user-card">
                <div className="user-avatar-large">
                  {user.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="user-info">
                  <h4 className="user-name">{user.name || 'Unknown User'}</h4>
                  <p className="user-role">{user.role || 'Member'}</p>
                  {user.activity && (
                    <p className="user-activity">{user.activity}</p>
                  )}
                </div>
                <button 
                  className="btn-message"
                  onClick={() => handleMessageClick(user)}
                >
                  💬 Message
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="user-list-footer">
        <p className="text-muted">💡 Tip: You can also message sellers directly from marketplace listings!</p>
      </div>
    </div>
  );
};

export default UserList;
