# Deployment Guide

This guide explains how to deploy the User Management Dashboard with Supabase backend.

## Prerequisites

1. Supabase account and project
2. Render account (for backend)
3. Vercel account (for frontend)
4. Git repository for your code

## Backend Deployment (Render)

### 1. Prepare your Supabase Database

1. Create a new project in Supabase
2. Go to Project Settings > Database
3. Note your database connection string (you'll need this later)
4. Create a `users` table with the following SQL:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Deploy to Render

1. Push your code to a Git repository
2. Go to Render Dashboard and click "New" > "Web Service"
3. Connect your Git repository
4. Configure the service:
   - **Name**: user-management-backend
   - **Region**: Choose the one closest to you
   - **Branch**: main (or your preferred branch)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add Environment Variables:
   - `NODE_ENV`: production
   - `PORT`: 10000 (or your preferred port)
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., https://your-app.vercel.app)

6. Click "Create Web Service"

## Frontend Deployment (Vercel)

1. Push your frontend code to a Git repository
2. Go to Vercel Dashboard and click "Add New" > "Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: build
   - **Install Command**: `npm install`

5. Add Environment Variable:
   - `REACT_APP_API_URL`: Your Render backend URL (e.g., https://your-render-app.onrender.com/api)

6. Click "Deploy"

## Environment Variables

### Backend (`.env`)

```env
NODE_ENV=production
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend (`.env`)

```env
REACT_APP_API_URL=https://your-render-app.onrender.com/api
```

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. Create `.env` files in both `backend` and `frontend` directories with the variables above

4. Start the development servers:
   ```bash
   # Backend (in backend directory)
   npm run dev
   
   # Frontend (in frontend directory)
   npm start
   ```

## Troubleshooting

- **CORS Issues**: Ensure `FRONTEND_URL` is correctly set in the backend
- **Database Connection**: Verify your Supabase credentials and database connection string
- **Environment Variables**: Double-check all environment variables in your deployment platforms
- **Logs**: Check the logs in Render and Vercel dashboards for errors

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive information
- Regularly rotate your Supabase API keys
- Implement proper authentication and authorization in production
