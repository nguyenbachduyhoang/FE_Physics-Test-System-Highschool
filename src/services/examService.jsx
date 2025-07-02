import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5298' : 'https://be-phygens-production.up.railway.app');

const examAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
examAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
examAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Thử lấy user từ authService thay vì trực tiếp từ localStorage
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const examService = {
  // =============== EXAM CRUD APIs ===============
  
  // Get all exams with filters
  getAllExams: async (params = {}) => {
    const response = await examAPI.get('/exams', { 
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 10
      }
    });
    
    // Kiểm tra và format response
    if (response.data.success) {
      return {
        data: response.data.data,
        total: response.data.total || response.data.data.length
      };
    }
    
    // Nếu response là array trực tiếp
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.data.length
      };
    }
    
    // Fallback
    return {
      data: [],
      total: 0
    };
  },

  // Get exam by ID
  getExamById: async (examId) => {
    const response = await examAPI.get(`/exams/${examId}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Create new exam
  createExam: async (examData) => {
    const response = await examAPI.post('/exams', examData);
    return response.data.success ? response.data.data : response.data;
  },

  // Update exam
  updateExam: async (examId, examData) => {
    const response = await examAPI.put(`/exams/${examId}`, examData);
    return response.data.success ? response.data.data : response.data;
  },

  // Delete exam
  deleteExam: async (examId) => {
    const response = await examAPI.delete(`/exams/${examId}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Generate exam from criteria
  generateExam: async (generateData) => {
    const response = await examAPI.post('/Exams/generate', generateData);
    return response.data.success ? response.data.data : response.data;
  },

  // =============== SMART EXAM APIs ===============
  
  // Create exam matrix for smart exam generation
  createExamMatrix: async (matrixData) => {
    const response = await examAPI.post('/smart-exam/create-matrix', matrixData);
    return response.data.success ? response.data.data : response.data;
  },

  // Generate smart exam from criteria (creates matrix and exam in one call)
  generateSmartExam: async (criteria) => {
    const response = await examAPI.post('/exams/generate-smart', criteria);
    return response.data.success ? response.data.data : response.data;
  },

  // Get all exam matrices
  getExamMatrices: async () => {
    const response = await examAPI.get('/smart-exam/matrices');
    return response.data.success ? response.data.data : response.data;
  },

  // Get smart exam templates
  getSmartExamTemplates: async () => {
    const response = await examAPI.get('/smart-exam/templates');
    return response.data.success ? response.data.data : response.data;
  },

  // =============== ANALYTICS & STATISTICS APIs ===============
  
  // Get exam statistics
  getExamStatistics: async (examId) => {
    const response = await examAPI.get(`/analytics/exam-statistics/${examId}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Get chapter analytics
  getChapterAnalytics: async (grade = null) => {
    const params = grade ? { grade } : {};
    const response = await examAPI.get('/analytics/chapter-analytics', { params });
    return response.data.success ? response.data.data : response.data;
  },

  // =============== STUDENT EXAM TAKING APIs ===============
  
  // Submit exam answers (for future implementation)
  submitExamAnswers: async (examId, answers) => {
    // This endpoint doesn't exist yet in backend, but preparing for future
    const response = await examAPI.post(`/exams/${examId}/submit`, { answers });
    return response.data.success ? response.data.data : response.data;
  },

  // Get student's exam result (for future implementation)
  getExamResult: async (examId, studentId = null) => {
    // This endpoint doesn't exist yet in backend, but preparing for future
    const endpoint = studentId ? `/exams/${examId}/results/${studentId}` : `/exams/${examId}/my-result`;
    const response = await examAPI.get(endpoint);
    return response.data.success ? response.data.data : response.data;
  },

  // Get student's exam history
  getMyExamHistory: async () => {
    try {
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      if (!currentUser || !token) {
        throw new Error('Unauthorized - Please login again');
      }

      const response = await examAPI.get(`/Exams/history/${currentUser.userId}`);
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Nếu có wrapper, extract data
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Nếu có data nhưng không có success wrapper
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      console.warn('Unexpected response format:', response.data);
      return [];
    } catch (error) {
      if (error.message === 'Unauthorized - Please login again' || error.response?.status === 401) {
        // Thử verify token với backend trước khi logout
        try {
          await authService.verifyAuth();
        } catch (verifyError) {
          console.log('verifyError', verifyError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return [];
      }
      
      console.error('Error fetching exam history:', error);
      throw error;
    }
  },

  // =============== EXAM VALIDATION & GRADING ===============
  
  // Auto-grade exam (for future implementation)
  autoGradeExam: async (examId, answers) => {
    // This endpoint doesn't exist yet in backend, but preparing for future
    const response = await examAPI.post(`/exams/${examId}/auto-grade`, { answers });
    return response.data.success ? response.data.data : response.data;
  },

  // Manual grade exam (for future implementation)
  manualGradeExam: async (examId, gradingData) => {
    // This endpoint doesn't exist yet in backend, but preparing for future
    const response = await examAPI.post(`/exams/${examId}/manual-grade`, gradingData);
    return response.data.success ? response.data.data : response.data;
  },

  // =============== UTILITY FUNCTIONS ===============
  
  // Format exam data for display
  formatExamData: (exam) => {
    return {
      ...exam,
      createdAt: exam.createdAt ? new Date(exam.createdAt).toLocaleString('vi-VN') : '',
      duration: exam.duration ? `${exam.duration} phút` : 'Không giới hạn',
      questionCount: exam.examQuestions?.length || 0,
      status: exam.isActive ? 'Đang hoạt động' : 'Không hoạt động'
    };
  },

  // Format exam list for table display
  formatExamList: (exams) => {
    return exams.map(exam => examService.formatExamData(exam));
  },

  // Calculate exam duration in minutes
  calculateDuration: (startTime, endTime) => {
    if (!startTime || !endTime) return null;
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end - start) / (1000 * 60)); // Convert to minutes
  },

  // Validate exam data before submission
  validateExamData: (examData) => {
    const errors = [];
    
    if (!examData.title?.trim()) {
      errors.push('Tiêu đề đề thi không được để trống');
    }
    
    if (!examData.grade || examData.grade < 10 || examData.grade > 12) {
      errors.push('Lớp phải từ 10 đến 12');
    }
    
    if (examData.duration && (examData.duration < 15 || examData.duration > 300)) {
      errors.push('Thời gian thi phải từ 15 đến 300 phút');
    }
    
    if (!examData.examQuestions || examData.examQuestions.length === 0) {
      errors.push('Đề thi phải có ít nhất 1 câu hỏi');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

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
    return error.message || 'Đã xảy ra lỗi không xác định';
  },

  // Clone exam
  cloneExam: async (examId, newName) => {
    const response = await examAPI.post(`/exams/${examId}/clone`, { newName });
    return response.data.success ? response.data.data : response.data;
  },

  // Export exam
  exportExam: async (examId, format = 'pdf') => {
    const response = await examAPI.get(`/exams/${examId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Import exam
  importExam: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await examAPI.post('/exams/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Get exam statistics
  getExamStats: async (examId) => {
    const response = await examAPI.get(`/exams/${examId}/stats`);
    return response.data.success ? response.data.data : response.data;
  },

  // Get exam attempts
  getExamAttempts: async (examId, params = {}) => {
    const response = await examAPI.get(`/exams/${examId}/attempts`, { params });
    return response.data.success ? response.data.data : response.data;
  },

  // Get exam results
  getExamResults: async (examId, params = {}) => {
    const response = await examAPI.get(`/exams/${examId}/results`, { params });
    return response.data.success ? response.data.data : response.data;
  },

  // Publish exam
  publishExam: async (examId) => {
    const response = await examAPI.post(`/exams/${examId}/publish`);
    return response.data.success ? response.data.data : response.data;
  },

  // Unpublish exam
  unpublishExam: async (examId) => {
    const response = await examAPI.post(`/exams/${examId}/unpublish`);
    return response.data.success ? response.data.data : response.data;
  },

  // Get exam templates
  getExamTemplates: async () => {
    const response = await examAPI.get('/exams/templates');
    return response.data.success ? response.data.data : response.data;
  },

  // Create exam from template
  createFromTemplate: async (templateId, examData) => {
    const response = await examAPI.post(`/exams/templates/${templateId}`, examData);
    return response.data.success ? response.data.data : response.data;
  },

  // Get exam history for a specific user
  getExamHistory: async (userId) => {
    try {
      const response = await examAPI.get(`/exams/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam history:', error);
      throw error;
    }
  },
};

export default examService;
