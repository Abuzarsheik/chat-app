import { Router } from 'express';
import {
  getConversation,
  sendMessage,
  getRecentConversations
} from '../controllers/messageController';
import {
  validateMessage,
  handleValidationErrors
} from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for message routes
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 messages per minute
  message: {
    success: false,
    message: 'Too many messages sent, please slow down',
    error: 'MESSAGE_RATE_LIMIT_EXCEEDED'
  }
});

const conversationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 conversation requests per 15 minutes
  message: {
    success: false,
    message: 'Too many conversation requests, please try again later',
    error: 'CONVERSATION_RATE_LIMIT_EXCEEDED'
  }
});

// All routes require authentication
router.use(authenticateToken);

// Message routes
router.get('/conversations', conversationLimiter, getRecentConversations);
router.get('/:userId', conversationLimiter, getConversation);
router.post('/', messageLimiter, validateMessage, handleValidationErrors, sendMessage);

export default router; 