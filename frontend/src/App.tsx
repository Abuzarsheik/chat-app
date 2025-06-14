import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Temporary simple components for testing auth integration
const LoginPage: React.FC = () => {
  const { state } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">🔐 Login Page</h2>
          <p className="mt-2 text-gray-600">Sprint 2: Auth Context Integration</p>
          <div className="mt-4 p-4 bg-green-100 rounded-lg">
            <p className="text-green-800">✅ AuthContext loaded successfully</p>
            <p className="text-sm mt-2">
              Auth Status: {state.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
            </p>
            <p className="text-sm">
              Loading: {state.loading ? '🔄 Loading...' : '✅ Ready'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegisterPage: React.FC = () => {
  const { state } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">📝 Register Page</h2>
          <p className="mt-2 text-gray-600">Sprint 2: Auth Context Integration</p>
          <div className="mt-4 p-4 bg-blue-100 rounded-lg">
            <p className="text-blue-800">✅ AuthContext working in Register</p>
            <p className="text-sm mt-2">
              User: {state.user?.username || 'No user logged in'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatPage: React.FC = () => {
  const { state } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">💬 Chat Page</h2>
          <p className="mt-2 text-gray-600">Sprint 2: Auth Context Integration</p>
          <div className="mt-4 p-4 bg-purple-100 rounded-lg">
            <p className="text-purple-800">✅ AuthContext working in Chat</p>
            <p className="text-sm mt-2">
              Token: {state.token ? '🔑 Token exists' : '❌ No token'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
