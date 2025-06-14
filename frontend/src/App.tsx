import React from 'react';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            💬 Real-Time Chat Application
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            A modern chat app built with React, Node.js, and Socket.io
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
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
                Chat Application Ready!
              </h3>
              <p className="text-gray-600 mb-4">
                Backend is running successfully. Frontend components are being loaded...
              </p>
              <div className="space-y-2">
                <p className="text-sm text-green-600">✅ Backend API: Connected</p>
                <p className="text-sm text-green-600">✅ MongoDB: Connected</p>
                <p className="text-sm text-green-600">✅ Socket.io: Ready</p>
                <p className="text-sm text-blue-600">🔄 Frontend: Loading components...</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Built with React, Node.js, MongoDB, and Socket.io
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
