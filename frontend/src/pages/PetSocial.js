import React, { useState, useEffect } from 'react';
import api from '../config/api';
import socket from '../config/socket';
import { useAuth } from '../context/Authcontext';
import { useChat } from '../context/ChatContext';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';
import { fileToDataUrl } from '../utils/file';
import './PetSocial.css';

const REACTIONS = {
  love: { emoji: '❤️', label: 'Love', color: '#ff4757' },
  cute: { emoji: '🥰', label: 'Cute', color: '#ff6b9d' },
  funny: { emoji: '😂', label: 'Funny', color: '#ffa502' },
  wow: { emoji: '😮', label: 'Wow', color: '#7bed9f' },
  sad: { emoji: '😢', label: 'Sad', color: '#70a1ff' }
};

const PetSocial = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    conversations, 
    activeConversation, 
    setActiveConversation, 
    fetchConversations,
    setIsChatOpen,
    startConversation
  } = useChat();
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [postText, setPostText] = useState('');
  const [postImages, setPostImages] = useState([]);
  const [stories, setStories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', description: '' });
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyImage, setStoryImage] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
  const [viewingStory, setViewingStory] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });

  const loadFeed = async (targetPage = 1) => {
    try {
      const res = await api.get(`/pet-social/feed?page=${targetPage}&limit=10`);
      const data = res.data.data || [];
      setFeed((prev) => (targetPage === 1 ? data : [...prev, ...data]));
      setHasMore(!!res.data.hasMore);
    } catch (err) {
      console.error('Failed to load feed:', err);
    }
  };

  const loadSideData = async () => {
    try {
      const [storiesRes, groupsRes, eventsRes, notifRes] = await Promise.all([
        api.get('/pet-social/stories'),
        api.get('/pet-social/groups'),
        api.get('/pet-social/events'),
        isAuthenticated ? api.get('/pet-social/notifications') : Promise.resolve({ data: { data: [] } }),
      ]);
      setStories(storiesRes.data.data || []);
      setGroups(groupsRes.data.data || []);
      setEvents(eventsRes.data.data || []);
      setNotifications(notifRes.data.data || []);
    } catch (err) {
      console.error('Failed to load side data:', err);
    }
  };

  // Load user profile with their posts
  const loadUserProfile = async (userId) => {
    try {
      const res = await api.get(`/pet-social/user/${userId}/profile`);
      setSelectedUserProfile(res.data.data);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      alert('Failed to load user profile');
    }
  };

  // Search users and posts
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await api.get(`/pet-social/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data.data || { users: [], posts: [] });
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // Get suggestions
  const loadSuggestions = async () => {
    try {
      const res = await api.get('/pet-social/suggestions');
      setSearchResults(res.data.data || { users: [], posts: [] });
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  };

  useEffect(() => {
    loadFeed(1);
    loadSideData();
    if (isAuthenticated) {
      fetchConversations();
    }
    const interval = setInterval(() => loadSideData(), 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, fetchConversations]);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;
    socket.emit('join-user-room', user._id);
    
    const onNotification = (payload) => {
      setNotifications((prev) => [payload, ...prev].slice(0, 20));
    };
    
    const onOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on('notification:new', onNotification);
    socket.on('users:online', onOnlineUsers);
    
    return () => {
      socket.off('notification:new', onNotification);
      socket.off('users:online', onOnlineUsers);
    };
  }, [isAuthenticated, user]);

  const handlePostImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    try {
      const newImages = await Promise.all(
        files.slice(0, 4 - postImages.length).map(file => fileToDataUrl(file))
      );
      
      setPostImages((prev) => [...prev, ...newImages].slice(0, 4));
    } catch (err) {
      console.error('Failed to process images:', err);
    }
  };

  const removePostImage = (idx) => {
    setPostImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const createPost = async () => {
    if (!postText.trim() && postImages.length === 0) return;
    try {
      await api.post('/pet-social/posts', { 
        text: postText, 
        media: postImages,
        mediaType: postImages.length > 0 ? 'image' : 'none'
      });
      setPostText('');
      setPostImages([]);
      loadFeed(1);
    } catch (err) {
      alert('Failed to create post: ' + (err.response?.data?.message || err.message));
    }
  };

  const reactToPost = async (id, reaction) => {
    try {
      await api.post(`/pet-social/posts/${id}/reaction`, { reaction });
      loadFeed(1);
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  const likePost = async (id) => {
    try {
      await api.post(`/pet-social/posts/${id}/like`);
      loadFeed(1);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const submitComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    try {
      await api.post(`/pet-social/posts/${postId}/comment`, { text });
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      loadFeed(1);
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const sharePost = async (id) => {
    try {
      await api.post(`/pet-social/posts/${id}/share`);
      loadFeed(1);
      alert('Post shared to your profile!');
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const createStory = async () => {
    if (!storyImage) return;
    try {
      await api.post('/pet-social/stories', { 
        mediaUrl: storyImage, 
        caption: storyCaption 
      });
      setStoryImage('');
      setStoryCaption('');
      setShowStoryModal(false);
      loadSideData();
    } catch (err) {
      alert('Failed to create story: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStoryImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setStoryImage(dataUrl);
  };

  const createGroup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pet-social/groups', newGroup);
      setNewGroup({ name: '', description: '' });
      loadSideData();
    } catch (err) {
      alert('Failed to create group: ' + (err.response?.data?.message || err.message));
    }
  };

  const joinGroup = async (groupId) => {
    try {
      await api.post(`/pet-social/groups/${groupId}/join`);
      loadSideData();
    } catch (err) {
      console.error('Join group failed:', err);
    }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pet-social/events', newEvent);
      setNewEvent({ title: '', date: '', location: '', description: '' });
      loadSideData();
    } catch (err) {
      alert('Failed to create event: ' + (err.response?.data?.message || err.message));
    }
  };

  const rsvpEvent = async (eventId, status) => {
    try {
      await api.post(`/pet-social/events/${eventId}/rsvp`, { status });
      loadSideData();
    } catch (err) {
      console.error('RSVP failed:', err);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.floor((now - postDate) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="pet-social-page">
      {/* Hero Header */}
      <div className="pet-social-hero">
        <div className="pet-social-hero-content">
          <h1 className="pet-social-title">🐾 Pet Social</h1>
          <p className="pet-social-subtitle">Connect, share, and discover with pet lovers worldwide</p>
          <button 
            className="btn-search-discover" 
            onClick={() => {
              setShowSearchModal(true);
              loadSuggestions();
            }}
          >
            🔍 Discover
          </button>
        </div>
        <div className="pet-social-hero-bg"></div>
      </div>

      <div className="pet-social-container">
        {/* Left Sidebar - Navigation & Chat */}
        <aside className="pet-social-sidebar">
          <div className="social-card">
            <nav className="social-nav">
              <button className={`social-nav-item ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>
                <span className="social-nav-icon">🏠</span> Feed
              </button>
              <button className={`social-nav-item ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => setActiveTab('groups')}>
                <span className="social-nav-icon">👥</span> Groups
                <span className="social-badge">{groups.length}</span>
              </button>
              <button className={`social-nav-item ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
                <span className="social-nav-icon">📅</span> Events
                <span className="social-badge">{events.length}</span>
              </button>
              <button className={`social-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                <span className="social-nav-icon">🌐</span> Discover Users
              </button>
              <button className={`social-nav-item ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                <span className="social-nav-icon">💬</span> Messages
              </button>
            </nav>
          </div>

          {isAuthenticated && (
            <div className="social-card">
              <h3 className="social-card-title">🟢 Online Now</h3>
              <div className="online-users">
                {onlineUsers.length === 0 ? (
                  <p className="social-empty">No users online</p>
                ) : (
                  onlineUsers.map((u) => (
                    <div key={u._id} className="online-user" onClick={() => {
                      startConversation(u._id);
                      setActiveTab('chat');
                    }}>
                      <div className="online-avatar">
                        {u.profilePhoto ? <img src={u.profilePhoto} alt={u.name} /> : <span>{u.name?.[0] || '?'}</span>}
                        <span className="online-indicator"></span>
                      </div>
                      <span className="online-name">{u.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="social-card">
            <h3 className="social-card-title">🔔 Notifications</h3>
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <p className="social-empty">No new notifications</p>
              ) : (
                notifications.slice(0, 5).map((n, i) => (
                  <div key={`${n._id || i}`} className={`notification-item ${!n.isRead ? 'unread' : ''}`}>
                    <span className="notification-dot"></span>
                    <span className="notification-text">{n.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="pet-social-main">
          {/* Stories Bar */}
          <div className="stories-bar">
            {isAuthenticated && (
              <div className="story-item story-add" onClick={() => setShowStoryModal(true)}>
                <div className="story-avatar">
                  <span className="story-add-icon">+</span>
                </div>
                <span className="story-username">Add Story</span>
              </div>
            )}
            {stories.map((story) => (
              <div key={story._id} className="story-item" onClick={() => setViewingStory(story)}>
                <div className="story-avatar has-story">
                  {story.authorId?.profilePhoto ? (
                    <img src={story.authorId.profilePhoto} alt={story.authorId.name} />
                  ) : (
                    <span>{story.authorId?.name?.[0] || '?'}</span>
                  )}
                </div>
                <span className="story-username">{story.authorId?.name || 'User'}</span>
              </div>
            ))}
            {stories.length === 0 && !isAuthenticated && (
              <p className="stories-empty">No active stories</p>
            )}
          </div>

          {/* Create Post Card */}
          {activeTab === 'feed' && isAuthenticated && (
            <div className="create-post-card">
              <div className="create-post-header">
                <div className="create-post-avatar">
                  {user?.profilePhoto ? <img src={user.profilePhoto} alt={user.name} /> : <span>{user?.name?.[0] || '?'}</span>}
                </div>
                <input 
                  type="text" 
                  className="create-post-input" 
                  placeholder="What's your pet up to?"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && createPost()}
                />
              </div>
              
              {postImages.length > 0 && (
                <div className="post-images-preview">
                  {postImages.map((img, idx) => (
                    <div key={idx} className="preview-image-container">
                      <img src={img} alt={`Preview ${idx + 1}`} />
                      <button className="remove-image" onClick={() => removePostImage(idx)}>×</button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="create-post-actions">
                <label className="post-action-btn">
                  <input type="file" accept="image/*" multiple hidden onChange={handlePostImageChange} />
                  <span>📷 Photo</span>
                </label>
                <button className="post-action-btn">😊 Feeling</button>
                <button className="post-action-btn">📍 Location</button>
                <button 
                  className="post-submit-btn" 
                  onClick={createPost}
                  disabled={!postText.trim() && postImages.length === 0}
                >
                  Post
                </button>
              </div>
            </div>
          )}

          {/* Feed */}
          {activeTab === 'feed' && (
            <div className="feed-container">
              {feed.map((post) => (
                <article key={post._id} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <div className="post-author-avatar">
                        {post.authorId?.profilePhoto ? (
                          <img src={post.authorId.profilePhoto} alt={post.authorId.name} />
                        ) : (
                          <span>{post.authorId?.name?.[0] || '?'}</span>
                        )}
                      </div>
                      <div className="post-author-info">
                        <span 
                          className="post-author-name" 
                          onClick={() => post.authorId?._id && loadUserProfile(post.authorId._id)}
                          style={{ cursor: post.authorId?._id ? 'pointer' : 'default' }}
                        >
                          {post.authorId?.name || 'Pet Lover'}
                        </span>
                        <span className="post-time">{formatTime(post.createdAt)}</span>
                      </div>
                    </div>
                    <button className="post-options">⋯</button>
                  </div>

                  <div className="post-content">
                    <p className="post-text">{post.text}</p>
                    {post.media?.length > 0 && (
                      <div className={`post-media-grid post-media-${post.media.length}`}>
                        {post.media.map((img, idx) => (
                          <img key={idx} src={img} alt={`Post ${idx + 1}`} className="post-media-img" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="post-stats">
                    <span>{post.likes?.length || 0} likes</span>
                    <span>{post.comments?.length || 0} comments</span>
                    <span>{post.shares || 0} shares</span>
                  </div>

                  <div className="post-reactions">
                    {Object.entries(REACTIONS).map(([key, { emoji, label, color }]) => (
                      <button 
                        key={key}
                        className="reaction-btn"
                        onClick={() => reactToPost(post._id, key)}
                        style={{ '--reaction-color': color }}
                      >
                        <span className="reaction-emoji">{emoji}</span>
                        <span className="reaction-label">{label}</span>
                        <span className="reaction-count">
                          {post.petReactions?.[key]?.length || 0}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="post-actions-bar">
                    <button className={`post-action ${post.likes?.some(id => id === user?._id) ? 'active' : ''}`} onClick={() => likePost(post._id)}>
                      <span>👍</span> Like
                    </button>
                    <button className="post-action" onClick={() => toggleComments(post._id)}>
                      <span>💬</span> Comment
                    </button>
                    <button className="post-action" onClick={() => sharePost(post._id)}>
                      <span>🔁</span> Share
                    </button>
                  </div>

                  {showComments[post._id] && (
                    <div className="comments-section">
                      {post.comments?.map((comment, idx) => (
                        <div key={idx} className="comment-item">
                          <div className="comment-avatar">
                            <span>{comment.userId?.name?.[0] || '?'}</span>
                          </div>
                          <div className="comment-content">
                            <span className="comment-author">{comment.userId?.name || 'User'}</span>
                            <span className="comment-text">{comment.text}</span>
                          </div>
                        </div>
                      ))}
                      <div className="comment-input-wrapper">
                        <input
                          type="text"
                          className="comment-input"
                          placeholder="Write a comment..."
                          value={commentText[post._id] || ''}
                          onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && submitComment(post._id)}
                        />
                        <button className="comment-submit" onClick={() => submitComment(post._id)}>
                          ➤
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
              
              {hasMore && (
                <button className="load-more-btn" onClick={() => { const next = page + 1; setPage(next); loadFeed(next); }}>
                  Load More Posts
                </button>
              )}
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === 'groups' && (
            <div className="groups-container">
              {isAuthenticated && (
                <div className="create-group-card">
                  <h3>Create New Group</h3>
                  <form onSubmit={createGroup}>
                    <input className="form-input" placeholder="Group name" value={newGroup.name} onChange={(e) => setNewGroup(p => ({ ...p, name: e.target.value }))} required />
                    <textarea className="form-input" placeholder="Description" value={newGroup.description} onChange={(e) => setNewGroup(p => ({ ...p, description: e.target.value }))} rows={3} />
                    <button className="btn-primary" type="submit">Create Group</button>
                  </form>
                </div>
              )}
              <div className="groups-grid">
                {groups.map((g) => (
                  <div key={g._id} className="group-card">
                    <div className="group-icon">👥</div>
                    <h4 className="group-name">{g.name}</h4>
                    <p className="group-desc">{g.description}</p>
                    <span className="group-members">{g.members?.length || 0} members</span>
                    <button className="group-join-btn" onClick={() => joinGroup(g._id)}>Join Group</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="events-container">
              {isAuthenticated && (
                <div className="create-event-card">
                  <h3>Create New Event</h3>
                  <form onSubmit={createEvent}>
                    <input className="form-input" placeholder="Event title" value={newEvent.title} onChange={(e) => setNewEvent(p => ({ ...p, title: e.target.value }))} required />
                    <input className="form-input" type="datetime-local" value={newEvent.date} onChange={(e) => setNewEvent(p => ({ ...p, date: e.target.value }))} required />
                    <input className="form-input" placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent(p => ({ ...p, location: e.target.value }))} required />
                    <textarea className="form-input" placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent(p => ({ ...p, description: e.target.value }))} rows={3} />
                    <button className="btn-primary" type="submit">Create Event</button>
                  </form>
                </div>
              )}
              <div className="events-list">
                {events.map((ev) => (
                  <div key={ev._id} className="event-card">
                    <div className="event-date">
                      <span className="event-month">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="event-day">{new Date(ev.date).getDate()}</span>
                    </div>
                    <div className="event-info">
                      <h4 className="event-title">{ev.title}</h4>
                      <p className="event-location">📍 {ev.location}</p>
                      <p className="event-desc">{ev.description}</p>
                      <div className="event-rsvp">
                        <span>{ev.rsvps?.length || 0} going</span>
                        <div className="rsvp-buttons">
                          <button onClick={() => rsvpEvent(ev._id, 'going')}>✓ Going</button>
                          <button onClick={() => rsvpEvent(ev._id, 'interested')}>⭐ Interested</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="users-container">
              <UserList 
                onClose={() => setActiveTab('feed')}
              />
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="chat-container">
              {!activeConversation ? (
                <div className="conversations-list-wrapper">
                  <div className="chat-list-header">
                    <h3>💬 Your Messages</h3>
                    <button 
                      className="btn-primary"
                      onClick={() => setActiveTab('users')}
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      🌐 Discover Users
                    </button>
                  </div>
                  <div className="conversations-list">
                    {conversations.length === 0 ? (
                      <div className="chat-placeholder">
                        <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '40px' }}>
                          No conversations yet. Start messaging pet owners, sellers, and the community!
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <button 
                            className="btn-ghost"
                            onClick={() => window.location.href = '/marketplace-pro'}
                            style={{ padding: '10px 20px' }}
                          >
                            🏪 Browse Marketplace
                          </button>
                        </div>
                      </div>
                    ) : (
                      conversations.map((conv) => {
                        const otherUser = conv.participants?.find(p => p._id !== user?._id) || conv.participants?.[0];
                        return (
                          <div 
                            key={conv._id} 
                            className="conversation-item"
                            onClick={() => {
                              setActiveConversation(conv);
                              setIsChatOpen(true);
                            }}
                          >
                            <div className="conversation-avatar">
                              {otherUser?.profilePhoto ? (
                                <img src={otherUser.profilePhoto} alt={otherUser.name} />
                              ) : (
                                <span>{otherUser?.name?.[0] || '?'}</span>
                              )}
                            </div>
                            <div className="conversation-info">
                              <div className="conversation-name">{otherUser?.name || 'User'}</div>
                              <div className="conversation-preview">
                                {conv.lastMessage || 'No messages yet'}
                              </div>
                            </div>
                            {conv.lastMessageTime && (
                              <div className="conversation-time">
                                {formatTime(conv.lastMessageTime)}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <ChatWindow onClose={() => setActiveConversation(null)} />
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar - Trending & Suggestions */}
        <aside className="pet-social-sidebar right">
          <div className="social-card trending">
            <h3 className="social-card-title">🔥 Trending</h3>
            <div className="trending-tags">
              <span className="trending-tag">#CutePuppies</span>
              <span className="trending-tag">#CatLovers</span>
              <span className="trending-tag">#PetTips</span>
              <span className="trending-tag">#AdoptDontShop</span>
              <span className="trending-tag">#PetPhotography</span>
            </div>
          </div>

          <div className="social-card">
            <h3 className="social-card-title">💡 Suggested for You</h3>
            <div className="suggestions-list">
              <div className="suggestion-item">
                <div className="suggestion-avatar">🐕</div>
                <div className="suggestion-info">
                  <span className="suggestion-name">Dog Lovers Group</span>
                  <span className="suggestion-meta">2.5k members</span>
                </div>
                <button className="suggestion-follow">Join</button>
              </div>
              <div className="suggestion-item">
                <div className="suggestion-avatar">🐱</div>
                <div className="suggestion-info">
                  <span className="suggestion-name">Cat Parents</span>
                  <span className="suggestion-meta">1.8k members</span>
                </div>
                <button className="suggestion-follow">Join</button>
              </div>
            </div>
          </div>

          <div className="social-card">
            <h3 className="social-card-title">📊 Pet Social Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{feed.length}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{groups.length}</span>
                <span className="stat-label">Groups</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{events.length}</span>
                <span className="stat-label">Events</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Story Modal */}
      {showStoryModal && (
        <div className="modal-overlay" onClick={() => setShowStoryModal(false)}>
          <div className="story-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add to Your Story</h3>
            <div className="story-upload">
              {storyImage ? (
                <img src={storyImage} alt="Story preview" className="story-preview" />
              ) : (
                <label className="story-upload-btn">
                  <input type="file" accept="image/*" hidden onChange={handleStoryImageChange} />
                  <span>📷 Select Photo</span>
                </label>
              )}
            </div>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Add a caption..."
              value={storyCaption}
              onChange={(e) => setStoryCaption(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowStoryModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={createStory} disabled={!storyImage}>Share to Story</button>
            </div>
          </div>
        </div>
      )}

      {/* View Story Modal */}
      {viewingStory && (
        <div className="modal-overlay story-viewer" onClick={() => setViewingStory(null)}>
          <div className="story-view-content" onClick={(e) => e.stopPropagation()}>
            <div className="story-view-header">
              <span className="story-view-author">{viewingStory.authorId?.name}'s Story</span>
              <button className="story-close" onClick={() => setViewingStory(null)}>×</button>
            </div>
            <img src={viewingStory.mediaUrl} alt="Story" className="story-view-image" />
            <p className="story-view-caption">{viewingStory.caption}</p>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUserProfile && (
        <div className="modal-overlay profile-modal" onClick={() => setSelectedUserProfile(null)}>
          <div className="profile-content" onClick={(e) => e.stopPropagation()}>
            <div className="profile-header">
              <div className="profile-avatar-large">
                {selectedUserProfile.user?.profilePhoto ? (
                  <img src={selectedUserProfile.user.profilePhoto} alt={selectedUserProfile.user.name} />
                ) : (
                  <span>{selectedUserProfile.user?.name?.[0] || '?'}</span>
                )}
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{selectedUserProfile.user?.name || 'Pet Lover'}</h2>
                <p className="profile-bio">{selectedUserProfile.user?.bio || '🐾 Pet enthusiast'}</p>
                <div className="profile-stats">
                  <span><strong>{selectedUserProfile.posts?.length || 0}</strong> Posts</span>
                  <span><strong>{selectedUserProfile.user?.followers?.length || 0}</strong> Followers</span>
                  <span><strong>{selectedUserProfile.user?.following?.length || 0}</strong> Following</span>
                </div>
              </div>
              <button className="profile-close" onClick={() => setSelectedUserProfile(null)}>×</button>
            </div>
            
            <div className="profile-posts-section">
              <h3>📸 All Uploads</h3>
              <div className="profile-posts-grid">
                {selectedUserProfile.posts?.map(post => (
                  <div key={post._id} className="profile-post-item">
                    {post.media?.[0] && (
                      <img src={post.media[0]} alt="Post" />
                    )}
                  </div>
                ))}
                {!selectedUserProfile.posts?.length && (
                  <p className="no-posts">No uploads yet 🐾</p>
                )}
              </div>
            </div>
            
            <div className="profile-actions">
              <button 
                className="btn-message-profile"
                onClick={() => {
                  const user = {
                    _id: selectedUserProfile.user?._id,
                    name: selectedUserProfile.user?.name
                  };
                  window.dispatchEvent(new CustomEvent('openChat', { detail: user }));
                  setSelectedUserProfile(null);
                }}
              >
                💬 Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search/Suggestions Modal */}
      {showSearchModal && (
        <div className="modal-overlay search-modal" onClick={() => setShowSearchModal(false)}>
          <div className="search-content" onClick={(e) => e.stopPropagation()}>
            <div className="search-header">
              <h3>🔍 Discover</h3>
              <button className="search-close" onClick={() => setShowSearchModal(false)}>×</button>
            </div>
            
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search users, posts, pets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-btn" onClick={handleSearch}>Search</button>
            </div>
            
            <div className="search-suggestions">
              <button className="suggestion-chip" onClick={loadSuggestions}>✨ Suggestions for You</button>
              <button className="suggestion-chip" onClick={() => setSearchQuery('Dogs')}>🐕 Dogs</button>
              <button className="suggestion-chip" onClick={() => setSearchQuery('Cats')}>🐱 Cats</button>
              <button className="suggestion-chip" onClick={() => setSearchQuery('Birds')}>🐦 Birds</button>
              <button className="suggestion-chip" onClick={() => setSearchQuery('Adoption')}>🏠 Adoption</button>
            </div>
            
            <div className="search-results">
              {searchResults.users?.length > 0 && (
                <div className="result-section">
                  <h4>👥 Suggested Users</h4>
                  {searchResults.users.map(user => (
                    <div key={user._id} className="result-item" onClick={() => loadUserProfile(user._id)}>
                      <div className="result-avatar">{user.name?.[0] || '?'}</div>
                      <span className="result-name">{user.name}</span>
                      <button className="btn-follow-small">Follow</button>
                    </div>
                  ))}
                </div>
              )}
              
              {searchResults.posts?.length > 0 && (
                <div className="result-section">
                  <h4>📝 Related Posts</h4>
                  {searchResults.posts.map(post => (
                    <div key={post._id} className="result-item post-result" onClick={() => loadUserProfile(post.authorId?._id)}>
                      {post.media?.[0] && <img src={post.media[0]} alt="" className="result-thumb" />}
                      <span className="result-text">{post.text?.substring(0, 50)}...</span>
                    </div>
                  ))}
                </div>
              )}
              
              {!searchResults.users?.length && !searchResults.posts?.length && (
                <p className="no-results">Search for users, posts, or click suggestions above ✨</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetSocial;

