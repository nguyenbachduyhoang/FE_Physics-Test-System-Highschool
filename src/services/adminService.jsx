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
    return response.data;
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
    return response.data;
  },

  getUserById: async (id) => {
    const response = await adminAPI.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await adminAPI.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await adminAPI.put(`/users/${id}`, userData);
    // Trả về toàn bộ response để frontend có thể kiểm tra success flag
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await adminAPI.delete(`/users/${id}`);
    // Trả về toàn bộ response để frontend có thể kiểm tra success flag
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
    return response.data;
  },

  getExamStatistics: async (examId) => {
    const response = await adminAPI.get(`/analytics/exam-statistics/${examId}`);
    return response.data;
  },

  getChapterAnalytics: async (grade = null) => {
    const params = grade ? { grade } : {};
    const response = await adminAPI.get('/analytics/chapter-analytics', { params });
    return response.data;
  },

  // =============== QUESTION MANAGEMENT APIs ===============
  // eslint-disable-next-line no-unused-vars
  getQuestions: async (params = {}) => {
    try {
      const response = await adminAPI.get('/questions/chapters');
      return response.data.success ? [] : []; // Trả về empty vì đây là chapters, không phải questions
    } catch (error) {
      console.log('Questions API not available yet, returning empty array', error);
      return [];
    }
  },

  getChapters: async () => {
    const response = await adminAPI.get('/questions/chapters');
    return response.data;
  },

  generateQuestion: async (questionData) => {
    const response = await adminAPI.post('/questions/ai-generated', questionData);
    return response.data;
  },

  // eslint-disable-next-line no-unused-vars
  createQuestion: async (questionData) => {
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
    return response.data;
  },

  updateSmartExamConfig: async (configData) => {
    const response = await adminAPI.put('/smart-exam/config', configData);
    return response.data;
  },

  // generateSmartExam: async (criteria) => {
  //   const response = await adminAPI.post('/smart-exam/generate', criteria);
  //   return response.data;
  // },

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