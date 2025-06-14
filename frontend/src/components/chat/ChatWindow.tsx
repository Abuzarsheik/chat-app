import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { Message } from '../../types';

const ChatWindow: React.FC = () => {
  const { state: chatState, sendMessage, sendTyping, loadMessages } = useChat();
  const { state: authState } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (chatState.selectedUser) {
      loadMessages(chatState.selectedUser._id);
    }
  }, [chatState.selectedUser, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !chatState.selectedUser) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      await sendMessage(chatState.selectedUser._id, content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = () => {
    if (!chatState.selectedUser) return;

    if (!isTyping) {
      setIsTyping(true);
      sendTyping(chatState.selectedUser._id, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = window.setTimeout(() => {
      setIsTyping(false);
      if (chatState.selectedUser) {
        sendTyping(chatState.selectedUser._id, false);
      }
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString();
  };

  const renderMessage = (message: Message, index: number) => {
    const isCurrentUser = typeof message.sender === 'object' 
      ? message.sender._id === authState.user?._id
      : message.sender === authState.user?._id;

    const showDateHeader = index === 0 || 
      new Date(message.createdAt).toDateString() !== 
      new Date(chatState.messages[index - 1].createdAt).toDateString();

    const showAvatar = index === chatState.messages.length - 1 ||
      (index < chatState.messages.length - 1 && (
        typeof message.sender === 'object' && typeof chatState.messages[index + 1].sender === 'object'
          ? message.sender._id !== (chatState.messages[index + 1].sender as any)._id
          : message.sender !== chatState.messages[index + 1].sender
      ));

    return (
      <div key={message._id}>
        {showDateHeader && (
          <div className="flex justify-center my-4">
            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
              {formatDate(message.createdAt)}
            </span>
          </div>
        )}
        
        <div className={`flex items-end space-x-2 mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          {!isCurrentUser && showAvatar && (
            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {typeof message.sender === 'object' 
                ? message.sender.username.charAt(0).toUpperCase()
                : 'U'}
            </div>
          )}
          
          {!isCurrentUser && !showAvatar && (
            <div className="w-8 h-8"></div>
          )}
          
          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isCurrentUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-900 border border-gray-200'
          }`}>
            <p className="text-sm">{message.content}</p>
            <div className={`text-xs mt-1 ${
              isCurrentUser ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {formatTime(message.createdAt)}
              {isCurrentUser && (
                <span className="ml-1">
                  {message.isRead ? '✓✓' : '✓'}
                </span>
              )}
            </div>
          </div>
          
          {isCurrentUser && showAvatar && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {authState.user?.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!chatState.selectedUser) {
    return null;
  }

  const isUserTyping = chatState.typingUsers[chatState.selectedUser._id];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {chatState.selectedUser.username.charAt(0).toUpperCase()}
            </div>
            {chatState.onlineUsers.includes(chatState.selectedUser._id) && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {chatState.selectedUser.username}
            </h2>
            <p className="text-sm text-gray-500">
              {chatState.onlineUsers.includes(chatState.selectedUser._id) ? (
                <span className="text-green-600">Online</span>
              ) : (
                `Last seen ${new Date(chatState.selectedUser.lastSeen).toLocaleString()}`
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Call"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Video call"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-thin">
        {chatState.loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : chatState.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500">
                Send a message to {chatState.selectedUser.username}
              </p>
            </div>
          </div>
        ) : (
          <>
            {chatState.messages.map((message, index) => renderMessage(message, index))}
            {isUserTyping && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {chatState.selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Attach file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                handleTyping();
              }}
              placeholder={`Message ${chatState.selectedUser.username}...`}
              className="w-full px-4 py-2 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow; 