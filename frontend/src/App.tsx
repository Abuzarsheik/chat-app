import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginFormData } from './types';
import './App.css';

// Real Login Component for Sprint 3
const LoginPage: React.FC = () => {
  const { state, login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(formData);
      // Should redirect automatically via AuthContext
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
          <p className="text-gray-600">Setting up your chat experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            💬 Sign in to Chat
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sprint 3: Real Login Form Integration
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="form-input"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full flex justify-center py-2 px-4"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </a>
            </p>
          </div>
        </form>

        {/* Sprint 3 Status */}
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800 text-sm">✅ Sprint 3: Real login form integrated</p>
          <p className="text-xs mt-1">Auth Status: {state.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
        </div>
      </div>
    </div>
  );
};

// Keep Register as placeholder for now
const RegisterPage: React.FC = () => {
  const { state } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">📝 Register Page</h2>
          <p className="mt-2 text-gray-600">Sprint 3: Placeholder (Next Sprint)</p>
          <div className="mt-4 p-4 bg-blue-100 rounded-lg">
            <p className="text-blue-800">⏳ Coming in Sprint 4</p>
            <p className="text-sm mt-2">
              User: {state.user?.username || 'No user logged in'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Keep Chat as placeholder for now
const ChatPage: React.FC = () => {
  const { state } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">💬 Chat Page</h2>
          <p className="mt-2 text-gray-600">Sprint 3: Placeholder (Next Sprint)</p>
          <div className="mt-4 p-4 bg-purple-100 rounded-lg">
            <p className="text-purple-800">⏳ Coming in Sprint 5</p>
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
