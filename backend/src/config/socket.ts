import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Message from '../models/Message';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Online users map
  const onlineUsers = new Map<string, string>();

  io.on('connection', async (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Add user to online users
    if (socket.userId) {
      onlineUsers.set(socket.userId, socket.id);
      
      // Update user online status
      await User.findByIdAndUpdate(socket.userId, { 
        isOnline: true,
        lastSeen: new Date()
      });

      // Broadcast user online status
      socket.broadcast.emit('userOnline', socket.userId);
    }

    // Join user to their own room
    if (socket.userId) {
      socket.join(socket.userId);
    }

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, content, messageType = 'text' } = data;
        
        if (!socket.userId) return;

        // Validate receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
          socket.emit('error', { message: 'Receiver not found' });
          return;
        }

        // Create message
        const message = new Message({
          sender: socket.userId,
          receiver: receiverId,
          content,
          messageType
        });

        await message.save();

        // Populate sender and receiver info
        await message.populate('sender', 'username avatar');
        await message.populate('receiver', 'username avatar');

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', message);
        }

        // Send confirmation to sender
        socket.emit('messageDelivered', message);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          userId: socket.userId,
          isTyping
        });
      }
    });

    // Handle marking messages as read
    socket.on('markAsRead', async (data) => {
      try {
        const { senderId } = data;
        
        if (!socket.userId) return;

        await Message.updateMany(
          {
            sender: senderId,
            receiver: socket.userId,
            isRead: false
          },
          { isRead: true, readAt: new Date() }
        );

        // Notify sender that messages were read
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messagesRead', {
            readerId: socket.userId
          });
        }

      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      if (socket.userId) {
        // Remove from online users
        onlineUsers.delete(socket.userId);
        
        // Update user offline status
        await User.findByIdAndUpdate(socket.userId, { 
          isOnline: false,
          lastSeen: new Date()
        });

        // Broadcast user offline status
        socket.broadcast.emit('userOffline', socket.userId);
      }
    });
  });

  return io;
}; 