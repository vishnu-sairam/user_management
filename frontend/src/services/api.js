import axios from 'axios';

// Use environment variable for API URL with fallback to local development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`, config.data ? { data: config.data } : '');
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} ${response.config.url}`, response.data);
    // If the response has a data property, return it directly
    if (response.data !== undefined) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      const { status, data, config } = error.response;
      const errorMessage = data?.message || error.message || 'An error occurred';
      
      console.error(`[API] Error ${status} ${config?.url || ''}:`, {
        message: errorMessage,
        status,
        data,
        config: {
          method: config?.method,
          url: config?.url,
          data: config?.data
        }
      });
      
      // Return a consistent error object
      return Promise.reject({
        success: false,
        message: errorMessage,
        status,
        data,
        isAxiosError: true
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[API] No response received:', error.request);
      return Promise.reject({
        success: false,
        message: 'No response received from server',
        isNetworkError: true
      });
    }
    
    // Something happened in setting up the request
    console.error('[API] Request setup error:', error.message);
    return Promise.reject({
      success: false,
      message: error.message || 'Error setting up request',
      isRequestError: true
    });
  }
);

// API methods
const apiService = {
  // Get all users
  getAll: async () => {
    const response = await api.get('/users');
    return response.data || [];
  },

  // Get single user by ID
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update existing user
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response;
  },

  // Health check
  health: async () => {
    return api.get('/db-health');
  }
};

export default apiService;
