import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Temporary simple components for testing routing
const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">🔐 Login Page</h2>
          <p className="mt-2 text-gray-600">Sprint 1: Basic routing is working!</p>
          <div className="mt-4 p-4 bg-green-100 rounded-lg">
            <p className="text-green-800">✅ React Router successfully integrated</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">📝 Register Page</h2>
          <p className="mt-2 text-gray-600">Sprint 1: Basic routing is working!</p>
          <div className="mt-4 p-4 bg-blue-100 rounded-lg">
            <p className="text-blue-800">✅ Multiple routes working correctly</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">💬 Chat Page</h2>
          <p className="mt-2 text-gray-600">Sprint 1: Basic routing is working!</p>
          <div className="mt-4 p-4 bg-purple-100 rounded-lg">
            <p className="text-purple-800">✅ Protected route placeholder ready</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
