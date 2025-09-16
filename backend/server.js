require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'http://localhost:3000']
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log requests for debugging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request body:', req.body);
    }
    next();
  });
}

// Test Supabase connection
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await require('./config/supabase')
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Successfully connected to Supabase');
    if (data) {
      console.log(`ℹ️  Found ${data.length} users in the database`);
    }
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/db-health', async (req, res) => {
  try {
    // Test the Supabase connection
    const { data, error } = await require('./config/supabase')
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    res.status(200).json({
      status: 'success',
      message: 'Database connection is healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Routes
app.use('/api/users', require('./routes/users'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test database connection
  await testSupabaseConnection();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
