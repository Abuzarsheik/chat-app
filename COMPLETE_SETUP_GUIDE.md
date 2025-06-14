# 🚀 Complete Real-Time Chat Application Setup Guide

## ✅ What's Already Implemented

### Backend Features
- ✅ Express.js server with TypeScript
- ✅ MongoDB with Mongoose ODM
- ✅ JWT authentication with bcrypt
- ✅ Socket.io for real-time communication
- ✅ RESTful API endpoints
- ✅ Input validation with express-validator
- ✅ CORS configuration
- ✅ Cookie-based authentication
- ✅ User online/offline status
- ✅ Message persistence
- ✅ TypeScript type definitions

### Frontend Features
- ✅ React 18 with TypeScript
- ✅ Tailwind CSS for styling
- ✅ Socket.io client integration
- ✅ Context-based state management
- ✅ React Router for navigation
- ✅ Toast notifications (react-hot-toast)
- ✅ Real-time messaging interface
- ✅ Authentication forms
- ✅ Responsive mobile-first design
- ✅ Message components (MessageList, MessageInput)
- ✅ User management interface
- ✅ Typing indicators
- ✅ Online status indicators

## 🔧 Prerequisites

Before running the application, ensure you have:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Either:
   - Local installation - [Download MongoDB Community](https://www.mongodb.com/try/download/community)
   - OR MongoDB Atlas account - [Sign up](https://www.mongodb.com/cloud/atlas)
3. **Git** (optional) - [Download](https://git-scm.com/)


## 🏃‍♂️ Step-by-Step Setup

### Step 1: Verify Dependencies

All dependencies are already installed, but if you need to reinstall:

```bash
# Root dependencies
npm install

# Backend dependencies (already done)
cd backend && npm install

# Frontend dependencies (already done)  
cd ../frontend && npm install
```

### Step 2: Create Environment Files

**Windows (PowerShell):**
```powershell
# Backend .env
New-Item -Path "backend\.env" -ItemType File -Force
Add-Content -Path "backend\.env" -Value @"
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/realtime-chat
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-at-least-32-characters-long
CORS_ORIGIN=http://localhost:3000
"@

# Frontend .env
New-Item -Path "frontend\.env" -ItemType File -Force
Add-Content -Path "frontend\.env" -Value @"
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
"@
```

**Or manually create the files using any text editor.**

### Step 3: Start MongoDB

#### Option A: Local MongoDB
```bash
# Windows (if MongoDB is installed as service)
net start MongoDB

# Or manually
mongod

# Linux/Mac
sudo systemctl start mongod
# Or
brew services start mongodb/brew/mongodb-community
```

#### Option B: MongoDB Atlas
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address
5. Get connection string and update `MONGODB_URI` in `backend/.env`

### Step 4: Kill Any Existing Processes

```bash
# Kill processes on ports 3000 and 5000
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill specific PID (replace XXXX with actual PID)
taskkill /PID XXXX /F

# Or kill all Node processes
taskkill /f /im node.exe
```

### Step 5: Start the Application

```bash
# From the root directory
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend server on `http://localhost:3000` (or 3001 if 3000 is busy)

## 🌐 Application URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Socket.io:** ws://localhost:5000

## 🎯 Key Features Available

### User Authentication
- User registration with email/username/password
- Secure login with JWT tokens
- Password hashing with bcrypt
- Protected routes
- Auto-logout on token expiration

### Real-Time Chat
- Instant messaging with Socket.io
- Message persistence in MongoDB
- Typing indicators
- Online/offline user status
- Message read receipts
- Message timestamps

### User Interface
- Modern, responsive design
- Mobile-friendly interface
- Dark/light theme support
- Toast notifications
- Loading states
- Error handling

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Messages
- `GET /api/messages/:userId` - Get messages with specific user
- `POST /api/messages` - Send message
- `PUT /api/messages/:messageId/read` - Mark message as read
- `GET /api/messages/conversations` - Get user conversations

### Users
- `GET /api/users` - Get all users
- `GET /api/users/search?q=query` - Search users
- `PUT /api/users/profile` - Update user profile

## 🔌 Socket.io Events

### Client -> Server
- `join` - Join user to their room
- `send_message` - Send message
- `typing` - Send typing indicator
- `stop_typing` - Stop typing indicator
- `mark_read` - Mark messages as read

### Server -> Client
- `receive_message` - Receive new message
- `message_delivered` - Message delivery confirmation
- `user_online` - User came online
- `user_offline` - User went offline
- `typing` - User is typing
- `messages_read` - Messages marked as read
- `error` - Error occurred

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   taskkill /f /im node.exe
   ```

2. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - For Atlas: check IP whitelist and credentials

3. **CORS Errors**
   - Verify CORS_ORIGIN in backend .env matches frontend URL
   - Check if frontend is running on expected port

4. **JWT Errors**
   - Ensure JWT_SECRET is set in backend .env
   - Clear browser localStorage if needed

5. **Build Errors**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Development Commands

```bash
# Start both servers
npm run dev

# Start backend only
cd backend && npm run dev

# Start frontend only
cd frontend && npm run dev

# Build for production
npm run build

# Run production
npm start
```

## 📊 Project Structure Verification

```
realtime-chat-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts ✅
│   │   │   └── socket.ts ✅
│   │   ├── controllers/
│   │   │   ├── authController.ts ✅
│   │   │   ├── messageController.ts ✅
│   │   │   └── userController.ts ✅
│   │   ├── middleware/
│   │   │   ├── auth.ts ✅
│   │   │   └── validation.ts ✅
│   │   ├── models/
│   │   │   ├── User.ts ✅
│   │   │   └── Message.ts ✅
│   │   ├── routes/
│   │   │   ├── auth.ts ✅
│   │   │   ├── messages.ts ✅
│   │   │   └── users.ts ✅
│   │   ├── types/
│   │   │   └── express.d.ts ✅
│   │   └── index.ts ✅
│   ├── .env ⚠️ (CREATE THIS)
│   ├── package.json ✅
│   ├── tsconfig.json ✅
│   └── nodemon.json ✅
├── frontend/
│   ├── public/
│   │   └── index.html ✅
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx ✅
│   │   │   │   └── Register.tsx ✅
│   │   │   ├── chat/
│   │   │   │   ├── Chat.tsx ✅
│   │   │   │   ├── ChatSidebar.tsx ✅
│   │   │   │   ├── ChatWindow.tsx ✅
│   │   │   │   ├── ConversationList.tsx ✅
│   │   │   │   ├── MessageInput.tsx ✅
│   │   │   │   ├── MessageList.tsx ✅
│   │   │   │   └── UserList.tsx ✅
│   │   │   └── common/
│   │   │       └── LoadingSpinner.tsx ✅
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx ✅
│   │   │   └── ChatContext.tsx ✅
│   │   ├── services/
│   │   │   ├── api.ts ✅
│   │   │   └── socket.ts ✅
│   │   ├── types/
│   │   │   └── index.ts ✅
│   │   ├── utils/
│   │   │   └── dateUtils.ts ✅
│   │   ├── App.tsx ✅
│   │   ├── index.tsx ✅
│   │   └── index.css ✅
│   ├── .env ⚠️ (CREATE THIS)
│   ├── package.json ✅
│   ├── tailwind.config.js ✅
│   └── postcss.config.js ✅
├── package.json ✅
├── README.md ✅
└── SETUP.md ✅
```

## 🚀 Production Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend (Render/Railway/Heroku)
1. Push code to GitHub
2. Connect repository to hosting service
3. Set environment variables
4. Deploy

## 📞 Support

If you encounter any issues:

1. Check this guide thoroughly
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running
4. Check browser console for frontend errors
5. Check server logs for backend errors

The application is production-ready and portfolio-quality once properly configured! 