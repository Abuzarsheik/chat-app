# 🔧 Environment Setup Guide

## Backend Environment Configuration

Create a file named `.env` in the `backend/` directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/chat-app

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# CORS Configuration
CLIENT_URL=http://localhost:3000

# Optional: For production deployment
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app
# JWT_SECRET=your-production-jwt-secret-key
```

## Frontend Environment Configuration

Create a file named `.env` in the `frontend/` directory with the following content:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000

# Optional: For production deployment
# REACT_APP_API_URL=https://your-api-domain.com
# REACT_APP_SOCKET_URL=https://your-api-domain.com
```

## Setup Instructions

1. **Create Backend Environment File:**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Create .env file (copy content from above)
   # On Windows: notepad .env
   # On macOS/Linux: nano .env
   ```

2. **Create Frontend Environment File:**
   ```bash
   # Navigate to frontend directory
   cd frontend
   
   # Create .env file (copy content from above)
   # On Windows: notepad .env
   # On macOS/Linux: nano .env
   ```

3. **Install Dependencies:**
   ```bash
   # From root directory
   npm install
   ```

4. **Start the Application:**
   ```bash
   # Start both services
   npm run dev
   
   # Or start individually:
   npm run dev:backend  # Port 5000
   npm run dev:frontend # Port 3000
   ```

## Important Notes

- **Change JWT_SECRET** in production to a secure random string
- **Update MongoDB URI** if using a remote database
- **Update API URLs** for production deployment
- **.env files are gitignored** for security - never commit them to version control

## Production Deployment

For production, make sure to:
- Use a strong JWT secret (32+ characters)
- Use a secure MongoDB connection string
- Update CORS settings for your domain
- Set NODE_ENV=production
- Use HTTPS URLs for API endpoints 