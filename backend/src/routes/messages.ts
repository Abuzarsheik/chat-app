import express from 'express';
import { 
  getMessages, 
  sendMessage, 
  getConversations, 
  markAsRead 
} from '../controllers/messageController';
import { validateMessage } from '../middleware/validation';
import auth from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   GET /api/messages/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', getConversations);

// @route   GET /api/messages/:userId
// @desc    Get messages between current user and specified user
// @access  Private
router.get('/:userId', getMessages);

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', validateMessage, sendMessage);

// @route   PUT /api/messages/read/:userId
// @desc    Mark messages as read
// @access  Private
router.put('/read/:userId', markAsRead);

export default router; 