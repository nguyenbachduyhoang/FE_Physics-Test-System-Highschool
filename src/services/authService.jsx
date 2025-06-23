import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5298' : 'https://be-phygens-production.up.railway.app');

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login with username/password
  login: async (username, password) => {
    const response = await authAPI.post('/auth/login', {
      username,
      password,
    });
    
    // Handle wrapped API response format
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  },

  // Register new user
  register: async (userData) => {
    const response = await authAPI.post('/auth/register', userData);
    
    // Handle wrapped API response format
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }
  },

  // Google login with Firebase - send user info to backend
  googleLogin: async (googleData) => {
    const response = await authAPI.post('/LoginGoogle/firebase-login', {
      idToken: googleData.idToken,
      email: googleData.email,
      fullName: googleData.fullName
    });
    
    // Handle both wrapped and direct response formats
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else if (response.data.token) {
      return {
        access_token: response.data.token,
        user: response.data.user
      };
    } else if (response.data.isNewUser !== undefined) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Google login failed');
    }
  },

  // Complete Google registration for new users
  completeGoogleRegistration: async (userData) => {
    const response = await authAPI.post('/LoginGoogle/complete-registration', userData);
    
    if (response.data.token) {
      return {
        access_token: response.data.token,
        user: response.data.user
      };
    } else {
      throw new Error('Registration failed');
    }
  },

  // Logout
  logout: async () => {
    try {
      // Best practice: Always inform the backend about the logout.
      await authAPI.post('/auth/logout');
    } catch (error) {
      // Log the error but proceed with local logout to ensure the user is logged out.
      console.error("Logout API call failed, but logging out locally.", error);
    } finally {
      // Always clear local storage and headers to complete the logout on the client.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete authAPI.defaults.headers.common['Authorization'];
    }
  },

  // Get current user info
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : null;
    
    // Debug log for role checking
    if (parsedUser) {
      console.log('Current user:', parsedUser);
      console.log('User role:', parsedUser.role);
    }
    
    return parsedUser;
  },



  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await authAPI.put('/auth/password', passwordData);
    return response.data;
  },

  // Verify authentication
  verifyAuth: async () => {
    const response = await authAPI.get('/auth/verify');
    return response.data.success ? response.data.data : response.data;
  },

  // Get user role
  getUserRole: async () => {
    const response = await authAPI.get('/auth/role');
    return response.data.success ? response.data.data : response.data;
  },

  // Debug APIs (for development)
  createAdminUser: async (adminData) => {
    const response = await authAPI.post('/auth/debug/create-admin', adminData);
    return response.data;
  },

  hashPassword: async (password) => {
    const response = await authAPI.post('/auth/debug/hash', { password });
    return response.data;
  },

  getDebugUser: async (username) => {
    const response = await authAPI.get(`/auth/debug/user/${username}`);
    return response.data;
  },

  // Set auth data
  setAuthData: (loginResponse) => {
    const token = loginResponse.access_token || loginResponse.token;
    if (!token) {
      throw new Error('No token received from login response');
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loginResponse.user));
    authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
};

export default authService; 