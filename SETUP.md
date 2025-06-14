# 🚀 Real-Time Chat Application - Setup Guide

## Prerequisites

Before setting up the application, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download here](https://git-scm.com/)

## Environment Variables Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_for_security
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Important:** Replace `your_super_secret_jwt_key_here_make_it_long_and_random_for_security` with a strong, random string for JWT token security.

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory with the following content:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Installation Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start MongoDB

#### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod

# Or if using systemctl (Linux)
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get the connection string and update `MONGODB_URI` in your `.env` file

### 3. Run the Application

#### Option A: Run Both Services Simultaneously
```bash
# From the root directory
npm run dev
```

#### Option B: Run Services Separately

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
```

## Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Default Users

Since this is a fresh installation, you'll need to register new users. You can:

1. Open http://localhost:3000
2. Click "Create a new account"
3. Register multiple users to test the chat functionality
4. Login with different users in different browser tabs/windows to test real-time messaging

## Testing the Application

### 1. User Registration & Authentication
- Register a new user
- Login with the registered user
- Test logout functionality

### 2. Real-Time Chat Features
- Register multiple users (use different email addresses)
- Login with different users in different browser tabs
- Start a conversation between users
- Test real-time messaging
- Check online/offline status indicators
- Test typing indicators

### 3. Chat Features
- Send messages between users
- Check message timestamps
- Test message history persistence
- Test unread message counts

## Production Deployment

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

### Backend (Render/Railway/Heroku)

1. Set environment variables in your hosting platform
2. Update `CLIENT_URL` to your frontend URL
3. Use MongoDB Atlas for the database
4. Deploy the backend

### Environment Variables for Production

**Backend:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
JWT_SECRET=very_long_random_secret_key_for_production
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.vercel.app
```

**Frontend:**
```env
REACT_APP_API_URL=https://your-backend-domain.onrender.com/api
REACT_APP_SOCKET_URL=https://your-backend-domain.onrender.com
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`
   - For Atlas, ensure IP whitelist is configured

2. **CORS Issues**
   - Verify `CLIENT_URL` in backend `.env`
   - Check if frontend and backend ports are correct

3. **Socket.io Connection Issues**
   - Ensure `REACT_APP_SOCKET_URL` points to backend
   - Check that Socket.io server is running

4. **JWT Authentication Issues**
   - Verify `JWT_SECRET` is set and consistent
   - Clear browser localStorage/cookies if needed

5. **Port Already in Use**
   ```bash
   # Kill process using port 5000 (Windows)
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Kill process using port 5000 (Mac/Linux)
   lsof -ti:5000 | xargs kill -9
   ```

### Development Tips

1. **Enable Hot Reload**
   - Backend uses nodemon for auto-restart
   - Frontend uses React's built-in hot reload

2. **Debug Mode**
   - Use browser dev tools for frontend debugging
   - Check backend console for API logs
   - Monitor Network tab for API calls

3. **Database Inspection**
   ```bash
   # Connect to MongoDB shell
   mongo chatapp
   
   # View users
   db.users.find()
   
   # View messages
   db.messages.find()
   ```

## Features Checklist

- ✅ User registration and authentication
- ✅ Real-time messaging with Socket.io
- ✅ Online/offline status indicators
- ✅ Message history persistence
- ✅ Responsive UI with Tailwind CSS
- ✅ Toast notifications
- ✅ Typing indicators
- ✅ Unread message counts
- ✅ User search functionality
- ✅ Modern chat interface

## Support

If you encounter any issues:

1. Check this troubleshooting guide
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that MongoDB is running and accessible

For additional help, please refer to the main README.md file or create an issue in the repository.

---

🚀 **You're all set! Start building amazing chat experiences!** 