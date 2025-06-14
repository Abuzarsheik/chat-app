import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Message from '../models/Message';
import { IJWTPayload, ISocketUser } from '../types';

// Store connected users
const connectedUsers = new Map<string, ISocketUser>();

// Socket authentication middleware
export const authenticateSocket = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new Error('JWT secret not configured'));
    }

    const decoded = jwt.verify(token, secret) as IJWTPayload;
    
    // Verify user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach user info to socket
    socket.data.user = decoded;
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
};

// Initialize socket handlers
export const initializeSocketHandlers = (io: SocketIOServer) => {
  io.use(authenticateSocket);

  io.on('connection', async (socket: Socket) => {
    try {
      const user = socket.data.user as IJWTPayload;
      console.log(`User ${user.username} connected with socket ID: ${socket.id}`);

      // Add user to connected users map
      const socketUser: ISocketUser = {
        userId: user.userId,
        socketId: socket.id,
        username: user.username,
        email: user.email
      };
      connectedUsers.set(user.userId, socketUser);

      // Set user as online in database
      await User.findByIdAndUpdate(user.userId, { online: true });

      // Join user to their own room
      socket.join(user.userId);

      // Notify other users that this user is online
      socket.broadcast.emit('user-online', user.userId);

      // Send current online users to newly connected user
      const onlineUserIds = Array.from(connectedUsers.keys());
      socket.emit('online-users', onlineUserIds);

      // Handle joining specific conversation rooms
      socket.on('join-conversation', (otherUserId: string) => {
        const roomId = [user.userId, otherUserId].sort().join('-');
        socket.join(roomId);
        console.log(`User ${user.username} joined conversation room: ${roomId}`);
      });

      // Handle leaving conversation rooms
      socket.on('leave-conversation', (otherUserId: string) => {
        const roomId = [user.userId, otherUserId].sort().join('-');
        socket.leave(roomId);
        console.log(`User ${user.username} left conversation room: ${roomId}`);
      });

      // Handle sending messages
      socket.on('send-message', async (data: {
        recipientId: string;
        content: string;
        messageType?: 'text' | 'image' | 'file';
      }) => {
        try {
          const { recipientId, content, messageType = 'text' } = data;

          // Validate recipient exists
          const recipient = await User.findById(recipientId);
          if (!recipient) {
            socket.emit('error', 'Recipient not found');
            return;
          }

          // Create message in database
          const message = new Message({
            sender: user.userId,
            recipient: recipientId,
            content,
            messageType
          });

          await message.save();
          await message.populate([
            { path: 'sender', select: 'username email' },
            { path: 'recipient', select: 'username email' }
          ]);

          const messageData = {
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
            createdAt: message.createdAt
          };

          // Send message to recipient if they're online
          const recipientSocket = connectedUsers.get(recipientId);
          if (recipientSocket) {
            io.to(recipientSocket.socketId).emit('receive-message', messageData);
          }

          // Send confirmation back to sender
          socket.emit('message-sent', messageData);

          console.log(`Message sent from ${user.username} to ${recipient.username}`);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', 'Failed to send message');
        }
      });

      // Handle typing indicators
      socket.on('typing', (recipientId: string) => {
        const recipientSocket = connectedUsers.get(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit('typing-indicator', {
            senderId: user.userId,
            senderName: user.username
          });
        }
      });

      socket.on('stop-typing', (recipientId: string) => {
        const recipientSocket = connectedUsers.get(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit('stop-typing-indicator', user.userId);
        }
      });

      // Handle marking messages as read
      socket.on('mark-as-read', async (data: {
        messageIds: string[];
        senderId: string;
      }) => {
        try {
          const { messageIds, senderId } = data;
          
          await Message.markAsRead(messageIds, user.userId);
          
          // Notify sender that messages were read
          const senderSocket = connectedUsers.get(senderId);
          if (senderSocket) {
            io.to(senderSocket.socketId).emit('messages-read', {
              messageIds,
              readBy: user.userId,
              readerName: user.username
            });
          }
        } catch (error) {
          console.error('Error marking messages as read:', error);
          socket.emit('error', 'Failed to mark messages as read');
        }
      });

      // Handle getting online status
      socket.on('get-user-status', (userId: string) => {
        const isOnline = connectedUsers.has(userId);
        socket.emit('user-status', { userId, online: isOnline });
      });

      // Handle disconnect
      socket.on('disconnect', async (reason: string) => {
        try {
          console.log(`User ${user.username} disconnected: ${reason}`);

          // Remove from connected users
          connectedUsers.delete(user.userId);

          // Set user as offline in database
          await User.findByIdAndUpdate(user.userId, { 
            online: false,
            lastSeen: new Date()
          });

          // Notify other users that this user is offline
          socket.broadcast.emit('user-offline', user.userId);
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      });

      // Handle errors
      socket.on('error', (error: Error) => {
        console.error(`Socket error for user ${user.username}:`, error);
      });

    } catch (error) {
      console.error('Error in socket connection:', error);
      socket.disconnect();
    }
  });

  // Handle connection errors
  io.on('connect_error', (error: Error) => {
    console.error('Socket.io connection error:', error);
  });
};

// Helper functions
export const getConnectedUsers = (): ISocketUser[] => {
  return Array.from(connectedUsers.values());
};

export const getUserSocket = (userId: string): ISocketUser | undefined => {
  return connectedUsers.get(userId);
};

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};

export const disconnectUser = (userId: string): boolean => {
  const user = connectedUsers.get(userId);
  if (user) {
    connectedUsers.delete(userId);
    return true;
  }
  return false;
}; 