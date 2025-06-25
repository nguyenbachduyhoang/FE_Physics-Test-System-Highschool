import axios from 'axios';

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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const examService = {
  // =============== EXAM CRUD APIs ===============
  
  // Get all exams
  getAllExams: async () => {
    try {
      const response = await examAPI.get('/Exams');
      const data = response.data.success ? response.data.data : response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Exams API not available:', error.message);
      return [];
    }
  },

  // Get exam by ID
  getExamById: async (id) => {
    const response = await examAPI.get(`/Exams/${id}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Create new exam
  createExam: async (examData) => {
    const response = await examAPI.post('/Exams', examData);
    return response.data.success ? response.data.data : response.data;
  },

  // Update exam
  updateExam: async (id, examData) => {
    const response = await examAPI.put(`/Exams/${id}`, examData);
    return response.data.success ? response.data.data : response.data;
  },

  // Delete exam
  deleteExam: async (id) => {
    const response = await examAPI.delete(`/Exams/${id}`);
    return response.data;
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
  generateSmartExam: async (smartExamCriteria) => {
    // Import questionBankService để get chapters
    const { questionBankService } = await import('./questionBankService');
    
    // Get available chapters
    const chaptersArray = await questionBankService.getChapters();
    
    if (!Array.isArray(chaptersArray) || chaptersArray.length === 0) {
      throw new Error('Không có chapters trong database. Vui lòng seed sample data trước.');
    }
    
    // Use specific chapter ID if provided, otherwise use first available chapter
    const chapterId = smartExamCriteria.chapterId || chaptersArray[0]?.chapterId || chaptersArray[0]?.ChapterId;
    
    if (!chapterId) {
      throw new Error('Không tìm thấy Chapter ID hợp lệ.');
    }
    
    // ❌ VALIDATE: NO default values allowed - all must come from user input
    if (!smartExamCriteria.name?.trim()) {
      throw new Error('❌ TÊN ĐỀ THI không được để trống!');
    }
    
    if (!smartExamCriteria.questionCount || smartExamCriteria.questionCount <= 0) {
      throw new Error('❌ SỐ LƯỢNG CÂU HỎI phải lớn hơn 0! Không được sử dụng giá trị mặc định.');
    }
    
    if (!smartExamCriteria.difficultyLevel || !['easy', 'medium', 'hard'].includes(smartExamCriteria.difficultyLevel.toLowerCase())) {
      throw new Error('❌ ĐỘ KHÓ phải là easy, medium hoặc hard! Không được để trống hoặc sử dụng giá trị mặc định.');
    }

    // Step 1: Create exam matrix first using real backend endpoint
    const matrixData = {
      examName: smartExamCriteria.name.trim(),
      examType: 'smart_exam',
      description: smartExamCriteria.description?.trim() || 'Đề thi thông minh được tạo bằng AI',
      chapterDetails: [{
        chapterId: chapterId, // Use dynamic chapter ID from database
        questionCount: smartExamCriteria.questionCount, // ❌ REMOVED: No fallback to 10
        difficultyLevel: smartExamCriteria.difficultyLevel.toLowerCase() // ❌ REMOVED: No fallback to 'medium'
      }]
    };

    console.log('🔄 Creating exam matrix with data:', matrixData);
    const matrixResponse = await examAPI.post('/smart-exam/create-matrix', matrixData);
    const matrix = matrixResponse.data.success ? matrixResponse.data.data : matrixResponse.data;

    console.log('✅ Created exam matrix:', matrix);

    // Step 2: Generate exam from matrix using REAL backend endpoint
    console.log('🔄 Generating exam from matrix ID:', matrix.matrixId);
    const examResponse = await examAPI.post(`/smart-exam/generate-exam/${matrix.matrixId}`);
    const generatedExam = examResponse.data.success ? examResponse.data.data : examResponse.data;
    
    console.log('✅ Generated exam:', generatedExam);
    return generatedExam;
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

  // Get student's exam history (for future implementation)
  getMyExamHistory: async () => {
    // This endpoint doesn't exist yet in backend, but preparing for future
    const response = await examAPI.get('/exams/my-history');
    return response.data.success ? response.data.data : response.data;
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
    if (error.response?.data?.errors) {
      return Object.values(error.response.data.errors).flat().join(', ');
    }
    return error.message || 'Đã xảy ra lỗi không xác định';
  }
};

export default examService;
