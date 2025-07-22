import axios from 'axios';

let API_BASE_URL = 'https://be-phygens.onrender.com';

async function checkBackend() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify`);
    if (!res.ok) throw new Error('BE deploy lỗi');
  } catch (e) {
    console.log(e);
    API_BASE_URL = 'http://localhost:5298';
  }
}

// Gọi check khi khởi động app
checkBackend();

const userAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

userAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  
  getMyProfile: async () => {
    const response = await userAPI.get('/users/me');
    return response.data;
  },

  updateMyProfile: async (userData) => {
    const response = await userAPI.put('/users/me', userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await userAPI.put('/users/me/password', passwordData);
    return response.data;
  },

  getMyRole: async () => {
    const response = await userAPI.get('/auth/role');
    return response.data;
  },

  
  getAllUsers: async (params = {}) => {
    try {
      const response = await userAPI.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    const response = await userAPI.get(`/users/${userId}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await userAPI.post('/users', userData);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await userAPI.put(`/users/${userId}`, userData);
    return response.data;
  },

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

  updateUserRoles: async (userId, roles) => {
    const response = await userAPI.put(`/users/${userId}/roles`, { roles });
    return response.data;
  },

  getUserPermissions: async (userId) => {
    const response = await userAPI.get(`/users/${userId}/permissions`);
    return response.data;
  },

  updateUserPermissions: async (userId, permissions) => {
    const response = await userAPI.put(`/users/${userId}/permissions`, { permissions });
    return response.data;
  },

  exportUsers: async (filters = {}) => {
    const response = await userAPI.get('/users/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

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

  getUserActivityLogs: async (userId, params = {}) => {
    const response = await userAPI.get(`/users/${userId}/activity-logs`, { params });
    return response.data;
  },

  getUserStats: async (userId) => {
    const response = await userAPI.get(`/users/${userId}/stats`);
    return response.data;
  },

  
  verifyAuth: async () => {
    const response = await userAPI.get('/auth/verify');
    return response.data;
  },

  getAdminUsers: async () => {
    const response = await userAPI.get('/auth/admin/users');
    return response.data;
  },

  
  handleApiResponse: (response) => {
    if (response.success || response.data) {
      return response.data || response;
    }
    throw new Error(response.message || 'API call failed');
  },

  formatError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    return error.message || 'Đã xảy ra lỗi không xác định';
  },

  hasAdminPermission: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin' || user.role === 'teacher';
  },

  isTeacher: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'teacher';
  },

  isAdmin: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin';
  },

  isStudent: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'student';
  }
};

export default userService;
