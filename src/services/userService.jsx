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
    return response.data;
  },

  // Update current user profile
  updateMyProfile: async (userData) => {
    const response = await userAPI.put('/users/me', userData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await userAPI.put('/users/me/password', passwordData);
    return response.data;
  },

  // Get user role
  getMyRole: async () => {
    const response = await userAPI.get('/auth/role');
    return response.data;
  },

  // =============== USER MANAGEMENT (Admin) APIs ===============
  
  // Get all users with pagination and filters
  getAllUsers: async (params = {}) => {
    try {
      const response = await userAPI.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await userAPI.get(`/users/${userId}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await userAPI.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await userAPI.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await userAPI.delete(`/users/${userId}`);
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Xóa người dùng thất bại');
      }
      
      return response.data;
    } catch (error) {
      console.error('Delete user error details:', error.response || error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Không thể kết nối đến server hoặc xóa người dùng thất bại');
    }
  },

  // Upload user avatar
  uploadAvatar: async (userId, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await userAPI.post(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update user roles and permissions
  updateUserRoles: async (userId, roles) => {
    const response = await userAPI.put(`/users/${userId}/roles`, { roles });
    return response.data;
  },

  // Get user permissions
  getUserPermissions: async (userId) => {
    const response = await userAPI.get(`/users/${userId}/permissions`);
    return response.data;
  },

  // Update user permissions
  updateUserPermissions: async (userId, permissions) => {
    const response = await userAPI.put(`/users/${userId}/permissions`, { permissions });
    return response.data;
  },

  // Export users data
  exportUsers: async (filters = {}) => {
    const response = await userAPI.get('/users/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Import users from file
  importUsers: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await userAPI.post('/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get user activity logs
  getUserActivityLogs: async (userId, params = {}) => {
    const response = await userAPI.get(`/users/${userId}/activity-logs`, { params });
    return response.data;
  },

  // Get user statistics
  getUserStats: async (userId) => {
    const response = await userAPI.get(`/users/${userId}/stats`);
    return response.data;
  },

  // =============== AUTHENTICATION VERIFY APIs ===============
  
  // Verify current authentication
  verifyAuth: async () => {
    const response = await userAPI.get('/auth/verify');
    return response.data;
  },

  // Get admin users list (from AuthController)
  getAdminUsers: async () => {
    const response = await userAPI.get('/auth/admin/users');
    return response.data;
  },

  // =============== UTILITY FUNCTIONS ===============
  
  // Format API response for consistent error handling
  handleApiResponse: (response) => {
    if (response.success || response.data) {
      return response.data || response;
    }
    throw new Error(response.message || 'API call failed');
  },

  // Format error messages
  formatError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
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
