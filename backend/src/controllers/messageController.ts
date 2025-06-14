import { Response, NextFunction } from 'express';
import Message from '../models/Message';
import User from '../models/User';
import { sendResponse, AppError, asyncHandler } from '../middleware/errorHandler';
import { IAuthRequest } from '../types';

/**
 * Get conversation messages between two users
 */
export const getConversation = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const { userId } = req.params;
  
  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }
  
  const messages = await Message.getConversation(req.user.userId, userId);

  sendResponse.success(res, messages, 'Conversation retrieved successfully');
});

/**
 * Send a new message
 */
export const sendMessage = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const { recipientId, content, messageType = 'text' } = req.body;

  const message = new Message({
    sender: req.user.userId,
    recipient: recipientId,
    content,
    messageType
  });

  await message.save();
  await message.populate(['sender', 'recipient']);

  sendResponse.success(res, message, 'Message sent successfully', 201);
});

/**
 * Mark messages as read
 */
export const markAsRead = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const { messageIds } = req.body;
  const userId = req.user.userId;

  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    return next(new AppError('Message IDs array is required', 400));
  }

  // Validate message IDs and ensure user is recipient
  const messages = await Message.find({
    _id: { $in: messageIds },
    recipient: userId
  });

  if (messages.length !== messageIds.length) {
    return next(new AppError('Some messages not found or access denied', 400));
  }

  // Mark as read
  const result = await Message.markAsRead(messageIds, userId);

  sendResponse.success(res, {
    markedCount: result.modifiedCount,
    messageIds
  }, 'Messages marked as read');
});

/**
 * Get message by ID
 */
export const getMessageById = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const { messageId } = req.params;
  const userId = req.user.userId;

  const message = await Message.findById(messageId)
    .populate('sender', 'username email')
    .populate('recipient', 'username email');

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  // Check if user is sender or recipient
  const senderId = (message.sender as any)._id ? (message.sender as any)._id.toString() : message.sender.toString();
  const recipientId = (message.recipient as any)._id ? (message.recipient as any)._id.toString() : message.recipient.toString();
  
  if (senderId !== userId && recipientId !== userId) {
    return next(new AppError('Access denied', 403));
  }

  const responseData = {
    id: message._id.toString(),
    sender: {
      id: (message.sender as any)._id.toString(),
      username: (message.sender as any).username,
      email: (message.sender as any).email
    },
    recipient: {
      id: (message.recipient as any)._id.toString(),
      username: (message.recipient as any).username,
      email: (message.recipient as any).email
    },
    content: message.content,
    messageType: message.messageType,
    readBy: message.readBy,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt
  };

  sendResponse.success(res, responseData, 'Message retrieved successfully');
});

/**
 * Delete a message (soft delete - mark as deleted)
 */
export const deleteMessage = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const { messageId } = req.params;
  const userId = req.user.userId;

  const message = await Message.findById(messageId);

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  // Only sender can delete their own messages
  if (message.sender.toString() !== userId) {
    return next(new AppError('You can only delete your own messages', 403));
  }

  // Soft delete - replace content with deletion notice
  message.content = '[Message deleted]';
  message.messageType = 'text';
  await message.save();

  sendResponse.success(res, {
    messageId,
    deleted: true
  }, 'Message deleted successfully');
});

/**
 * Get recent conversations with last messages
 */
export const getRecentConversations = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const userId = req.user.userId;
  const conversations = await Message.getRecentConversations(userId);

  sendResponse.success(res, conversations, 'Recent conversations retrieved successfully');
});

/**
 * Search messages
 */
export const searchMessages = asyncHandler(async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  const { q: query, userId: otherUserId, limit = 20 } = req.query;
  const currentUserId = req.user.userId;

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return next(new AppError('Search query must be at least 2 characters', 400));
  }

  const limitNum = Math.min(parseInt(limit as string, 10) || 20, 50);
  const searchRegex = new RegExp(query.trim(), 'i');

  let searchFilter: any = {
    $or: [
      { sender: currentUserId },
      { recipient: currentUserId }
    ],
    content: searchRegex
  };

  // If searching within specific conversation
  if (otherUserId && typeof otherUserId === 'string') {
    searchFilter = {
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ],
      content: searchRegex
    };
  }

  const messages = await Message.find(searchFilter)
    .populate('sender', 'username email')
    .populate('recipient', 'username email')
    .sort({ createdAt: -1 })
    .limit(limitNum);

  const formattedMessages = messages.map(msg => ({
    id: msg._id.toString(),
    sender: {
      id: (msg.sender as any)._id.toString(),
      username: (msg.sender as any).username,
      email: (msg.sender as any).email
    },
    recipient: {
      id: (msg.recipient as any)._id.toString(),
      username: (msg.recipient as any).username,
      email: (msg.recipient as any).email
    },
    content: msg.content,
    messageType: msg.messageType,
    createdAt: msg.createdAt
  }));

  sendResponse.success(res, {
    messages: formattedMessages,
    query: query.trim(),
    totalResults: formattedMessages.length
  }, `Found ${formattedMessages.length} messages`);
}); 