const SocialPost = require('../models/SocialPost');
const {
  Follow,
  Conversation,
  ChatMessage,
  PetGroup,
  PetEvent,
  PetStory,
  Notification,
} = require('../models/PetSocial');
const { getIO } = require('../utils/socket');

const spamWords = ['spam', 'scam', 'fake', 'xxx'];
const isSpam = (text = '') => spamWords.some((w) => String(text).toLowerCase().includes(w));

exports.createPost = async (req, res) => {
  try {
    const { text = '', media = [], mediaType = 'none', groupId, petId } = req.body;
    if (isSpam(text)) return res.status(400).json({ success: false, message: 'Post blocked by spam filter' });

    const post = await SocialPost.create({
      authorId: req.user._id,
      text,
      media: Array.isArray(media) ? media.slice(0, 8) : [],
      mediaType,
      groupId: groupId || undefined,
      petId: petId || undefined,
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const posts = await SocialPost.find({})
      .populate('authorId', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ success: true, data: posts, page, hasMore: posts.length === limit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await SocialPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const uid = req.user._id.toString();
    const hasLiked = post.likes.some((id) => id.toString() === uid);
    post.likes = hasLiked ? post.likes.filter((id) => id.toString() !== uid) : [...post.likes, req.user._id];
    await post.save();
    res.json({ success: true, data: { likes: post.likes.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    if (isSpam(req.body.text)) {
      return res.status(400).json({ success: false, message: 'Comment blocked by spam filter' });
    }
    const post = await SocialPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({ userId: req.user._id, text: req.body.text });
    await post.save();
    res.status(201).json({ success: true, data: post.comments[post.comments.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sharePost = async (req, res) => {
  try {
    const post = await SocialPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.shares += 1;
    await post.save();
    res.json({ success: true, data: { shares: post.shares } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.setReaction = async (req, res) => {
  try {
    const { reaction } = req.body; // love|funny|cute
    const post = await SocialPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (!['love', 'funny', 'cute'].includes(reaction)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction' });
    }

    const uid = req.user._id.toString();
    ['love', 'funny', 'cute'].forEach((key) => {
      post.petReactions[key] = post.petReactions[key].filter((id) => id.toString() !== uid);
    });
    post.petReactions[reaction].push(req.user._id);
    await post.save();

    res.json({
      success: true,
      data: {
        love: post.petReactions.love.length,
        funny: post.petReactions.funny.length,
        cute: post.petReactions.cute.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }
    await Follow.findOneAndUpdate(
      { followerId: req.user._id, followingId: req.params.userId },
      { followerId: req.user._id, followingId: req.params.userId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const notification = await Notification.create({
      userId: req.params.userId,
      type: 'follow',
      text: `${req.user.name || 'Someone'} started following you.`,
      data: { followerId: req.user._id },
    });
    const io = getIO();
    if (io) io.to(`user:${req.params.userId}`).emit('notification:new', notification);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, text = '', images = [] } = req.body;
    let convo = null;
    if (conversationId) {
      convo = await Conversation.findById(conversationId);
    } else if (recipientId) {
      const participants = [req.user._id.toString(), recipientId.toString()].sort();
      convo = await Conversation.findOne({ participants });
      if (!convo) convo = await Conversation.create({ participants });
    }
    if (!convo) return res.status(400).json({ success: false, message: 'Conversation not found' });
    if (!text && (!Array.isArray(images) || images.length === 0)) {
      return res.status(400).json({ success: false, message: 'Message is empty' });
    }

    const msg = await ChatMessage.create({
      conversationId: convo._id,
      senderId: req.user._id,
      text,
      images: Array.isArray(images) ? images.slice(0, 5) : [],
    });
    convo.lastMessageAt = new Date();
    await convo.save();
    const io = getIO();
    if (io) {
      io.to(`conversation:${convo._id.toString()}`).emit('chat:new-message', msg);
      convo.participants.forEach((uid) => {
        io.to(`user:${uid.toString()}`).emit('conversation:updated', {
          conversationId: convo._id,
          lastMessageAt: convo.lastMessageAt,
        });
      });
    }
    res.status(201).json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ conversationId: req.params.conversationId })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const { Conversation, ChatMessage } = require('../models/PetSocial');
    
    // Find conversations where current user is a participant
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name email')
      .sort({ lastMessageAt: -1 });
    
    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await ChatMessage.findOne({
          conversationId: conv._id
        })
          .sort({ createdAt: -1 })
          .populate('senderId', 'name');
        
        return {
          ...conv.toObject(),
          lastMessage: lastMessage?.content || null,
          lastMessageTime: lastMessage?.createdAt || null
        };
      })
    );
    
    res.json({ success: true, data: conversationsWithLastMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const group = await PetGroup.create({
      name: req.body.name,
      description: req.body.description || '',
      ownerId: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const User = require('../models/User');
    const SocialPost = require('../models/SocialPost');
    
    const user = await User.findById(req.params.userId).select('name bio profilePhoto followers following');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const posts = await SocialPost.find({ authorId: req.params.userId })
      .populate('authorId', 'name profilePhoto')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      data: { 
        user: {
          _id: user._id,
          name: user.name,
          bio: user.bio,
          profilePhoto: user.profilePhoto,
          followers: user.followers || [],
          following: user.following || []
        }, 
        posts 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchUsersAndPosts = async (req, res) => {
  try {
    const User = require('../models/User');
    const SocialPost = require('../models/SocialPost');
    const query = req.query.q;
    
    if (!query) {
      return res.json({ success: true, data: { users: [], posts: [] } });
    }
    
    const searchRegex = new RegExp(query, 'i');
    
    const users = await User.find({
      name: searchRegex
    }).select('name profilePhoto').limit(10);
    
    const posts = await SocialPost.find({
      $or: [
        { text: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    })
      .populate('authorId', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ success: true, data: { users, posts } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const User = require('../models/User');
    const SocialPost = require('../models/SocialPost');
    
    // Get users not followed by current user
    const users = await User.find({
      _id: { $ne: req.user._id }
    })
      .select('name profilePhoto')
      .limit(5);
    
    // Get random interesting posts
    const posts = await SocialPost.find({
      authorId: { $ne: req.user._id }
    })
      .populate('authorId', 'name profilePhoto')
      .sort({ likes: -1 })
      .limit(5);
    
    res.json({ success: true, data: { users, posts } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await PetGroup.findById(req.params.groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (!group.members.some((m) => m.toString() === req.user._id.toString())) group.members.push(req.user._id);
    await group.save();
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getGroups = async (_req, res) => {
  try {
    const groups = await PetGroup.find({}).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = await PetEvent.create({
      title: req.body.title,
      description: req.body.description || '',
      createdBy: req.user._id,
      date: req.body.date,
      location: req.body.location,
      rsvps: [{ userId: req.user._id, status: 'going' }],
    });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rsvpEvent = async (req, res) => {
  try {
    const event = await PetEvent.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const existing = event.rsvps.find((r) => r.userId.toString() === req.user._id.toString());
    if (existing) existing.status = req.body.status || 'going';
    else event.rsvps.push({ userId: req.user._id, status: req.body.status || 'going' });
    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEvents = async (_req, res) => {
  try {
    const events = await PetEvent.find({}).sort({ date: 1 }).limit(100);
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStory = async (req, res) => {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const story = await PetStory.create({
      authorId: req.user._id,
      mediaUrl: req.body.mediaUrl,
      caption: req.body.caption || '',
      expiresAt,
    });
    res.status(201).json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStories = async (_req, res) => {
  try {
    const stories = await PetStory.find({ expiresAt: { $gt: new Date() } })
      .populate('authorId', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
