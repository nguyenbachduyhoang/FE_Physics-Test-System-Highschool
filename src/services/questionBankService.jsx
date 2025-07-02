import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5298' : 'https://be-phygens-production.up.railway.app');

const questionAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
questionAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
questionAPI.interceptors.response.use(
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

export const questionBankService = {
  // =============== AI QUESTION GENERATION APIs ===============
  
  // Generate single question using AI (sử dụng API thực tế)
  generateQuestion: async (questionCriteria) => {
    try {
      const requestData = {
        chapterId: questionCriteria.chapterId,
        difficultyLevel: questionCriteria.difficultyLevel || 'medium',
        questionType: questionCriteria.questionType || 'multiple_choice',
        specificTopic: questionCriteria.specificTopic || '',
        saveToDatabase: questionCriteria.saveToDatabase || false
      };

      const response = await questionAPI.post('/ai-question/generate', requestData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'AI question generation failed');
      }
    } catch (error) {
      console.error('Question generation error:', error);
      throw error;
    }
  },

  // Generate multiple questions in batch (sử dụng API thực tế)
  generateBatchQuestions: async (batchCriteria) => {
    try {
      const response = await questionAPI.post('/ai-question/generate-batch', batchCriteria);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Batch question generation failed');
      }
    } catch (error) {
      console.error('Batch question generation error:', error);
      throw error;
    }
  },

  // Improve existing question using AI
  improveQuestion: async (questionId, improvementRequest) => {
    const response = await questionAPI.post(`/ai-question/improve/${questionId}`, improvementRequest);
    return response.data.success ? response.data.data : response.data;
  },

  // Get AI-suggested topics for question generation
  suggestTopics: async (criteria) => {
    const response = await questionAPI.post('/ai-question/suggest-topics', criteria);
    return response.data.success ? response.data.data : response.data;
  },

  // Validate question quality using AI
  validateQuestion: async (questionId) => {
    const response = await questionAPI.post(`/ai-question/validate/${questionId}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Test AI connection (sử dụng API thực tế)
  testAIConnection: async () => {
    try {
      const response = await questionAPI.post('/ai-question/test-connection');
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('AI connection test failed:', error);
      throw error;
    }
  },

  // Get AI configuration status
  getAIConfig: async () => {
    const response = await questionAPI.get('/ai-question/config');
    return response.data.success ? response.data.data : response.data;
  },

  // =============== CHAPTER & TOPIC MANAGEMENT ===============
  
  // Get all chapters for question categorization
  getChapters: async () => {
    try {
      const response = await questionAPI.get('/ai-question/chapters');
      if (response.data.success && Array.isArray(response.data.data)) {
        return response;
      } else {
        console.warn('Invalid chapters data format:', response.data);
        throw new Error('Dữ liệu chapters không hợp lệ');
      }
    } catch (error) {
      console.error('Chapters API error:', error);
      throw error; // Throw error để component có thể xử lý
    }
  },

  // Get chapters by grade
  getChaptersByGrade: async (grade) => {
    try {
      const response = await questionAPI.get('/ai-question/chapters', {
        params: { grade }
      });
      const data = response.data.success ? response.data.data : response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Chapters API not available:', error.message);
      return [];
    }
  },

  // Get unique grades from chapters
  getGrades: async () => {
    try {
      const response = await questionAPI.get('/ai-question/chapters');
      if (response.data.success && Array.isArray(response.data.data)) {
        // Lấy danh sách grade duy nhất và sắp xếp
        const grades = [...new Set(response.data.data.map(chapter => chapter.grade))];
        return grades.sort((a, b) => a - b);
      }
      return [];
    } catch (error) {
      console.error('Get grades error:', error.message);
      return [];
    }
  },

  // =============== QUESTION CRUD (Future Implementation) ===============
  
  // Get all questions with filters
  getQuestions: async (params = {}) => {
    try {
      const response = await questionAPI.get('/ai-question', { params });
      if (response.data.success) {
        return {
          data: {
            success: true,
            message: response.data.message,
            data: response.data.data.questions || [],
            currentPage: response.data.data.currentPage || 1,
            pageSize: response.data.data.pageSize || 10,
            totalCount: response.data.data.totalCount || 0
          }
        };
      } else {
        console.warn('Invalid questions data format:', response.data);
        throw new Error('Dữ liệu câu hỏi không hợp lệ');
      }
    } catch (err) {
      console.error('Questions API error:', err);
      throw err;
    }
  },

  // Get question by ID
  getQuestionById: async (id) => {
    const response = await questionAPI.get(`/ai-question/${id}`);
    return response.data;
  },

  // Create new question manually
  createQuestion: async (questionData) => {
    const response = await questionAPI.post('/ai-question/generate', {
      ...questionData,
      saveToDatabase: true
    });
    return response.data;
  },

  // Update question
  updateQuestion: async (id, questionData) => {
    const response = await questionAPI.post(`/ai-question/improve/${id}`, questionData);
    return response.data;
  },

  // Delete question
  deleteQuestion: async (id) => {
    const response = await questionAPI.post(`/ai-question/validate/${id}`, {
      action: 'delete'
    });
    return response.data;
  },

  // =============== QUESTION SEARCH & FILTER ===============
  
  // Search questions by text
  searchQuestions: async (searchText, filters = {}) => {
    // This endpoint doesn't exist yet in backend, preparing for future
    const response = await questionAPI.get('/questions/search', {
      params: { q: searchText, ...filters }
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Get questions by chapter
  getQuestionsByChapter: async (chapterId) => {
    // This endpoint doesn't exist yet in backend, preparing for future
    const response = await questionAPI.get('/questions/by-chapter', {
      params: { chapterId }
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Get questions by difficulty level
  getQuestionsByDifficulty: async (difficulty) => {
    // This endpoint doesn't exist yet in backend, preparing for future
    const response = await questionAPI.get('/questions/by-difficulty', {
      params: { difficulty }
    });
    return response.data.success ? response.data.data : response.data;
  },

  // =============== QUESTION QUALITY & FEEDBACK ===============
  
  // Submit quality feedback for a question
  submitQuestionFeedback: async (questionId, feedback) => {
    // This endpoint doesn't exist yet in backend, preparing for future
    const response = await questionAPI.post(`/questions/${questionId}/feedback`, feedback);
    return response.data.success ? response.data.data : response.data;
  },

  // Get question statistics and analytics
  getQuestionStatistics: async (questionId) => {
    // This endpoint doesn't exist yet in backend, preparing for future
    const response = await questionAPI.get(`/questions/${questionId}/statistics`);
    return response.data.success ? response.data.data : response.data;
  },

  // =============== BULK OPERATIONS ===============
  
  // Import questions from file (CSV, Excel)
  importQuestions: async (fileData) => {
    // This endpoint doesn't exist yet in backend, preparing for future
    const formData = new FormData();
    formData.append('file', fileData);
    
    const response = await questionAPI.post('/questions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Export questions to file
  exportQuestions: async (filters = {}) => {
    // This endpoint doesn't exist yet in backend, preparing for future
    const response = await questionAPI.get('/questions/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Bulk delete questions
  bulkDeleteQuestions: async (questionIds) => {
    // This endpoint doesn't exist yet in backend, preparing for future
    const response = await questionAPI.delete('/questions/bulk-delete', {
      data: { questionIds }
    });
    return response.data;
  },

  // Bulk update questions
  bulkUpdateQuestions: async (updates) => {
    // This endpoint doesn't exist yet in backend, preparing for future
    const response = await questionAPI.put('/questions/bulk-update', updates);
    return response.data.success ? response.data.data : response.data;
  },

  // =============== UTILITY FUNCTIONS ===============
  
  // Format question data for display
  formatQuestionData: (question) => {
    return {
      ...question,
      createdAt: question.createdAt ? new Date(question.createdAt).toLocaleString('vi-VN') : '',
      difficulty: formatDifficulty(question.difficultyLevel),
      chapterName: question.topic?.chapter?.chapterName || question.topic?.topicName || 'Chưa phân loại',
      topicName: question.topic?.topicName || 'Chưa có chủ đề',
      answerCount: question.answerChoices?.length || 0,
      hasExplanation: !!question.explanation?.explanationText
    };
  },

  // Format difficulty level for display
  formatDifficulty: (difficulty) => {
    const difficultyMap = {
      'easy': 'Dễ',
      'medium': 'Trung bình',
      'hard': 'Khó'
    };
    return difficultyMap[difficulty] || difficulty;
  },

  // Validate question data
  validateQuestionData: (questionData) => {
    const errors = [];
    
    if (!questionData.questionText?.trim()) {
      errors.push('Nội dung câu hỏi không được để trống');
    }
    
    if (!questionData.topicId) {
      errors.push('Phải chọn chủ đề cho câu hỏi');
    }
    
    if (!questionData.difficultyLevel) {
      errors.push('Phải chọn độ khó cho câu hỏi');
    }
    
    if (!questionData.answerChoices || questionData.answerChoices.length < 2) {
      errors.push('Câu hỏi phải có ít nhất 2 lựa chọn');
    }
    
    const correctAnswers = questionData.answerChoices?.filter(choice => choice.isCorrect);
    if (!correctAnswers || correctAnswers.length === 0) {
      errors.push('Phải có ít nhất 1 đáp án đúng');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Generate question preview text
  generatePreviewText: (questionData) => {
    const text = questionData.questionText || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
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

// Helper function for difficulty formatting (outside of object to avoid reference error)
const formatDifficulty = (difficulty) => {
  const difficultyMap = {
    'easy': 'Dễ',
    'medium': 'Trung bình', 
    'hard': 'Khó'
  };
  return difficultyMap[difficulty] || difficulty;
};

export default questionBankService;
