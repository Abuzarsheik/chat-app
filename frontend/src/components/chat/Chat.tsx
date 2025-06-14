import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { usersAPI } from '../../services/api';
import { User } from '../../types';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import UserList from './UserList';
import LoadingSpinner from '../common/LoadingSpinner';

const Chat: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const { state: chatState, loadConversations, selectUser } = useChat();
  const [users, setUsers] = useState<User[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load conversations and users in parallel
        const [conversationsResult, usersResult] = await Promise.allSettled([
          loadConversations(),
          usersAPI.getUsers()
        ]);

        if (usersResult.status === 'fulfilled') {
          setUsers(usersResult.value.users);
        }
      } catch (error) {
        console.error('Failed to load chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authState.isAuthenticated) {
      loadData();
    }
  }, [authState.isAuthenticated, loadConversations]);

  const handleUserSelect = (user: User) => {
    selectUser(user);
    setShowUserList(false);
  };

  const handleNewChat = () => {
    setShowUserList(true);
  };

  const handleBackToSidebar = () => {
    selectUser(null);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className={`${
        chatState.selectedUser ? 'hidden lg:block' : 'block'
      } w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col`}>
        <ChatSidebar 
          onNewChat={handleNewChat}
          onUserSelect={handleUserSelect}
          onLogout={logout}
        />
      </div>

      {/* Main Chat Area */}
      <div className={`${
        chatState.selectedUser ? 'block' : 'hidden lg:block'
      } flex-1 flex flex-col`}>
        {chatState.selectedUser ? (
          <ChatWindow 
            user={chatState.selectedUser}
            onBack={handleBackToSidebar}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Chat App
              </h3>
              <p className="text-gray-600 mb-4">
                Select a conversation to start chatting
              </p>
              <button
                onClick={handleNewChat}
                className="btn btn-primary"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User List Modal */}
      {showUserList && (
        <UserList
          users={users}
          onUserSelect={handleUserSelect}
          onClose={() => setShowUserList(false)}
        />
      )}
    </div>
  );
};

export default Chat; 