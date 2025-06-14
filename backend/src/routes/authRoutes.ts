import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateProfileUpdate,
  validatePasswordChange,
  handleValidationErrors
} from '../middleware/validation';
import { authenticateToken, verifyRefreshToken } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for auth routes - relaxed for demo purposes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs (increased for demo)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password change attempts per hour
  message: {
    success: false,
    message: 'Too many password change attempts, please try again later',
    error: 'RATE_LIMIT_EXCEEDED'
  }
});

// Public routes
router.post('/register', authLimiter, validateRegister, handleValidationErrors, register);
router.post('/login', authLimiter, validateLogin, handleValidationErrors, login);
router.post('/refresh', validateRefreshToken, handleValidationErrors, verifyRefreshToken, refreshToken);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, handleValidationErrors, updateProfile);
router.put('/change-password', authenticateToken, passwordLimiter, validatePasswordChange, handleValidationErrors, changePassword);

export default router; 