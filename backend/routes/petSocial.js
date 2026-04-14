const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  sharePost,
  setReaction,
  followUser,
  sendMessage,
  getMessages,
  getConversations,
  createGroup,
  joinGroup,
  getGroups,
  createEvent,
  rsvpEvent,
  getEvents,
  createStory,
  getStories,
  getNotifications,
  getUserProfile,
  searchUsersAndPosts,
  getSuggestions,
} = require('../controllers/petSocialController');

router.get('/feed', protect, getFeed);
router.post('/posts', protect, createPost);
router.post('/posts/:id/like', protect, toggleLike);
router.post('/posts/:id/comment', protect, addComment);
router.post('/posts/:id/share', protect, sharePost);
router.post('/posts/:id/reaction', protect, setReaction);

router.post('/follow/:userId', protect, followUser);

router.post('/messages', protect, sendMessage);
router.get('/messages/:conversationId', protect, getMessages);
router.get('/conversations', protect, getConversations);

router.get('/groups', protect, getGroups);
router.post('/groups', protect, createGroup);
router.post('/groups/:groupId/join', protect, joinGroup);

router.get('/events', protect, getEvents);
router.post('/events', protect, createEvent);
router.post('/events/:eventId/rsvp', protect, rsvpEvent);

router.post('/stories', protect, createStory);
router.get('/stories', protect, getStories);

router.get('/notifications', protect, getNotifications);

router.get('/user/:userId/profile', protect, getUserProfile);
router.get('/search', protect, searchUsersAndPosts);
router.get('/suggestions', protect, getSuggestions);

module.exports = router;
