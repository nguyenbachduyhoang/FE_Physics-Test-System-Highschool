// Import all services
import authService from './authService.jsx';
import userService from './userService.jsx';
import examService from './examService.jsx';
import questionBankService from './questionBankService.jsx';
import analyticsService from './analyticsService.jsx';
import adminService from './adminService.jsx';

// Export all services
export {
  authService,
  userService,
  examService,
  questionBankService,
  analyticsService,
  adminService
};

// Re-export with short aliases for convenience
export {
  authService as auth,
  userService as user,
  examService as exam,
  questionBankService as questionBank,
  analyticsService as analytics,
  adminService as admin
};

// Utility để đảm bảo data luôn là array và safe cho Table components
export const ensureArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && data.items && Array.isArray(data.items)) return data.items;
  if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) return data.data;
  return [];
};

// Utility để format response cho pagination
export const formatPaginationResponse = (response, defaultPageSize = 10) => {
  if (!response) {
    return {
      items: [],
      pagination: {
        current: 1,
        pageSize: defaultPageSize,
        total: 0
      }
    };
  }

  // Nếu response có cấu trúc pagination
  if (response.items || response.data) {
    return {
      items: ensureArray(response),
      pagination: {
        current: response.currentPage || response.page || 1,
        pageSize: response.pageSize || response.limit || defaultPageSize,
        total: response.totalCount || response.total || 0
      }
    };
  }

  // Nếu response chỉ là array
  if (Array.isArray(response)) {
    return {
      items: response,
      pagination: {
        current: 1,
        pageSize: defaultPageSize,
        total: response.length
      }
    };
  }

  // Fallback
  return {
    items: [],
    pagination: {
      current: 1,
      pageSize: defaultPageSize,
      total: 0
    }
  };
}; 