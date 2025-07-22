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
const questionAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

questionAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
  
  generateQuestion: async (questionCriteria) => {
    try {
      const requestData = {
        chapterId: questionCriteria.chapterId,
        difficultyLevel: questionCriteria.difficultyLevel || 'medium',
        questionType: questionCriteria.questionType || 'multiple_choice',
        specificTopic: questionCriteria.topic || questionCriteria.specificTopic || '',
        saveToDatabase: questionCriteria.saveToDatabase !== false // Default true
      };
      const response = await questionAPI.post('/questions/generation/ai', requestData);
      return response.data; 
    } catch (error) {
      console.error('Question generation error:', error);
      throw error;
    }
  },

  generateBatchQuestions: async (batchCriteria) => {
    try {
      const response = await questionAPI.post('/questions/batches', batchCriteria);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.error('Batch question generation error:', error);
      throw error;
    }
  },

  improveQuestion: async (questionId, improvementRequest) => {
    const response = await questionAPI.put(`/questions/${questionId}/improvement`, improvementRequest);
    return response.data.success ? response.data.data : response.data;
  },

  suggestTopics: async (criteria) => {
    const response = await questionAPI.get('/questions/topics/suggestions', {
      params: {
        chapterId: criteria.chapterId,
        maxSuggestions: criteria.maxSuggestions || 5
      }
    });
    return response.data.success ? response.data.data : response.data;
  },

  validateQuestion: async (questionId) => {
    const response = await questionAPI.get(`/questions/${questionId}/validation`);
    return response.data;
  },

  testAIConnection: async () => {
    try {
      const response = await questionAPI.get('/questions/health/ai-connections');
      return response.data;
    } catch (error) {
      console.error('AI connection test failed:', error);
      throw error;
    }
  },

  getAIConfig: async () => {
    const response = await questionAPI.get('/questions/config');
    return response.data;
  },

  
  getChapters: async () => {
    try {
      const response = await questionAPI.get('/questions/chapters');
      return response.data.success ? response.data : response.data;
    } catch (error) {
      console.error('Chapters API error:', error);
      throw error;
    }
  },

  getChaptersByGrade: async (grade) => {
    try {
      const response = await questionAPI.get('/questions/chapters', {
        params: { grade }
      });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      console.warn('Chapters API not available:', error.message);
      return [];
    }
  },

  getGrades: async () => {
    try {
      const response = await questionAPI.get('/questions/chapters');
      return response.data;
    } catch (error) {
      console.error('Get grades error:', error.message);
      return [];
    }
  },

  
  getQuestions: async (params = {}) => {
    try {
      const response = await questionAPI.get('/questions', { params });
      return response.data;
    } catch (err) {
      console.error('Questions API error:', err);
      throw err;
    }
  },

  getQuestionById: async (id) => {
    const response = await questionAPI.get(`/questions/${id}`);
    return response.data;
  },

  createQuestion: async (questionData) => {
    const response = await questionAPI.post('/questions', {
      ...questionData,
      saveToDatabase: true
    });
    return response.data;
  },

  updateQuestion: async (id, questionData) => {
    const updateRequest = {
      questionText: questionData.questionText,
      difficultyLevel: questionData.difficultyLevel,
      explanation: questionData.explanation
    };
    const response = await questionAPI.put(`/questions/${id}`, updateRequest);
    return response.data;
  },

  deleteQuestion: async (id) => {
    const response = await questionAPI.delete(`/questions/${id}`);
    return response.data;
  },

  searchQuestions: async (searchText, filters = {}) => {
    const response = await questionAPI.get('/questions/search', {
      params: { q: searchText, ...filters }
    });
    return response.data;
  },

  getQuestionsByChapter: async (chapterId) => {
    const response = await questionAPI.get('/questions/by-chapter', {
      params: { chapterId }
    });
    return response.data;
  },

  getQuestionsByDifficulty: async (difficulty) => {
    const response = await questionAPI.get('/questions/by-difficulty', {
      params: { difficulty }
    });
    return response.data;
  },

  
  submitQuestionFeedback: async (questionId, feedback) => {
    const response = await questionAPI.post(`/questions/${questionId}/feedback`, feedback);
    return response.data;
  },

  getQuestionStatistics: async (questionId) => {
    const response = await questionAPI.get(`/questions/${questionId}/statistics`);
    return response.data;
  },

  
  importQuestions: async (fileData) => {
    const formData = new FormData();
    formData.append('file', fileData);
    
    const response = await questionAPI.post('/questions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  exportQuestions: async (filters = {}) => {
    const response = await questionAPI.get('/questions/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  bulkDeleteQuestions: async (questionIds) => {
    const response = await questionAPI.delete('/questions/bulk-delete', {
      data: { questionIds }
    });
    return response.data;
  },

  bulkUpdateQuestions: async (updates) => {
    const response = await questionAPI.put('/questions/bulk-update', updates);
    return response.data;
  },

  
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

  formatDifficulty: (difficulty) => {
    const difficultyMap = {
      'easy': 'Dễ',
      'medium': 'Trung bình',
      'hard': 'Khó'
    };
    return difficultyMap[difficulty] || difficulty;
  },

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

  generatePreviewText: (questionData) => {
    const text = questionData.questionText || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
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
    if (error.response?.data?.errors) {
      return Object.values(error.response.data.errors).flat().join(', ');
    }
    return error.message || 'Đã xảy ra lỗi không xác định';
  }
};

const formatDifficulty = (difficulty) => {
  const difficultyMap = {
    'easy': 'Dễ',
    'medium': 'Trung bình', 
    'hard': 'Khó'
  };
  return difficultyMap[difficulty] || difficulty;
};

export default questionBankService;
