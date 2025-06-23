import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5298' : 'https://be-phygens-production.up.railway.app');

const analyticsAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
analyticsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
analyticsAPI.interceptors.response.use(
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

export const analyticsService = {
  // =============== DASHBOARD ANALYTICS APIs ===============
  
  // Get dashboard overview data
  getDashboard: async () => {
    const response = await analyticsAPI.get('/analytics/dashboard');
    return response.data.success ? response.data.data : response.data;
  },

  // Get dashboard data for specific time period
  getDashboardByPeriod: async (startDate, endDate) => {
    const response = await analyticsAPI.get('/analytics/dashboard', {
      params: { startDate, endDate }
    });
    return response.data.success ? response.data.data : response.data;
  },

  // =============== STUDENT PROGRESS ANALYTICS ===============
  
  // Get individual student progress
  getStudentProgress: async (userId) => {
    const response = await analyticsAPI.get(`/analytics/student-progress/${userId}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Get my own progress (for students)
  getMyProgress: async () => {
    const response = await analyticsAPI.get('/analytics/my-progress');
    return response.data.success ? response.data.data : response.data;
  },

  // Get class progress overview (for teachers)
  getClassProgress: async (classId = null) => {
    const params = classId ? { classId } : {};
    const response = await analyticsAPI.get('/analytics/class-progress', { params });
    return response.data.success ? response.data.data : response.data;
  },

  // =============== EXAM ANALYTICS ===============
  
  // Get detailed exam statistics
  getExamStatistics: async (examId) => {
    const response = await analyticsAPI.get(`/analytics/exam-statistics/${examId}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Get exam performance trends
  getExamTrends: async (examId, period = '30days') => {
    const response = await analyticsAPI.get(`/analytics/exam-trends/${examId}`, {
      params: { period }
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Get exam completion rates
  getExamCompletionRates: async (filters = {}) => {
    const response = await analyticsAPI.get('/analytics/exam-completion-rates', {
      params: filters
    });
    return response.data.success ? response.data.data : response.data;
  },

  // =============== CHAPTER & TOPIC ANALYTICS ===============
  
  // Get chapter performance analytics
  getChapterAnalytics: async (grade = null) => {
    const params = grade ? { grade } : {};
    const response = await analyticsAPI.get('/analytics/chapter-analytics', { params });
    return response.data.success ? response.data.data : response.data;
  },

  // Get topic difficulty analysis
  getTopicDifficultyAnalysis: async (chapterId = null) => {
    const params = chapterId ? { chapterId } : {};
    const response = await analyticsAPI.get('/analytics/topic-difficulty', { params });
    return response.data.success ? response.data.data : response.data;
  },

  // Get weak areas for students
  getWeakAreas: async (userId = null) => {
    const endpoint = userId ? `/analytics/weak-areas/${userId}` : '/analytics/my-weak-areas';
    const response = await analyticsAPI.get(endpoint);
    return response.data.success ? response.data.data : response.data;
  },

  // =============== PERFORMANCE COMPARISON ===============
  
  // Compare student performance
  compareStudentPerformance: async (studentIds, criteria = {}) => {
    const response = await analyticsAPI.post('/analytics/compare-students', {
      studentIds,
      ...criteria
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Compare class performance
  compareClassPerformance: async (classIds, criteria = {}) => {
    const response = await analyticsAPI.post('/analytics/compare-classes', {
      classIds,
      ...criteria
    });
    return response.data.success ? response.data.data : response.data;
  },

  // =============== LEARNING PROGRESS TRACKING ===============
  
  // Get learning path progress
  getLearningPathProgress: async (userId = null) => {
    const endpoint = userId ? `/analytics/learning-path/${userId}` : '/analytics/my-learning-path';
    const response = await analyticsAPI.get(endpoint);
    return response.data.success ? response.data.data : response.data;
  },

  // Get skill mastery levels
  getSkillMastery: async (userId = null, subject = 'physics') => {
    const endpoint = userId ? `/analytics/skill-mastery/${userId}` : '/analytics/my-skill-mastery';
    const params = { subject };
    const response = await analyticsAPI.get(endpoint, { params });
    return response.data.success ? response.data.data : response.data;
  },

  // =============== USAGE STATISTICS ===============
  
  // Get system usage statistics
  getUsageStatistics: async (timeframe = 'week') => {
    const response = await analyticsAPI.get('/analytics/usage-statistics', {
      params: { timeframe }
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Get user activity data
  getUserActivity: async (userId = null, days = 30) => {
    const endpoint = userId ? `/analytics/user-activity/${userId}` : '/analytics/my-activity';
    const params = { days };
    const response = await analyticsAPI.get(endpoint, { params });
    return response.data.success ? response.data.data : response.data;
  },

  // =============== REPORTING FUNCTIONS ===============
  
  // Generate student report
  generateStudentReport: async (userId, reportType = 'comprehensive') => {
    const response = await analyticsAPI.post('/analytics/generate-student-report', {
      userId,
      reportType
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Generate class report
  generateClassReport: async (classId, reportType = 'summary') => {
    const response = await analyticsAPI.post('/analytics/generate-class-report', {
      classId,
      reportType
    });
    return response.data.success ? response.data.data : response.data;
  },

  // Export analytics data
  exportAnalyticsData: async (dataType, filters = {}) => {
    const response = await analyticsAPI.get('/analytics/export', {
      params: { dataType, ...filters },
      responseType: 'blob'
    });
    return response.data;
  },

  // =============== UTILITY FUNCTIONS ===============
  
  // Format analytics data for charts
  formatChartData: (data, chartType = 'line') => {
    switch (chartType) {
      case 'line':
        return {
          labels: data.map(item => item.label || item.date),
          datasets: [{
            data: data.map(item => item.value),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1
          }]
        };
      case 'bar':
        return {
          labels: data.map(item => item.label),
          datasets: [{
            data: data.map(item => item.value),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3B82F6',
            borderWidth: 1
          }]
        };
      case 'pie':
        return {
          labels: data.map(item => item.label),
          datasets: [{
            data: data.map(item => item.value),
            backgroundColor: [
              '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
              '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
            ]
          }]
        };
      default:
        return data;
    }
  },

  // Calculate percentage change
  calculatePercentageChange: (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  },

  // Format performance level
  formatPerformanceLevel: (score) => {
    if (score >= 90) return { level: 'Xuất sắc', color: '#10B981' };
    if (score >= 80) return { level: 'Giỏi', color: '#3B82F6' };
    if (score >= 70) return { level: 'Khá', color: '#F59E0B' };
    if (score >= 60) return { level: 'Trung bình', color: '#F97316' };
    return { level: 'Cần cải thiện', color: '#EF4444' };
  },

  // Format time duration
  formatDuration: (minutes) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} giờ`;
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

export default analyticsService; 