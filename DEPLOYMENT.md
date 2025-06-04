# 🚀 Deployment Guide

This guide covers deploying your OutFlo Campaign Management System to various free hosting platforms.

## 📋 Pre-Deployment Checklist

1. ✅ `.gitignore` files created to protect `.env` files
2. ✅ `.env.example` files created as templates
3. ✅ Environment variables documented

## 🔧 Environment Variables Setup

### Backend Environment Variables
Copy `backend/.env.example` to `backend/.env` and fill in your values:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT tokens
- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Your frontend URL (for CORS)

### Frontend Environment Variables
Copy `frontend/.env.example` to `frontend/.env` and set:
- `REACT_APP_API_URL`: Your backend API URL

## 🌐 Deployment Options

### Option 1: Railway (Recommended - Full Stack)

**Pros**: 
- Easy full-stack deployment
- $5 monthly credit (free tier)
- Automatic builds from GitHub
- Built-in database options

**Steps**:
1. Push code to GitHub
2. Connect Railway to your GitHub repo
3. Add environment variables in Railway dashboard
4. Deploy both frontend and backend services

### Option 2: Render (Great Alternative)

**Pros**:
- 750 hours/month free
- Easy GitHub integration
- Supports both static sites and web services

**Steps**:
1. Create Render account
2. Connect GitHub repository
3. Create two services:
   - Web Service (for backend)
   - Static Site (for frontend)
4. Set environment variables in Render dashboard

### Option 3: Vercel + Railway/Render

**Frontend on Vercel**:
- Unlimited free deployments
- Excellent React support
- Automatic deployments

**Backend on Railway/Render**:
- Use for Express API
- Database hosting

### Option 4: Netlify + Railway

**Frontend on Netlify**:
- Free static site hosting
- Easy drag-and-drop deployment

**Backend on Railway**:
- API and database hosting

## 🚀 Quick Deploy Commands

### Build for Production
```bash
# Install all dependencies
npm run install:all

# Build both frontend and backend
npm run build

# Test production build locally
npm run start:backend  # In one terminal
npm run start:frontend # In another terminal
```

### Deploy to Railway
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`

## 🔐 Security Best Practices

1. **Never commit `.env` files**
2. **Use environment variables for all secrets**
3. **Use strong JWT secrets**
4. **Enable CORS properly**
5. **Use HTTPS in production**

## 📊 Free Tier Limitations

| Platform | Frontend | Backend | Database | Monthly Limits |
|----------|----------|---------|----------|----------------|
| Railway | ✅ | ✅ | ✅ | $5 credit |
| Render | ✅ | ✅ | ✅ | 750 hours |
| Vercel | ✅ | ❌ | ❌ | 100GB bandwidth |
| Netlify | ✅ | Limited | ❌ | 100GB bandwidth |

## 🛠️ Troubleshooting

### Common Issues:
1. **Build failures**: Check node version compatibility
2. **CORS errors**: Update `FRONTEND_URL` in backend env
3. **Database connection**: Verify MongoDB URI
4. **API not found**: Check `REACT_APP_API_URL` in frontend

### Environment Variable Issues:
- Ensure all required variables are set
- Check variable naming (REACT_APP_ prefix for frontend)
- Verify no trailing spaces in values

## 📞 Support

If you encounter issues:
1. Check platform-specific documentation
2. Verify environment variables
3. Check build logs for errors
4. Test locally first

## 🎯 Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure SSL certificates
3. Set up monitoring
4. Configure CI/CD pipelines
5. Set up error tracking (Sentry, etc.) 