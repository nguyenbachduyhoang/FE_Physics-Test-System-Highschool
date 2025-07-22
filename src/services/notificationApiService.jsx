
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
class NotificationApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Lấy danh sách notifications
  async getNotifications(options = {}) {
    try {
      const {
        userId = null,
        includeRead = true,
        type = null,
        page = 1,
        pageSize = 20
      } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        includeRead: includeRead.toString()
      });

      if (userId) params.append('userId', userId);
      if (type) params.append('type', type);

      const response = await fetch(`${this.baseUrl}/notifications?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Lấy số lượng notifications chưa đọc
  async getUnreadCount(userId = null) {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);

      const response = await fetch(`${this.baseUrl}/notifications/unread-counts?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // Tạo notification mới
  async createNotification(notificationData) {
    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Đánh dấu notification đã đọc
  async markAsRead(notificationId, userId = null) {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);

      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read-status?${params}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Xóa notification
  async deleteNotification(notificationId) {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

// Tạo instance singleton
const notificationApiService = new NotificationApiService();

export default notificationApiService; 