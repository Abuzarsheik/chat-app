import { Response, NextFunction } from 'express';
import User from '../models/User';
import Message from '../models/Message';
import { sendResponse, AppError, asyncHandler } from '../middleware/errorHandler';
import { IAuthRequest } from '../types';

/**
 * Get all users except current user
 */
export const getAllUsers = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const users = await User.find({ _id: { $ne: req.user.userId } })
    .select('username email online lastSeen createdAt');

  sendResponse.success(res, users, 'Users retrieved successfully');
});

/**
 * Get online users
 */
export const getOnlineUsers = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const users = await User.find({ 
    _id: { $ne: req.user.userId }, 
    online: true 
  }).select('username email online lastSeen');

  sendResponse.success(res, users, 'Online users retrieved successfully');
});

/**
 * Get user by ID
 */
export const getUserById = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const user = await User.findById(req.params.userId)
    .select('username email online lastSeen createdAt');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  sendResponse.success(res, user, 'User retrieved successfully');
});

/**
 * Search users
 */
export const searchUsers = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return next(new AppError('Search query is required', 400));
  }

  const users = await User.searchUsers(q, req.user.userId);
  sendResponse.success(res, users, 'Users found successfully');
});

/**
 * Get user's conversation list with unread counts
 */
export const getConversations = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const conversations = await Message.getRecentConversations(req.user.userId);
  sendResponse.success(res, conversations, 'Conversations retrieved successfully');
});

/**
 * Get unread message counts per user
 */
export const getUnreadCounts = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const counts = await Message.getUnreadCount(req.user.userId);
  sendResponse.success(res, counts, 'Unread counts retrieved successfully');
});

/**
 * Block/Unblock user (placeholder for future feature)
 */
export const toggleBlockUser = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const { userId } = req.params;
  const { action } = req.body; // 'block' or 'unblock'

  if (userId === req.user.userId) {
    return next(new AppError('You cannot block yourself', 400));
  }

  if (!['block', 'unblock'].includes(action)) {
    return next(new AppError('Action must be either "block" or "unblock"', 400));
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return next(new AppError('User not found', 404));
  }

  // This is a placeholder - in a full implementation, you'd have a separate
  // BlockedUsers collection or add a blockedUsers field to the User model
  const message = action === 'block' 
    ? `User ${targetUser.username} blocked successfully`
    : `User ${targetUser.username} unblocked successfully`;

  sendResponse.success(res, { action, userId, username: targetUser.username }, message);
});

/**
 * Report user (placeholder for future feature)
 */
export const reportUser = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const { userId } = req.params;
  const { reason, description } = req.body;

  if (userId === req.user.userId) {
    return next(new AppError('You cannot report yourself', 400));
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    return next(new AppError('User not found', 404));
  }

  if (!reason) {
    return next(new AppError('Report reason is required', 400));
  }

  // This is a placeholder - in a full implementation, you'd save the report
  // to a Reports collection and implement moderation features
  
  const reportData = {
    reportedUserId: userId,
    reportedUsername: targetUser.username,
    reporterUserId: req.user.userId,
    reporterUsername: req.user.username,
    reason,
    description,
    timestamp: new Date()
  };

  sendResponse.success(res, reportData, 'User reported successfully. Our team will review this report.');
}); 