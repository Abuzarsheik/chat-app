import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { formatLastSeen } from '../../utils/dateUtils';

interface ChatWindowProps {
  user: User;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user, onBack }) => {
  const { state: chatState, loadMessages, markAsRead, sendTyping, sendMessage } = useChat();
  const { state: authState } = useAuth();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Load messages when user changes
  useEffect(() => {
    if (user) {
      loadMessages(user._id);
      markAsRead(user._id);
    }
  }, [user, loadMessages, markAsRead]);

  // Handle typing indicator
  const handleTyping = (typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      sendTyping(user._id, typing);

      // Clear typing after 3 seconds of inactivity
      if (typing) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          sendTyping(user._id, false);
        }, 3000);
      }
    }
  };

  const isUserOnline = chatState.onlineUsers.includes(user._id);
  const isUserTyping = chatState.typingUsers[user._id];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="relative">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                isUserOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></div>
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">{user.username}</h2>
            <p className="text-sm text-gray-500">
              {isUserOnline 
                ? 'Online' 
                : formatLastSeen(new Date(user.lastSeen))
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={chatState.messages}
          currentUserId={authState.user?._id || ''}
          isTyping={isUserTyping}
          typingUser={user}
        />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white">
        <MessageInput
          onSendMessage={async (content) => {
            await sendMessage(user._id, content);
          }}
          onTyping={handleTyping}
          disabled={chatState.loading}
        />
      </div>
    </div>
  );
};

export default ChatWindow; 