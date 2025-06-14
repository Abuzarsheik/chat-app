import { io, Socket } from 'socket.io-client';
import { Message, SocketEvents } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private readonly url: string;

  constructor() {
    this.url = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
  }

  connect(token: string): void {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(this.url, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Message events
  sendMessage(data: { receiverId: string; content: string; messageType?: string }): void {
    if (this.socket) {
      this.socket.emit('sendMessage', data);
    }
  }

  onReceiveMessage(callback: (message: Message) => void): void {
    if (this.socket) {
      this.socket.on('receiveMessage', callback);
    }
  }

  onMessageDelivered(callback: (message: Message) => void): void {
    if (this.socket) {
      this.socket.on('messageDelivered', callback);
    }
  }

  // Typing events
  sendTyping(receiverId: string, isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit('typing', { receiverId, isTyping });
    }
  }

  onUserTyping(callback: (data: { userId: string; isTyping: boolean }) => void): void {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  // Read receipt events
  markAsRead(senderId: string): void {
    if (this.socket) {
      this.socket.emit('markAsRead', { senderId });
    }
  }

  onMessagesRead(callback: (data: { readerId: string }) => void): void {
    if (this.socket) {
      this.socket.on('messagesRead', callback);
    }
  }

  // User status events
  onUserOnline(callback: (userId: string) => void): void {
    if (this.socket) {
      this.socket.on('userOnline', callback);
    }
  }

  onUserOffline(callback: (userId: string) => void): void {
    if (this.socket) {
      this.socket.on('userOffline', callback);
    }
  }

  // Error events
  onError(callback: (data: { message: string }) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Remove event listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  removeListener(event: string, callback?: Function): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService(); 