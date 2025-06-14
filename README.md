# 🚀 Real-Time Chat Application

A full-stack, real-time messaging application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) using TypeScript and Tailwind CSS.

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh and access tokens
- bcrypt password hashing
- Protected routes and WebSocket connections
- Input sanitization and validation
- Rate limiting and security headers

### 💬 Real-Time Messaging
- Socket.io for real-time communication
- 1-to-1 private messaging
- Message history stored in MongoDB
- Online/offline user status
- Typing indicators
- Unread message badges
- Toast notifications

### 🎨 Modern UI/UX
- Fully responsive mobile-first design
- Dark/light mode toggle
- Tailwind CSS styling
- Loading skeletons
- Smooth animations and transitions
- Emoji support

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** with TypeScript
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **bcrypt** for password hashing
- **Helmet** for security headers
- **Express-rate-limit** for rate limiting

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Socket.io-client** for real-time communication  
- **React Router DOM** for navigation
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd realtime-chat-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env` in the backend directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
FRONTEND_URL=http://localhost:3000
```

Create `.env.local` in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

4. **Start the development servers**
```bash
npm run dev
```

This will start both the backend server (http://localhost:5000) and frontend (http://localhost:3000).

## 📁 Project Structure

```
realtime-chat-app/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── sockets/        # Socket.io handlers
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Main server file
│   └── package.json
├── frontend/               # React.js frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main App component
│   └── package.json
└── package.json           # Root package.json
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users` - Get all users (protected)
- `GET /api/users/profile` - Get current user profile (protected)

### Messages
- `GET /api/messages/:userId` - Get conversation history (protected)

## 🔌 Socket Events

### Client to Server
- `join` - Join user to their room
- `send-message` - Send a message
- `typing` - User is typing
- `stop-typing` - User stopped typing

### Server to Client
- `receive-message` - Receive a new message
- `user-online` - User came online
- `user-offline` - User went offline
- `typing` - Someone is typing
- `stop-typing` - Someone stopped typing

## 🚀 Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy as a Web Service

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Set environment variables in Vercel dashboard
4. Deploy

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT tokens with expiration
- HTTP-only cookies for token storage
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Security headers with Helmet
- Protected routes and Socket.io connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. 