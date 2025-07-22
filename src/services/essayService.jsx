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
const essayAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
essayAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

essayAPI.interceptors.response.use(
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

export const essayService = {
  // Tạo câu hỏi tự luận
  async generateEssayQuestion(requestData) {
    try {
      const response = await essayAPI.post('/essay/generations', requestData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo câu hỏi tự luận:', error);
      throw this.formatError(error);
    }
  },

  // Chấm điểm bài tự luận
  async gradeEssay(submissionData) {
    try {
      const response = await essayAPI.post('/essay/grades', submissionData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi chấm điểm bài tự luận:', error);
      throw this.formatError(error);
    }
  },

  // Chấm điểm hàng loạt
  async batchGradeEssays(batchRequest) {
    try {
      const response = await essayAPI.post('/essay/grades-batch', batchRequest);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi chấm điểm hàng loạt:', error);
      throw this.formatError(error);
    }
  },

  // Phân tích bài viết
  async analyzeEssay(text) {
    try {
      const response = await essayAPI.post('/essay/analyses', { text });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi phân tích bài viết:', error);
      throw this.formatError(error);
    }
  },

  // Tạo phản hồi chi tiết
  async generateFeedback(feedbackRequest) {
    try {
      const response = await essayAPI.post('/essay/feedbacks', feedbackRequest);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo phản hồi:', error);
      throw this.formatError(error);
    }
  },

  // Kiểm tra tính hợp lệ
  async validateEssayAnswer(validationRequest) {
    try {
      const response = await essayAPI.post('/essay/validations', validationRequest);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi validate câu trả lời:', error);
      throw this.formatError(error);  
    }
  },

  // Lấy danh sách câu hỏi tự luận
  async getEssayQuestions(params = {}) {
    try {
      const { page = 1, pageSize = 10, search = '', difficultyLevel = '', chapterId = null } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(difficultyLevel && { difficultyLevel }),
        ...(chapterId && { chapterId: chapterId.toString() })
      });

      const response = await essayAPI.get(`/essay/questions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách câu hỏi tự luận:', error);
      throw this.formatError(error);
    }
  },

  // Lấy chi tiết câu hỏi tự luận
  async getEssayQuestionDetail(questionId) {
    try {
      const response = await essayAPI.get(`/essay/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết câu hỏi:', error);
      throw this.formatError(error);
    }
  },

  // Xóa câu hỏi tự luận
  async deleteEssayQuestion(questionId) {
    try {
      const response = await essayAPI.delete(`/essay/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error);
      throw this.formatError(error);
    }
  },

  // Utility: Format error messages
  formatError(error) {
    if (error.response) {
      // Server response error
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.Message || error.message;
      
      switch (status) {
        case 400:
          return `Dữ liệu không hợp lệ: ${message}`;
        case 401:
          return 'Bạn cần đăng nhập để thực hiện thao tác này';
        case 403:
          return 'Bạn không có quyền thực hiện thao tác này';
        case 404:
          return 'Không tìm thấy dữ liệu yêu cầu';
        case 429:
          return 'Quá nhiều yêu cầu, vui lòng thử lại sau';
        case 500:
          return 'Lỗi máy chủ, vui lòng thử lại sau';
        default:
          return message || 'Có lỗi xảy ra khi giao tiếp với server';
      }
    } else if (error.request) {
      // Network error
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng';
    } else {
      // Other error
      return error.message || 'Có lỗi không xác định xảy ra';
    }
  },

  // Utility: Local storage for caching
  cacheEssayQuestion(questionId, data, ttlMinutes = 30) {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    };
    localStorage.setItem(`essay_question_${questionId}`, JSON.stringify(cacheData));
  },

  getCachedEssayQuestion(questionId) {
    try {
      const cached = localStorage.getItem(`essay_question_${questionId}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > cacheData.ttl;
      
      if (isExpired) {
        localStorage.removeItem(`essay_question_${questionId}`);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Lỗi khi đọc cache:', error);
      return null;
    }
  },

  // Utility: Validation helpers
  validateWordCount(text, minWords = 50, maxWords = 500) {
    if (!text || typeof text !== 'string') {
      return { isValid: false, wordCount: 0, message: 'Vui lòng nhập câu trả lời' };
    }

    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    if (wordCount < minWords) {
      return {
        isValid: false,
        wordCount,
        message: `Cần thêm ${minWords - wordCount} từ (tối thiểu ${minWords} từ)`
      };
    }

    if (wordCount > maxWords) {
      return {
        isValid: false,
        wordCount,
        message: `Vượt quá ${wordCount - maxWords} từ (tối đa ${maxWords} từ)`
      };
    }

    return {
      isValid: true,
      wordCount,
      message: `Độ dài phù hợp (${wordCount}/${maxWords} từ)`
    };
  },

  // Utility: Real-time essay analysis
  async getRealtimeAnalysis(text) {
    if (!text || text.length < 20) {
      return null;
    }

    try {
      // Basic client-side analysis
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const physicsTerms = [
        'lực', 'gia tốc', 'vận tốc', 'động lượng', 'năng lượng', 'công suất',
        'điện tích', 'điện trường', 'từ trường', 'dao động', 'sóng', 'ánh sáng',
        'nhiệt độ', 'định luật', 'nguyên lý', 'hiện tượng', 'công thức'
      ];
      
      const foundTerms = physicsTerms.filter(term => 
        text.toLowerCase().includes(term)
      );

      const hasFormula = /[=+\-*/()]/g.test(text);
      const hasExample = text.toLowerCase().includes('ví dụ') || 
                        text.toLowerCase().includes('chẳng hạn');

      return {
        sentences: sentences.length,
        physicsTerms: foundTerms,
        hasFormula,
        hasExample,
        readabilityScore: this.calculateReadabilityScore(text)
      };
    } catch (error) {
      console.error('Lỗi phân tích realtime:', error);
      return null;
    }
  },

  // Simple readability score calculation
  calculateReadabilityScore(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (sentences.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    
    // Score from 0-10, optimal around 15-20 words/sentence
    if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
      return 8;
    } else if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) {
      return 6;
    } else {
      return 4;
    }
  },

  // Create essay submission object (matching backend DTO format)
  createEssaySubmission(questionId, studentId, studentAnswer) {
    const wordCount = studentAnswer.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    return {
      QuestionId: questionId,
      StudentId: studentId,
      StudentAnswer: studentAnswer,
      SubmittedAt: new Date().toISOString(),
      WordCount: wordCount
    };
  }
}; 