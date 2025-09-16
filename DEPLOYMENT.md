# Deployment Guide

This guide explains how to deploy the User Management application to production.

## Backend Deployment (Render)

### Prerequisites
- Render account
- GitHub account with repository access
- Supabase project with database

### Steps

1. **Prepare Repository**
   - Ensure all changes are committed and pushed to GitHub
   - Note your Supabase project credentials:
     - Project URL
     - Anon Key
     - Service Role Key

2. **Deploy to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select your repository
   - Configure deployment:
     - Name: `user-management-backend`
     - Region: Choose closest to your users
     - Branch: `main`
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `node server.js`
   - Add environment variables:
     - `NODE_ENV`: `production`
     - `PORT`: `10000`
     - `SUPABASE_URL`: Your Supabase URL
     - `SUPABASE_ANON_KEY`: Your Supabase Anon Key
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
     - `JWT_SECRET`: Generate a strong random string
   - Click "Create Web Service"

3. **Verify Backend**
   - Wait for deployment to complete
   - Test the API endpoint: `https://your-render-app.onrender.com/api/health`
   - Note the backend URL for frontend configuration

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- GitHub account with repository access
- Backend URL from previous step

### Steps

1. **Update Frontend Configuration**
   - In `frontend/.env` (create if not exists), add:
     ```
     VITE_API_URL=https://your-render-app.onrender.com/api
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - Ensure these are not committed to version control

2. **Deploy to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Vite
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variables:
     - `VITE_API_URL`: Your Render backend URL (e.g., `https://your-render-app.onrender.com/api`)
     - `VITE_SUPABASE_URL`: Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - Click "Deploy"

3. **Verify Frontend**
   - Wait for deployment to complete
   - Visit the provided Vercel URL
   - Test all functionality

## Post-Deployment

1. **Update CORS**
   - In your Supabase dashboard, add your Vercel domain to allowed origins
   - Update CORS settings in your backend if needed

2. **Environment Variables**
   - Keep all sensitive information in environment variables
   - Never commit `.env` files to version control

3. **Monitoring**
   - Set up monitoring in both Render and Vercel
   - Configure alerts for errors

## Troubleshooting

### Backend Issues
- Check logs in Render dashboard
- Verify environment variables
- Test API endpoints with Postman

### Frontend Issues
- Check browser console for errors
- Verify environment variables in Vercel
- Test API connectivity

### Common Problems
- CORS errors: Check allowed origins in backend and Supabase
- Connection refused: Verify backend URL and CORS settings
- Environment variables: Ensure they're properly set in both Render and Vercel
