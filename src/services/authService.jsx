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
    // Debug token before sending
    console.debug('🔑 Token found in localStorage:', token);
    
    // ✅ Sửa: Luôn thêm "Bearer " prefix cho token
    config.headers.Authorization = `Bearer ${token}`;
    
    // Debug final headers
    console.debug('📨 Request headers:', {
      url: config.url,
      headers: config.headers
    });
  } else {
    console.warn('⚠️ No token found in localStorage for request:', config.url);
  }
  return config;
}, (error) => {
  console.error('❌ Request interceptor error:', error);
  return Promise.reject(error);
});

authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // window.location.href = '/';
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
      const loginData = response.data.data;
      // Validate required fields
      if (!loginData.access_token || !loginData.user) {
        throw new Error('Invalid login response format');
      }
      return loginData;
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
  setAuthData: (loginData) => {
    try {
      console.debug('🔐 Setting auth data:', loginData);

      if (!loginData || !loginData.access_token || !loginData.user) {
        console.error('❌ Invalid login data:', loginData);
        throw new Error('Invalid login data format');
      }

      const { access_token, user } = loginData;

      // Transform user data to consistent format
      const normalizedUser = {
        userId: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: true // Default to true since we got a successful login
      };

      // Validate required fields
      if (!normalizedUser.userId || !normalizedUser.username) {
        console.error('❌ Invalid user data:', user);
        throw new Error('Invalid user data format');
      }

      // Store token as is, without Bearer prefix
      console.debug('💾 Saving to localStorage:', { 
        token: access_token,
        user: normalizedUser 
      });

      // Save to localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('userId', normalizedUser.userId);
      
      // Set default headers
      authAPI.defaults.headers.common['Authorization'] = access_token;

      console.debug('✅ Auth data set successfully');
      return { token: access_token, user: normalizedUser };
    } catch (error) {
      console.error('❌ Error setting auth data:', error);
      // Clear any partial data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete authAPI.defaults.headers.common['Authorization'];
      throw error;
    }
  },
};

export default authService; 