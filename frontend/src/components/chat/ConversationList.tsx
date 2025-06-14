import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import { User } from '../../types';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface ConversationListProps {
  onUserSelect: (user: User) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onUserSelect }) => {
  const { state } = useChat();

  if (state.loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state.conversations.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-500 mb-2">No conversations yet</div>
        <p className="text-sm text-gray-400">Start a new chat to begin</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {state.conversations.map((conversation) => (
        <div
          key={conversation._id}
          onClick={() => onUserSelect(conversation.user)}
          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                {conversation.user.avatar ? (
                  <img
                    src={conversation.user.avatar}
                    alt={conversation.user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 font-medium">
                    {conversation.user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Online status */}
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  state.onlineUsers.includes(conversation.user._id)
                    ? 'bg-green-500'
                    : 'bg-gray-400'
                }`}
              ></div>
            </div>

            {/* Conversation info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {conversation.user.username}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(conversation.lastMessage.createdAt))}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage.content}
                </p>
                
                {/* Unread count */}
                {conversation.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList; 