import { Router } from 'express';
import {
  getAllUsers,
  getOnlineUsers,
  getUserById,
  searchUsers,
  getConversations,
  getUnreadCounts
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for user routes
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    error: 'RATE_LIMIT_EXCEEDED'
  }
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 search requests per minute
  message: {
    success: false,
    message: 'Too many search requests, please try again later',
    error: 'SEARCH_RATE_LIMIT_EXCEEDED'
  }
});

// All routes require authentication
router.use(authenticateToken);

// User routes
router.get('/', userLimiter, getAllUsers);
router.get('/online', userLimiter, getOnlineUsers);
router.get('/search', searchLimiter, searchUsers);
router.get('/conversations', userLimiter, getConversations);
router.get('/unread-counts', userLimiter, getUnreadCounts);
router.get('/:userId', userLimiter, getUserById);

export default router; 