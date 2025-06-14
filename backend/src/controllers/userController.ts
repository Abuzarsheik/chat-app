import { Request, Response } from 'express';
import User from '../models/User';

// @desc    Get all users (for chat sidebar)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Get all users except current user
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('username email avatar isOnline lastSeen')
      .sort({ isOnline: -1, lastSeen: -1 });

    res.json({ users });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!q || typeof q !== 'string') {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    // Search users by username or email
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .select('username email avatar isOnline lastSeen')
    .limit(10);

    res.json({ users });
  } catch (error: any) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('username email avatar isOnline lastSeen');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { username, avatar } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Check if username is already taken
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });

      if (existingUser) {
        res.status(400).json({ message: 'Username already taken' });
        return;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...(username && { username }), ...(avatar && { avatar }) },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 