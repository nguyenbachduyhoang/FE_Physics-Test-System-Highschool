import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5298' : 'https://be-phygens-production.up.railway.app');

const userAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
userAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
userAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const userService = {
  // =============== USER PROFILE APIs ===============
  
  // Get current user profile
  getMyProfile: async () => {
    const response = await userAPI.get('/users/me');
    return response.data.success ? response.data.data : response.data;
  },

  // Update current user profile
  updateMyProfile: async (userData) => {
    const response = await userAPI.put('/users/me', userData);
    return response.data.success ? response.data.data : response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await userAPI.put('/users/me/password', passwordData);
    return response.data;
  },

  // Get user role
  getMyRole: async () => {
    const response = await userAPI.get('/auth/role');
    return response.data.success ? response.data.data : response.data;
  },

  // =============== USER MANAGEMENT (Admin) APIs ===============
  
  // Get all users (with pagination and filters)
  getAllUsers: async (params = {}) => {
    const {
      page = 1,
      pageSize = 10,
      search = '',
      sortBy = 'username',
      sortDirection = 'asc'
    } = params;
    
    try {
      const response = await userAPI.get('/auth/admin/users', {
        params: {
          page,
          pageSize,
          search,
          sortBy,
          sortDirection
        }
      });
      
      const data = response.data.success ? response.data.data : response.data;
      
      // Ensure response is always in expected format
      if (Array.isArray(data)) {
        return {
          items: data,
          currentPage: page,
          pageSize: pageSize,
          totalCount: data.length
        };
      }
      
      // If data has pagination structure
      if (data && data.items) {
        return {
          items: Array.isArray(data.items) ? data.items : [],
          currentPage: data.currentPage || page,
          pageSize: data.pageSize || pageSize,
          totalCount: data.totalCount || 0
        };
      }
      
      // Fallback
      return {
        items: [],
        currentPage: 1,
        pageSize: 10,
        totalCount: 0
      };
    } catch (error) {
      console.warn('Users API not available:', error.message);
      return {
        items: [],
        currentPage: 1,
        pageSize: 10,
        totalCount: 0
      };
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await userAPI.get(`/users/${id}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await userAPI.post('/users', userData);
    return response.data.success ? response.data.data : response.data;
  },

  // Update user (Admin)
  updateUser: async (id, userData) => {
    const response = await userAPI.put(`/users/${id}`, userData);
    return response.data.success ? response.data.data : response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await userAPI.delete(`/users/${id}`);
    return response.data;
  },

  // =============== AUTHENTICATION VERIFY APIs ===============
  
  // Verify current authentication
  verifyAuth: async () => {
    const response = await userAPI.get('/auth/verify');
    return response.data.success ? response.data.data : response.data;
  },

  // Get admin users list (from AuthController)
  getAdminUsers: async () => {
    const response = await userAPI.get('/auth/admin/users');
    return response.data.success ? response.data.data : response.data;
  },

  // =============== UTILITY FUNCTIONS ===============
  
  // Format API response for consistent error handling
  handleApiResponse: (response) => {
    if (response.success || response.data) {
      return response.data || response;
    }
    throw new Error(response.message || 'API call failed');
  },

  // Format error for user display
  formatError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors) {
      return Object.values(error.response.data.errors).flat().join(', ');
    }
    return error.message || 'Đã xảy ra lỗi không xác định';
  },

  // Check if user has permission for admin functions
  hasAdminPermission: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin' || user.role === 'teacher';
  },

  // Check if user is teacher
  isTeacher: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'teacher';
  },

  // Check if user is admin
  isAdmin: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin';
  },

  // Check if user is student
  isStudent: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'student';
  }
};

export default userService;
