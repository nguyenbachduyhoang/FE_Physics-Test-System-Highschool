import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5298' : 'https://be-phygens-production.up.railway.app');

const adminAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
adminAPI.interceptors.response.use(
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

export const adminService = {
  // =============== DASHBOARD APIs ===============
  getDashboard: async () => {
    const response = await adminAPI.get('/analytics/dashboard');
    return response.data.success ? response.data.data : response.data;
  },

  // =============== USER MANAGEMENT APIs ===============
  getUsers: async (params = {}) => {
    const {
      page = 1,
      pageSize = 10,
      search = '',
      sortBy = 'username',
      sortDirection = 'asc'
    } = params;
    
    const response = await adminAPI.get('/users', {
      params: {
        page,
        pageSize,
        search,
        sortBy,
        sortDirection
      }
    });
    return response.data.success ? response.data.data : response.data;
  },

  getUserById: async (id) => {
    const response = await adminAPI.get(`/users/${id}`);
    return response.data.success ? response.data.data : response.data;
  },

  createUser: async (userData) => {
    const response = await adminAPI.post('/users', userData);
    return response.data.success ? response.data.data : response.data;
  },

  updateUser: async (id, userData) => {
    const response = await adminAPI.put(`/users/${id}`, userData);
    return response.data.success ? response.data.data : response.data;
  },

  deleteUser: async (id) => {
    const response = await adminAPI.delete(`/users/${id}`);
    return response.data;
  },

  // =============== EXAM MANAGEMENT APIs ===============
  getExams: async () => {
    const response = await adminAPI.get('/exams');
    return response.data;
  },

  getExamById: async (id) => {
    const response = await adminAPI.get(`/exams/${id}`);
    return response.data;
  },

  createExam: async (examData) => {
    const response = await adminAPI.post('/exams', examData);
    return response.data;
  },

  updateExam: async (id, examData) => {
    const response = await adminAPI.put(`/exams/${id}`, examData);
    return response.data;
  },

  deleteExam: async (id) => {
    const response = await adminAPI.delete(`/exams/${id}`);
    return response.data;
  },

  generateExam: async (generateData) => {
    const response = await adminAPI.post('/exams/generate', generateData);
    return response.data;
  },

  // =============== ANALYTICS APIs ===============
  getStudentProgress: async (userId) => {
    const response = await adminAPI.get(`/analytics/student-progress/${userId}`);
    return response.data.success ? response.data.data : response.data;
  },

  getExamStatistics: async (examId) => {
    const response = await adminAPI.get(`/analytics/exam-statistics/${examId}`);
    return response.data.success ? response.data.data : response.data;
  },

  getChapterAnalytics: async (grade = null) => {
    const params = grade ? { grade } : {};
    const response = await adminAPI.get('/analytics/chapter-analytics', { params });
    return response.data.success ? response.data.data : response.data;
  },

  // =============== QUESTION MANAGEMENT APIs ===============
  // eslint-disable-next-line no-unused-vars
  getQuestions: async (params = {}) => {
    // Tạm thời trả về empty array vì chưa có API list questions
    // Có thể sử dụng /ai-question/chapters để lấy chapters
    try {
      const response = await adminAPI.get('/ai-question/chapters');
      return response.data.success ? [] : []; // Trả về empty vì đây là chapters, không phải questions
    } catch (error) {
      console.log('Questions API not available yet, returning empty array', error);
      return [];
    }
  },

  getChapters: async () => {
    const response = await adminAPI.get('/ai-question/chapters');
    return response.data.success ? response.data.data : response.data;
  },

  generateQuestion: async (questionData) => {
    const response = await adminAPI.post('/ai-question/generate', questionData);
    return response.data.success ? response.data.data : response.data;
  },

  // eslint-disable-next-line no-unused-vars
  createQuestion: async (questionData) => {
    // Tạm thời throw error vì chưa có API create question
    throw new Error('API tạo câu hỏi chưa được implement');
  },

  // eslint-disable-next-line no-unused-vars
  updateQuestion: async (id, questionData) => {
    // Tạm thời throw error vì chưa có API update question
    throw new Error('API cập nhật câu hỏi chưa được implement');
  },

  // eslint-disable-next-line no-unused-vars
  deleteQuestion: async (id) => {
    // Tạm thời throw error vì chưa có API delete question
    throw new Error('API xóa câu hỏi chưa được implement');
  },

  // =============== SMART EXAM APIs ===============
  getSmartExamConfig: async () => {
    const response = await adminAPI.get('/smart-exam/config');
    return response.data.success ? response.data.data : response.data;
  },

  updateSmartExamConfig: async (configData) => {
    const response = await adminAPI.put('/smart-exam/config', configData);
    return response.data.success ? response.data.data : response.data;
  },

  generateSmartExam: async (criteria) => {
    const response = await adminAPI.post('/smart-exam/generate', criteria);
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
      return error.response.data.errors.join(', ');
    }
    return error.message || 'Có lỗi xảy ra';
  }
};

export default adminService; 