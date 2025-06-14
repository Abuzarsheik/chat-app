import React, { useEffect, useRef } from 'react';
import { Message, User } from '../../types';
import { formatMessageTime, formatMessageDate, isSameDay } from '../../utils/dateUtils';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isTyping?: boolean;
  typingUser?: User;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isTyping,
  typingUser,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = formatMessageDate(new Date(message.createdAt));
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const renderMessage = (message: Message, isLast: boolean, isFirst: boolean) => {
    const isOwnMessage = typeof message.sender === 'object' 
      ? message.sender._id === currentUserId 
      : message.sender === currentUserId;
    
    const senderInfo = typeof message.sender === 'object' ? message.sender : null;

    return (
      <div
        key={message._id}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
      >
        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          {/* Show avatar for received messages (first in group) */}
          {!isOwnMessage && isFirst && senderInfo && (
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                {senderInfo.avatar ? (
                  <img
                    src={senderInfo.avatar}
                    alt={senderInfo.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-600 font-medium">
                    {senderInfo.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {senderInfo.username}
              </span>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`px-4 py-2 rounded-lg break-words ${
              isOwnMessage
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-white text-gray-900 border border-gray-200'
            } ${
              isFirst && isLast
                ? 'rounded-lg'
                : isFirst
                ? isOwnMessage
                  ? 'rounded-t-lg rounded-bl-lg rounded-br-sm'
                  : 'rounded-t-lg rounded-br-lg rounded-bl-sm'
                : isLast
                ? isOwnMessage
                  ? 'rounded-b-lg rounded-tl-lg rounded-tr-sm'
                  : 'rounded-b-lg rounded-tr-lg rounded-tl-sm'
                : isOwnMessage
                ? 'rounded-l-lg rounded-tr-sm rounded-br-sm'
                : 'rounded-r-lg rounded-tl-sm rounded-bl-sm'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>

          {/* Timestamp and read status */}
          {isLast && (
            <div className={`flex items-center mt-1 text-xs text-gray-500 ${
              isOwnMessage ? 'justify-end' : 'justify-start'
            }`}>
              <span>{formatMessageTime(new Date(message.createdAt))}</span>
              {isOwnMessage && (
                <div className="ml-1">
                  {message.isRead ? (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Group consecutive messages from the same sender
  const getMessageGroups = (messages: Message[]) => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];

    messages.forEach((message, index) => {
      const prevMessage = messages[index - 1];
      const currentSenderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
      const prevSenderId = prevMessage 
        ? typeof prevMessage.sender === 'object' ? prevMessage.sender._id : prevMessage.sender 
        : null;

      if (currentSenderId === prevSenderId && currentGroup.length > 0) {
        currentGroup.push(message);
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [message];
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">No messages yet</p>
          <p className="text-sm">Send a message to start the conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center mb-4">
            <div className="px-3 py-1 bg-gray-100 rounded-full">
              <span className="text-xs text-gray-600 font-medium">{date}</span>
            </div>
          </div>

          {/* Messages for this date */}
          {getMessageGroups(dateMessages).map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1">
              {group.map((message, messageIndex) =>
                renderMessage(
                  message,
                  messageIndex === group.length - 1,
                  messageIndex === 0
                )
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && typingUser && (
        <div className="flex justify-start mb-2">
          <div className="max-w-xs lg:max-w-md">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                {typingUser.avatar ? (
                  <img
                    src={typingUser.avatar}
                    alt={typingUser.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-600 font-medium">
                    {typingUser.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {typingUser.username} is typing...
              </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 