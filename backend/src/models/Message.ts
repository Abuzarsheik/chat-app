import mongoose, { Schema, Model } from 'mongoose';
import { IMessage, IMessageModel } from '../types';

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required']
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required']
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      trim: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text'
    },
    readBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      }
    }
  }
);

// Indexes for faster queries
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, readBy: 1 });
MessageSchema.index({ createdAt: -1 });

// Static method to get conversation messages
MessageSchema.statics.getConversation = function(userId1: string, userId2: string, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    $or: [
      { sender: userId1, recipient: userId2 },
      { sender: userId2, recipient: userId1 }
    ]
  })
  .populate('sender', 'username email')
  .populate('recipient', 'username email')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to mark messages as read
MessageSchema.statics.markAsRead = function(messageIds: string[], userId: string) {
  return this.updateMany(
    { 
      _id: { $in: messageIds },
      readBy: { $ne: userId }
    },
    { 
      $addToSet: { readBy: userId }
    }
  );
};

// Static method to get unread count
MessageSchema.statics.getUnreadCount = function(userId: string) {
  return this.aggregate([
    {
      $match: {
        recipient: new mongoose.Types.ObjectId(userId),
        readBy: { $ne: new mongoose.Types.ObjectId(userId) }
      }
    },
    {
      $group: {
        _id: '$sender',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'sender'
      }
    },
    {
      $unwind: '$sender'
    },
    {
      $project: {
        senderId: '$_id',
        senderName: '$sender.username',
        senderEmail: '$sender.email',
        count: 1
      }
    }
  ]);
};

// Static method to get recent conversations
MessageSchema.statics.getRecentConversations = function(userId: string) {
  // Validate and convert userId to ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format');
  }
  
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  return this.aggregate([
    {
      $match: {
        $or: [
          { sender: userObjectId },
          { recipient: userObjectId }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: {
            if: { $eq: ['$sender', userObjectId] },
            then: '$recipient',
            else: '$sender'
          }
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$recipient', userObjectId] },
                  { $not: { $in: [userObjectId, '$readBy'] } }
                ]
              },
              then: 1,
              else: 0
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'participant'
      }
    },
    {
      $unwind: '$participant'
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    },
    {
      $project: {
        participant: {
          id: '$participant._id',
          username: '$participant.username',
          email: '$participant.email',
          online: '$participant.online',
          lastSeen: '$participant.lastSeen'
        },
        lastMessage: {
          id: '$lastMessage._id',
          content: '$lastMessage.content',
          messageType: '$lastMessage.messageType',
          createdAt: '$lastMessage.createdAt'
        },
        unreadCount: 1
      }
    }
  ]);
};

export default mongoose.model<IMessage, Model<IMessage> & IMessageModel>('Message', MessageSchema); 