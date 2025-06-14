import express from 'express';
import { 
  getUsers, 
  searchUsers, 
  getUserById, 
  updateProfile 
} from '../controllers/userController';
import { validateProfileUpdate } from '../middleware/validation';
import auth from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   GET /api/users
// @desc    Get all users for chat
// @access  Private
router.get('/', getUsers);

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get('/search', searchUsers);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', validateProfileUpdate, updateProfile);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', getUserById);

export default router; 