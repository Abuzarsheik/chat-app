# 💬 Real-Time Chat Application

A modern, full-stack real-time chat application built with the MERN stack, featuring instant messaging, user authentication, and real-time notifications.

![Chat App Demo](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Real-Time+Chat+App)

## 🚀 Features

### ✨ Core Features
- **Real-time messaging** with Socket.io
- **User authentication** (JWT-based)
- **Online/offline status** indicators
- **Typing indicators**
- **Message history** persistence
- **Responsive design** for all devices
- **User search** and contact management

### 🔒 Security
- JWT token authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS protection

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time communication
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Socket.io** for WebSocket connections
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing

### Development Tools
- **Nodemon** for development
- **Concurrently** for running services
- **ESLint** and **Prettier** for code quality

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Abuzarsheik/chat-app.git
cd chat-app
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Environment Configuration

#### Backend (.env)
Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env)
Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Start MongoDB

```bash
# Local MongoDB
mongod

# Or using MongoDB service
sudo systemctl start mongod
```

### 5. Run the Application

#### Option A: Run Both Services Together
```bash
# From root directory
npm run dev
```

#### Option B: Run Services Separately
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
chat-app/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database & Socket.io configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth & validation middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Server entry point
│   ├── .env.example        # Environment template
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── chat/       # Chat interface components
│   │   │   └── common/     # Shared components
│   │   ├── contexts/       # React context providers
│   │   ├── services/       # API & Socket services
│   │   ├── types/          # TypeScript definitions
│   │   └── App.tsx         # Main app component
│   ├── .env.example        # Environment template
│   └── package.json
├── .gitignore              # Git ignore rules
├── README.md               # This file
└── package.json            # Root package configuration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Messages
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages/:userId` - Get messages with specific user
- `POST /api/messages` - Send new message
- `PUT /api/messages/read/:userId` - Mark messages as read

### Users
- `GET /api/users` - Get all users
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile

## 🌐 Socket.io Events

### Client → Server
- `sendMessage` - Send new message
- `typing` - Send typing indicator
- `markAsRead` - Mark messages as read

### Server → Client
- `receiveMessage` - Receive new message
- `messageDelivered` - Message delivery confirmation
- `userOnline` - User came online
- `userOffline` - User went offline
- `userTyping` - User is typing
- `messagesRead` - Messages were read

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the frontend:
```bash
cd frontend && npm run build
```

2. Deploy to Vercel:
```bash
npx vercel --prod
```

3. Set environment variables in your hosting platform.

### Backend (Render/Railway/Heroku)

1. Set production environment variables
2. Use MongoDB Atlas for database
3. Deploy using your preferred platform

### Environment Variables for Production

**Backend:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
JWT_SECRET=your_production_jwt_secret_key
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
```

**Frontend:**
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_SOCKET_URL=https://your-backend-domain.com
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts (EADDRINUSE)**
   ```bash
   # Kill processes using ports
   npx kill-port 3000 5000
   ```

2. **MongoDB connection issues**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - For Atlas, verify IP whitelist

3. **Module resolution errors**
   ```bash
   # Clear caches and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Socket.io connection issues**
   - Verify `REACT_APP_SOCKET_URL` points to backend
   - Check CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Abuzar Sheik**
- GitHub: [@Abuzarsheik](https://github.com/Abuzarsheik)

## 🙏 Acknowledgments

- React team for the amazing framework
- Socket.io for real-time communication
- MongoDB for the database
- Tailwind CSS for the styling system

---

**⭐ If you found this project helpful, please give it a star!** 