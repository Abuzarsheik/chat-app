# 🚀 Real-Time Chat Application

A modern, full-stack real-time chat application built with the MERN stack (MongoDB, Express.js, React.js, Node.js), TypeScript, and Socket.io. Features include user authentication, live messaging, online status indicators, and a beautiful responsive UI built with Tailwind CSS.

![Chat App Screenshot](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Real-Time+Chat+App)

## ✨ Features

### 🔐 Authentication & Security
- Secure user registration and login with JWT tokens
- Password hashing with bcrypt
- Protected routes and API endpoints
- HTTP-only cookies for token storage

### 💬 Real-Time Messaging
- Instant message delivery using Socket.io
- Live typing indicators
- Message read receipts
- Online/offline status indicators
- Message history persistence

### 🎨 Modern UI/UX
- Responsive design that works on all devices
- Beautiful chat interface with message bubbles
- Dark/light theme support
- Smooth animations and transitions
- Toast notifications for user feedback

### 👥 User Management
- User profiles with avatars
- Contact list with search functionality
- User presence tracking
- Last seen timestamps

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time communication
- **React Router** for navigation
- **React Hot Toast** for notifications
- **Axios** for API calls

### Backend
- **Node.js** with Express.js and TypeScript
- **Socket.io** for WebSocket connections
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Express Validator** for input validation

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/realtime-chat-app.git
cd realtime-chat-app
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install:all
```

### 3. Environment Setup

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

#### Frontend Environment Variables
Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or if using MongoDB service
sudo systemctl start mongod
```

### 5. Run the Application

```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Socket.io**: http://localhost:5000

## 📁 Project Structure

```
realtime-chat-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── socket.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── messageController.ts
│   │   │   └── userController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── validation.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Message.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── messages.ts
│   │   │   └── users.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   └── common/
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ChatContext.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── dateUtils.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tailwind.config.js
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Messages
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/:userId` - Get messages with specific user
- `POST /api/messages` - Send a new message
- `PUT /api/messages/read/:userId` - Mark messages as read

### Users
- `GET /api/users` - Get all users
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile

## 🌐 Socket.io Events

### Client to Server
- `sendMessage` - Send a new message
- `typing` - Send typing indicator
- `markAsRead` - Mark messages as read

### Server to Client
- `receiveMessage` - Receive new message
- `messageDelivered` - Message delivery confirmation
- `userOnline` - User came online
- `userOffline` - User went offline
- `userTyping` - User is typing
- `messagesRead` - Messages were read

## 🚀 Deployment

### Frontend (Vercel)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Vercel:
```bash
npx vercel --prod
```

### Backend (Render)

1. Create a `render.yaml` file in the backend directory:
```yaml
services:
  - type: web
    name: chat-backend
    env: node
    plan: free
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: chatapp
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: CLIENT_URL
        value: https://your-frontend-url.vercel.app
```

2. Deploy to Render by connecting your GitHub repository.

### Database (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get the connection string
4. Update the `MONGODB_URI` environment variable

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Server-side validation with express-validator
- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: API rate limiting (recommended for production)
- **Environment Variables**: Sensitive data stored in environment variables

## 🎯 Performance Optimizations

- **Database Indexing**: Optimized MongoDB queries
- **Message Pagination**: Efficient message loading
- **Connection Pooling**: MongoDB connection optimization
- **Gzip Compression**: Reduced payload sizes
- **Static File Caching**: Optimized asset delivery

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Socket.io team for the excellent real-time communication library
- Tailwind CSS for the beautiful utility-first CSS framework
- MongoDB team for the powerful NoSQL database
- React team for the amazing frontend framework

## 📞 Support

If you have any questions or need help with the setup, please open an issue or contact:

- **Email**: your.email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your LinkedIn](https://linkedin.com/in/yourprofile)

---

⭐ **Star this repository if you found it helpful!**

Built with ❤️ by [Your Name](https://github.com/yourusername) 