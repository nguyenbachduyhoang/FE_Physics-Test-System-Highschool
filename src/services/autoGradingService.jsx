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
class AutoGradingService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/auto-grading`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor để thêm token
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor để xử lý response
    this.apiClient.interceptors.response.use(
      (response) => {
        // Handle ApiResponse format: { success: true, message: "...", data: {...} }
        return response.data.success ? response.data.data : response.data;
      },
      (error) => {
        console.error('Auto grading API error:', error);
        throw this.formatError(error);
      }
    );
  }

  formatError(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Có lỗi xảy ra với hệ thống chấm điểm';
  }

  // 🎯 Chấm điểm một câu hỏi đơn lẻ
  async gradeSingleQuestion(questionId, studentChoiceId, studentUserId = null) {
    try {
      const response = await this.apiClient.post('/questions/grades', {
        questionId,
        studentChoiceId,
        studentUserId
      });
      return response;
    } catch (error) {
      console.error('Error grading single question:', error);
      throw error;
    }
  }

  // 🎯 Chấm điểm toàn bộ bài thi
  async gradeExam(examId, studentAnswers, studentUserId, timeTaken = null) {
    try {
      const response = await this.apiClient.post('/exams/grades', {
        examId,
        studentUserId,
        studentAnswers,
        timeTaken
      });
      return response;
    } catch (error) {
      console.error('Error grading exam:', error);
      throw error;
    }
  }

  // 🎯 Chấm điểm dựa trên attempt có sẵn
  async gradeExamAttempt(attemptId) {
    try {
      const response = await this.apiClient.post(`/attempts/${attemptId}/grades`);
      return response;
    } catch (error) {
      console.error('Error grading exam attempt:', error);
      throw error;
    }
  }

  // 🎯 Lấy feedback chi tiết cho một câu hỏi
  async getDetailedFeedback(questionId, studentChoiceId) {
    try {
      const response = await this.apiClient.get(`/questions/${questionId}/feedback`, {
        params: { studentChoiceId }
      });
      return response;
    } catch (error) {
      console.error('Error getting detailed feedback:', error);
      throw error;
    }
  }

  // 🎯 Lấy thống kê câu hỏi
  async getQuestionAnalytics(questionId) {
    try {
      const response = await this.apiClient.get(`/questions/${questionId}/analytics`);
      return response;
    } catch (error) {
      console.error('Error getting question analytics:', error);
      throw error;
    }
  }

  // 🎯 Lấy báo cáo hiệu suất học sinh
  async getStudentPerformance(studentId, examId = null) {
    try {
      const params = examId ? { examId } : {};
      const response = await this.apiClient.get(`/students/${studentId}/performance`, {
        params
      });
      return response;
    } catch (error) {
      console.error('Error getting student performance:', error);
      throw error;
    }
  }

  // 🎯 Lấy các lỗi thường gặp của câu hỏi
  async getCommonMistakes(questionId) {
    try {
      const response = await this.apiClient.get(`/questions/${questionId}/mistakes`);
      return response;
    } catch (error) {
      console.error('Error getting common mistakes:', error);
      throw error;
    }
  }

  // 🎯 Lấy thống kê bài thi
  async getExamStatistics(examId) {
    try {
      const response = await this.apiClient.get(`/exams/${examId}/statistics`);
      return response;
    } catch (error) {
      console.error('Error getting exam statistics:', error);
      throw error;
    }
  }

  // 🎯 Chấm điểm hàng loạt nhiều câu hỏi
  async batchGradeQuestions(questions, studentUserId = null) {
    try {
      const response = await this.apiClient.post('/questions/grades-batch', {
        questions,
        studentUserId
      });
      return response;
    } catch (error) {
      console.error('Error batch grading questions:', error);
      throw error;
    }
  }

  // 🎯 Helper: Tính điểm tổng từ kết quả chấm
  calculateTotalScore(gradingResults) {
    if (!Array.isArray(gradingResults)) return { total: 0, earned: 0, percentage: 0 };
    
    const totalPoints = gradingResults.reduce((sum, result) => sum + (result.maxPoints || 0), 0);
    const earnedPoints = gradingResults.reduce((sum, result) => sum + (result.pointsEarned || 0), 0);
    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints * 100) : 0;
    
    return {
      total: totalPoints,
      earned: earnedPoints,
      percentage: Math.round(percentage * 100) / 100
    };
  }

  // 🎯 Helper: Chuyển đổi grade thành text tiếng Việt
  getGradeText(grade) {
    // Nếu grade là letter (A, B, C, D, F)
    const gradeMap = {
      'A': 'Xuất sắc',
      'B': 'Giỏi', 
      'C': 'Khá',
      'D': 'Trung bình',
      'F': 'Yếu'
    };
    if (gradeMap[grade]) {
      return gradeMap[grade];
    }
    
    // Nếu grade là số (0-10 hoặc percentage)
    const score = typeof grade === 'number' ? grade : parseFloat(grade);
    if (!isNaN(score)) {
      if (score >= 8.5) return 'Xuất sắc';
      if (score >= 7.0) return 'Giỏi';
      if (score >= 5.5) return 'Khá';
      if (score >= 4.0) return 'Trung bình';
      return 'Yếu';
    }
    
    return 'Chưa xác định';
  }

  // 🎯 Helper: Convert score thành grade text (dành cho thang điểm 10)
  getGradeFromScore(score) {
    if (score >= 8.5) return 'Xuất sắc';
    if (score >= 7.0) return 'Giỏi';
    if (score >= 5.5) return 'Khá';
    if (score >= 4.0) return 'Trung bình';
    return 'Yếu';
  }

  // 🎯 Helper: Phân loại hiệu suất
  getPerformanceLevelText(level) {
    const levelMap = {
      'Excellent': 'Xuất sắc',
      'Good': 'Tốt',
      'Average': 'Trung bình', 
      'NeedsImprovement': 'Cần cải thiện'
    };
    return levelMap[level] || 'Chưa xác định';
  }

  // 🎯 Helper: Format thời gian
  formatTime(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // 🎯 Helper: Tạo student answers từ selectedAnswers
  createStudentAnswers(selectedAnswers) {
    return Object.entries(selectedAnswers).map(([questionId, choiceId]) => ({
      questionId: questionId,
      selectedChoiceId: choiceId,
      answeredAt: new Date().toISOString()
    }));
  }
}

export const autoGradingService = new AutoGradingService();
export default autoGradingService; 