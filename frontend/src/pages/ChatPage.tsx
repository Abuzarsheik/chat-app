import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import { 
  LogOut, 
  Users, 
  Settings, 
  Search, 
  Send, 
  MoreVertical, 
  X, 
  Moon, 
  Sun,
  User,
  Mail,
  Phone,
  Bell,
  Shield,
  Palette
} from 'lucide-react';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
  };
  receiver: string;
  timestamp: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen: string;
  }>;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  unreadCount: number;
}

const ChatPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { socket, isConnected, onlineUsers } = useSocket();
  
  // State management
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (newMessage: Message) => {
      setMessages(prev => [...prev, newMessage]);
      // Update conversation last message
      setConversations(prev => prev.map(conv => {
        if (conv._id === selectedConversation) {
          return {
            ...conv,
            lastMessage: {
              content: newMessage.content,
              sender: newMessage.sender.username,
              timestamp: newMessage.timestamp
            }
          };
        }
        return conv;
      }));
      toast.success(`New message from ${newMessage.sender.username}`);
    });

    socket.on('message-sent', (sentMessage: Message) => {
      setMessages(prev => [...prev, sentMessage]);
    });

    return () => {
      socket.off('receive-message');
      socket.off('message-sent');
    };
  }, [socket, selectedConversation]);

  // Load conversations from API
  const loadConversations = async () => {
    try {
      setIsLoading(true);
      // For now, create mock conversations with demo users
      const mockConversations: Conversation[] = [
        {
          _id: 'conv1',
          participants: [
            {
              _id: user?.id || '',
              username: user?.username || '',
              email: user?.email || '',
              isOnline: true,
              lastSeen: new Date().toISOString()
            },
            {
              _id: 'demo2-id',
              username: 'TestUser',
              email: 'demo2@chatapp.com',
              isOnline: false,
              lastSeen: new Date().toISOString()
            }
          ],
          lastMessage: {
            content: 'Hello! How are you?',
            sender: 'TestUser',
            timestamp: new Date().toISOString()
          },
          unreadCount: 0
        }
      ];
      setConversations(mockConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      // For now, create mock messages
      const mockMessages: Message[] = [
        {
          _id: 'msg1',
          content: 'Hello! How are you?',
          sender: {
            _id: 'demo2-id',
            username: 'TestUser',
            avatar: ''
          },
          receiver: user?.id || '',
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          _id: 'msg2',
          content: 'I\'m doing great! Thanks for asking.',
          sender: {
            _id: user?.id || '',
            username: user?.username || '',
            avatar: ''
          },
          receiver: 'demo2-id',
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    loadMessages(conversationId);
    
    // Mark messages as read
    if (socket) {
      socket.emit('mark-messages-read', { conversationId });
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation || !socket) return;

    const selectedConv = conversations.find(c => c._id === selectedConversation);
    if (!selectedConv) return;

         const receiver = selectedConv.participants.find(p => p._id !== user?.id);
    if (!receiver) return;

         try {
       // Create new message object
       const newMessage: Message = {
         _id: `msg-${Date.now()}`,
         content: message.trim(),
         sender: {
           _id: user?.id || '',
           username: user?.username || '',
           avatar: ''
         },
         receiver: receiver._id,
         timestamp: new Date().toISOString(),
         createdAt: new Date().toISOString()
       };

       // Add message to local state immediately
       setMessages(prev => [...prev, newMessage]);

       // Emit message via socket
       socket.emit('send-message', {
         receiverId: receiver._id,
         content: message.trim()
       });

       // Clear input
       setMessage('');
       
       // Show success feedback
       toast.success('Message sent!');
     } catch (error) {
       console.error('Error sending message:', error);
       toast.error('Failed to send message');
     }
  };

     // Filter conversations based on search
   const filteredConversations = conversations.filter(conv => {
     const otherParticipant = conv.participants.find(p => p._id !== user?.id);
     return otherParticipant?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            otherParticipant?.email.toLowerCase().includes(searchQuery.toLowerCase());
   });

     // Get selected conversation details
   const selectedConv = conversations.find(c => c._id === selectedConversation);
   const chatPartner = selectedConv?.participants.find(p => p._id !== user?.id);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // Settings Modal Component
  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Profile Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Profile</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-lg">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user?.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Palette className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900 dark:text-white">Dark Mode</span>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900 dark:text-white">Notifications</span>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
            </button>
          </div>

          {/* Privacy */}
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900 dark:text-white">Privacy & Security</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-medium text-gray-900 dark:text-white">
                  {user?.username}
                </h2>
                <p className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                  {isConnected ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center p-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
                             const otherParticipant = conversation.participants.find(p => p._id !== user?.id);
              const isOnline = otherParticipant ? onlineUsers.includes(otherParticipant._id) : false;
              
              return (
                <div
                  key={conversation._id}
                  onClick={() => handleConversationSelect(conversation._id)}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedConversation === conversation._id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-r-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        {otherParticipant?.avatar ? (
                          <img 
                            src={otherParticipant.avatar} 
                            alt={otherParticipant.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {otherParticipant?.username?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {otherParticipant?.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {conversation.lastMessage?.timestamp && 
                            new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          }
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && chatPartner ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    {chatPartner.avatar ? (
                      <img 
                        src={chatPartner.avatar} 
                        alt={chatPartner.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {chatPartner.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {chatPartner.username}
                    </h3>
                    <p className={`text-sm ${
                      onlineUsers.includes(chatPartner._id) ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {onlineUsers.includes(chatPartner._id) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                                 messages.map((msg) => {
                   const isOwn = msg.sender._id === user?.id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isConnected}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || !isConnected}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-2">Disconnected - trying to reconnect...</p>
              )}
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Welcome to ChatApp
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal />}
    </div>
  );
};

export default ChatPage; 