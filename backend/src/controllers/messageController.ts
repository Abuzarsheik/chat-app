import { Request, Response } from 'express';
import Message from '../models/Message';
import User from '../models/User';

// @desc    Get messages between two users
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Validate if the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Get messages between current user and the specified user
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'username avatar')
    .populate('receiver', 'username avatar')
    .sort({ createdAt: 1 })
    .limit(100); // Limit to last 100 messages

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        isRead: false
      },
      { isRead: true, readAt: new Date() }
    );

    res.json({ messages });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user?._id;

    if (!senderId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!receiverId || !content) {
      res.status(400).json({ message: 'Receiver and content are required' });
      return;
    }

    // Validate if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      res.status(404).json({ message: 'Receiver not found' });
      return;
    }

    // Create new message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      messageType
    });

    await message.save();

    // Populate sender and receiver info
    await message.populate('sender', 'username avatar');
    await message.populate('receiver', 'username avatar');

    res.status(201).json({ message });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get conversations list
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Get all users who have sent or received messages from current user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: '$user._id',
            username: '$user.username',
            avatar: '$user.avatar',
            isOnline: '$user.isOnline',
            lastSeen: '$user.lastSeen'
          },
          lastMessage: {
            content: '$lastMessage.content',
            createdAt: '$lastMessage.createdAt',
            messageType: '$lastMessage.messageType'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json({ conversations });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
// @access  Private
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    if (!currentUserId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        isRead: false
      },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 