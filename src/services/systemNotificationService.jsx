class SystemNotificationService {
  constructor() {
    this.listeners = new Set();
    this.eventQueue = [];
    this.init();
  }

  init() {
    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
    
    console.log('🔔 SystemNotificationService initialized - ready for real events');
  }

  // Subscribe to system notifications
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Broadcast notification to all subscribers
  broadcast(notification) {
    this.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error broadcasting notification:', error);
      }
    });
  }

  // Handle events from other browser tabs/windows
  handleStorageEvent(event) {
    if (event.key === 'system_notification') {
      try {
        const notification = JSON.parse(event.newValue);
        this.broadcast(notification);
      } catch (error) {
        console.error('Error parsing system notification:', error);
      }
    }
  }

  // Send system-wide notification
  sendSystemNotification(notification) {
    const systemNotification = {
      ...notification,
      id: `system_${Date.now()}`,
      timestamp: new Date(),
      source: 'system'
    };

    // Broadcast to current window
    this.broadcast(systemNotification);

    // Send to other tabs/windows via localStorage
    localStorage.setItem('system_notification', JSON.stringify(systemNotification));
    
    // Clean up localStorage after a short delay
    setTimeout(() => {
      localStorage.removeItem('system_notification');
    }, 1000);
  }



  // Notify when admin creates exam
  notifyExamCreated(examData) {
    this.sendSystemNotification({
      title: '📝 Đề thi mới đã có!',
      message: `Đề thi "${examData.examName}" vừa được tạo - ${examData.questionCount || 'Nhiều'} câu hỏi`,
      type: 'info',
      icon: '🎯',
      url: '/thiMau'
    });
  }

  // Notify when admin updates exam
  notifyExamUpdated(examData) {
    this.sendSystemNotification({
      title: '📝 Đề thi đã được cập nhật',
      message: `Đề thi "${examData.examName}" có nội dung mới`,
      type: 'info',
      icon: '📝',
      url: '/thiMau'
    });
  }

  // Notify when admin deletes exam
  notifyExamDeleted(examData) {
    this.sendSystemNotification({
      title: '🗑️ Đề thi đã được xóa',
      message: `Đề thi "${examData.examName}" đã bị xóa khỏi hệ thống`,
      type: 'warning',
      icon: '⚠️'
    });
  }

  // Notify system maintenance
  notifyMaintenance(message, startTime) {
    this.sendSystemNotification({
      title: '🔧 Bảo trì hệ thống',
      message: message || `Hệ thống sẽ bảo trì từ ${startTime}`,
      type: 'warning',
      icon: '⚠️'
    });
  }

  // Notify system error
  notifySystemError(error) {
    this.sendSystemNotification({
      title: '❌ Lỗi hệ thống',
      message: error || 'Có lỗi xảy ra, vui lòng thử lại sau',
      type: 'error',
      icon: '🚨'
    });
  }

  // Notify user achievement
  notifyAchievement(achievement) {
    this.sendSystemNotification({
      title: '🏆 Chúc mừng!',
      message: achievement || 'Bạn đã đạt được thành tích mới!',
      type: 'success',
      icon: '🎉'
    });
  }

  // Notify when user submits exam (for admin)
  notifyExamSubmission(userData) {
    this.sendSystemNotification({
      title: '📋 Có bài thi mới!',
      message: `${userData.userName} vừa nộp bài "${userData.examName}" - Điểm: ${userData.score}/100`,
      type: 'info',
      icon: '✅',
      url: '/admin/reports'
    });
  }

  // Notify exam deadline approaching
  notifyExamDeadline(examData, timeLeft) {
    this.sendSystemNotification({
      title: '⏰ Sắp hết hạn!',
      message: `Đề thi "${examData.examName}" sẽ đóng trong ${timeLeft}`,
      type: 'warning',
      icon: '⏰',
      url: '/thiMau'
    });
  }

  // Notify new feature announcement
  notifyNewFeature(feature) {
    this.sendSystemNotification({
      title: '✨ Tính năng mới!',
      message: feature.message || 'Hệ thống đã được cập nhật với tính năng mới',
      type: 'info',
      icon: '🆕',
      url: feature.url
    });
  }

  // Notify bulk message from admin
  notifyBulkMessage(adminMessage) {
    this.sendSystemNotification({
      title: `📢 Thông báo từ Admin`,
      message: adminMessage.content,
      type: adminMessage.type || 'info',
      icon: '📢',
      url: adminMessage.url
    });
  }

  // Clean up
  destroy() {
    window.removeEventListener('storage', this.handleStorageEvent.bind(this));
    this.listeners.clear();
  }
}

// Create singleton instance
const systemNotificationService = new SystemNotificationService();

export default systemNotificationService; 