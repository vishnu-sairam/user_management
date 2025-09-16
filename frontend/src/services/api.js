import axios from 'axios';

// Use environment variable for API URL with fallback to relative URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized access
        console.error('Unauthorized access - please login again');
      } else if (error.response.status === 404) {
        console.error('Resource not found');
      } else if (error.response.status >= 500) {
        console.error('Server error occurred');
      }
      
      // Return error response data if available
      return Promise.reject({
        message: error.response.data?.message || 'An error occurred',
        errors: error.response.data?.errors,
        status: error.response.status,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      return Promise.reject({
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
      return Promise.reject({
        message: 'Error setting up request',
      });
    }
  }
);

// User API functions
export const userApi = {
  // Get all users
  getAll: () => api.get('/users'),
  
  // Get single user by ID
  getById: (id) => api.get(`/users/${id}`),
  
  // Create new user
  create: (userData) => api.post('/users', userData),
  
  // Update existing user
  update: (id, userData) => api.put(`/users/${id}`, userData),
  
  // Delete user
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;
