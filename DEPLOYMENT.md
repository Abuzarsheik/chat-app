# 🚀 Deployment Guide

This guide will help you deploy your Real-Time Chat Application to production using free hosting services.

## 📋 Prerequisites

1. **GitHub Account** (for code repository)
2. **MongoDB Atlas Account** (free database)
3. **Railway Account** (backend hosting)
4. **Vercel Account** (frontend hosting)

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user with read/write permissions
4. Whitelist all IP addresses (0.0.0.0/0) for development
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/chatapp`

## 🔧 Step 2: Deploy Backend to Railway

### 2.1 Prepare Backend
1. Ensure your code is pushed to GitHub
2. Your backend should have these files:
   - `package.json` with start script
   - `railway.json` (already created)
   - `Dockerfile` (already created)

### 2.2 Deploy to Railway
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `backend` folder as root directory

### 2.3 Set Environment Variables in Railway
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp
JWT_SECRET=your-super-secure-jwt-secret-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://your-app-name.vercel.app
CORS_ORIGIN=https://your-app-name.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=your-session-secret-min-32-characters-long
```

### 2.4 Get Your Backend URL
After deployment, Railway will give you a URL like: `https://your-backend-app.railway.app`

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend
1. Your frontend should have:
   - `vercel.json` (already created)
   - Build script in `package.json`

### 3.2 Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Set root directory to `frontend`
6. Framework preset should auto-detect as "Vite"

### 3.3 Set Environment Variables in Vercel
```env
VITE_API_URL=https://your-backend-app.railway.app
VITE_SOCKET_URL=https://your-backend-app.railway.app
VITE_APP_NAME=Real-Time Chat App
VITE_APP_VERSION=1.0.0
```

### 3.4 Update CORS Settings
After getting your Vercel URL, update the Railway environment variables:
- `FRONTEND_URL=https://your-app-name.vercel.app`
- `CORS_ORIGIN=https://your-app-name.vercel.app`

## 🔄 Step 4: Update API Configuration

Update your frontend API configuration to use environment variables:

```typescript
// frontend/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
```

## ✅ Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Test user registration and login
3. Test real-time messaging
4. Check browser console for errors
5. Test on mobile devices

## 🐛 Common Issues & Solutions

### Backend Issues
- **Build fails**: Check TypeScript compilation errors
- **Database connection fails**: Verify MongoDB Atlas connection string
- **CORS errors**: Ensure FRONTEND_URL matches your Vercel domain

### Frontend Issues
- **API calls fail**: Check VITE_API_URL environment variable
- **Socket connection fails**: Verify VITE_SOCKET_URL environment variable
- **Build fails**: Check for TypeScript errors

## 📊 Monitoring & Maintenance

### Railway (Backend)
- Check logs in Railway dashboard
- Monitor resource usage
- Set up custom domain (optional)

### Vercel (Frontend)
- Check deployment logs
- Monitor performance metrics
- Set up custom domain (optional)

### MongoDB Atlas
- Monitor database usage
- Set up alerts for connection issues
- Regular backups (automatic on Atlas)

## 🔒 Security Checklist

- [ ] Strong JWT secrets (32+ characters)
- [ ] Database user has minimal required permissions
- [ ] CORS configured for specific domains
- [ ] Rate limiting enabled
- [ ] HTTPS enforced on both frontend and backend
- [ ] Environment variables secured (not in code)

## 🚀 Going Live Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed to Railway with all environment variables
- [ ] Frontend deployed to Vercel with all environment variables
- [ ] CORS settings updated with production URLs
- [ ] Demo accounts seeded in production database
- [ ] All features tested in production
- [ ] Custom domains configured (optional)
- [ ] Analytics/monitoring set up (optional)

## 📝 Post-Deployment

1. **Update README.md** with live demo links
2. **Add screenshots/GIFs** of the working application
3. **Create a demo video** showing key features
4. **Share on LinkedIn/Twitter** for portfolio visibility

Your chat application is now live and ready to impress potential employers! 🎉 