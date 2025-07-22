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
const explanationAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
explanationAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

explanationAPI.interceptors.response.use(
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

class ExplanationService {
  constructor() {
    this.baseURL = '/explanation';
  }

  /**
   * Lấy explanation cho một câu hỏi
   * @param {string} questionId - ID của câu hỏi
   * @returns {Promise} Response chứa explanation data
   */
  async getExplanationByQuestion(questionId) {
    try {
      const response = await explanationAPI.get(`${this.baseURL}/${questionId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error getting explanation:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy giải thích',
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Lấy tất cả explanation với phân trang
   * @param {Object} params - Parameters cho pagination và search
   * @returns {Promise} Response chứa danh sách explanation
   */
  async getAllExplanations(params = {}) {
    try {
      const { page = 1, pageSize = 10, search = '' } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search })
      });

      const response = await explanationAPI.get(`${this.baseURL}?${queryParams}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error getting explanations:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy danh sách giải thích'
      };
    }
  }

  /**
   * Tạo explanation mới
   * @param {Object} explanationData - Dữ liệu explanation
   * @returns {Promise} Response
   */
  async createExplanation(explanationData) {
    try {
      const response = await explanationAPI.post(this.baseURL, explanationData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating explanation:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tạo giải thích'
      };
    }
  }

  /**
   * Cập nhật explanation
   * @param {string} explanationId - ID của explanation
   * @param {Object} explanationData - Dữ liệu cập nhật
   * @returns {Promise} Response
   */
  async updateExplanation(explanationId, explanationData) {
    try {
      const response = await explanationAPI.put(`${this.baseURL}/${explanationId}`, explanationData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating explanation:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể cập nhật giải thích'
      };
    }
  }

  /**
   * Xóa explanation
   * @param {string} explanationId - ID của explanation
   * @returns {Promise} Response
   */
  async deleteExplanation(explanationId) {
    try {
      const response = await explanationAPI.delete(`${this.baseURL}/${explanationId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting explanation:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể xóa giải thích'
      };
    }
  }

  /**
   * Tạo explanation tự động bằng AI (nếu cần)
   * @param {string} questionId - ID của câu hỏi
   * @returns {Promise} Response
   */
  async generateExplanationWithAI(questionId) {
    try {
      // Gọi AI service để tạo explanation tự động
      const response = await explanationAPI.post(`/questions/${questionId}/explanation`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error generating AI explanation:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tạo giải thích tự động'
      };
    }
  }
}

export const explanationService = new ExplanationService(); 