import axios from 'axios';
import { authService } from './authService';

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

const examAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

examAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

examAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
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
  
  getAllExams: async (params = {}) => {
    const response = await examAPI.get('/exams', { 
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        search: params.search || ''
      }
    });
    
    return response.data;
  },

  getExamById: async (examId) => {
    const response = await examAPI.get(`/exams/${examId}`);
    return response.data;
  },

  createExam: async (examData) => {
    const response = await examAPI.post('/exams', examData);
    return response.data;
  },

  updateExam: async (examId, examData) => {
    const response = await examAPI.put(`/exams/${examId}`, examData);
    return response.data;
  },

  deleteExam: async (examId) => {
    const response = await examAPI.delete(`/exams/${examId}`);
    return response.data;
  },

  generateExam: async (generateData) => {
    const response = await examAPI.post('/exams/generation', generateData);
    return response.data.success ? response.data : response.data;
  },

  
  // createExamMatrix: async (matrixData) => {
  //   const response = await examAPI.post('/smart-exam/create-matrix', matrixData);
  //   return response.data;
  // },

  generateSmartExam: async (criteria) => {
    const response = await examAPI.post('/exams/generate-smart', criteria);
    return response.data.success ? response.data : response.data;
  },

  // getExamMatrices: async () => {
  //   const response = await examAPI.get('/smart-exam/matrices');
  //   return response.data;
  // },

  // getSmartExamTemplates: async () => {
  //   const response = await examAPI.get('/smart-exam/templates');
  //   return response.data;
  // },
  getExamStatistics: async (examId) => {
    const response = await examAPI.get(`/analytics/exam-statistics/${examId}`);
    return response.data;
  },

  getChapterAnalytics: async (grade = null) => {
    const params = grade ? { grade } : {};
    const response = await examAPI.get('/analytics/chapter-analytics', { params });
    return response.data;
  },

  
  submitExamAnswers: async (examId, answers) => {
    // This endpoint doesn't exist yet in backend, but preparing for future
    const response = await examAPI.post(`/exams/${examId}/submit`, { answers });
    return response.data;
  },

  // Get student's exam result (for future implementation)
  getExamResult: async (examId, studentId = null) => {
    // This endpoint doesn't exist yet in backend, but preparing for future
    const endpoint = studentId ? `/exams/${examId}/results/${studentId}` : `/exams/${examId}/my-result`;
    const response = await examAPI.get(endpoint);
    return response.data;
  },

  // Get student's exam history
  getMyExamHistory: async () => {
    try {
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      if (!currentUser || !token) {
        throw new Error('Unauthorized - Please login again');
      }

      const response = await examAPI.get(`/exams/histories/${currentUser.userId}`);
      return response.data;
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

  
  autoGradeExam: async (examId, answers) => {
    const response = await examAPI.post(`/exams/${examId}/auto-grade`, { answers });
    return response.data;
  },

  manualGradeExam: async (examId, gradingData) => {
    const response = await examAPI.post(`/exams/${examId}/manual-grade`, gradingData);
    return response.data;
  },

  formatExamData: (exam) => {
    return {
      ...exam,
      createdAt: exam.createdAt ? new Date(exam.createdAt).toLocaleString('vi-VN') : '',
      duration: exam.duration ? `${exam.duration} phút` : 'Không giới hạn',
      questionCount: exam.examQuestions?.length || 0,
      status: exam.isActive ? 'Đang hoạt động' : 'Không hoạt động'
    };
  },

  formatExamList: (exams) => {
    return exams.map(exam => examService.formatExamData(exam));
  },

  calculateDuration: (startTime, endTime) => {
    if (!startTime || !endTime) return null;
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end - start) / (1000 * 60)); 
  },

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

  cloneExam: async (examId, newName) => {
    const response = await examAPI.post(`/exams/${examId}/clone`, { newName });
    return response.data;
  },

  exportExam: async (examId, format = 'pdf') => {
    const response = await examAPI.get(`/exams/${examId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  importExam: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await examAPI.post('/exams/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getExamStats: async (examId) => {
    const response = await examAPI.get(`/exams/${examId}/stats`);
    return response.data;
  },

  getExamAttempts: async (examId, params = {}) => {
    const response = await examAPI.get(`/exams/${examId}/attempts`, { params });
    return response.data;
  },

  getExamResults: async (examId, params = {}) => {
    const response = await examAPI.get(`/exams/${examId}/results`, { params });
    return response.data;
  },

  publishExam: async (examId) => {
    const response = await examAPI.post(`/exams/${examId}/publish`);
    return response.data;
  },

  unpublishExam: async (examId) => {
    const response = await examAPI.post(`/exams/${examId}/unpublish`);
    return response.data;
  },

  getExamTemplates: async () => {
    const response = await examAPI.get('/exams/templates');
    return response.data;
  },

  createFromTemplate: async (templateId, examData) => {
    const response = await examAPI.post(`/exams/templates/${templateId}`, examData);
    return response.data;
  },

  getExamHistory: async (userId) => {
    try {
      const response = await examAPI.get(`/exams/histories/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam history:', error);
      throw error;
    }
  },
};

export default examService;
