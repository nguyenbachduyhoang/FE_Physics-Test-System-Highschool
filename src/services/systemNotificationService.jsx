class SystemNotificationService {
  constructor() {
    this.listeners = new Set();
    this.eventQueue = [];
    this.init();
  }

  init() {
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
    
    console.log('🔔 SystemNotificationService initialized - ready for real events');
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  broadcast(notification) {
    this.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error broadcasting notification:', error);
      }
    });
  }

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

  sendSystemNotification(notification) {
    const systemNotification = {
      ...notification,
      id: `system_${Date.now()}`,
      timestamp: new Date(),
      source: 'system'
    };

    this.broadcast(systemNotification);

    localStorage.setItem('system_notification', JSON.stringify(systemNotification));
    
    setTimeout(() => {
      localStorage.removeItem('system_notification');
    }, 1000);
  }



  notifyExamCreated(examData) {
    this.sendSystemNotification({
      title: '📝 Đề thi mới đã có!',
      message: `Đề thi "${examData.examName}" vừa được tạo - ${examData.questionCount || 'Nhiều'} câu hỏi`,
      type: 'info',
      icon: '🎯',
      url: '/thiMau'
    });
  }

  notifyExamUpdated(examData) {
    this.sendSystemNotification({
      title: '📝 Đề thi đã được cập nhật',
      message: `Đề thi "${examData.examName}" có nội dung mới`,
      type: 'info',
      icon: '📝',
      url: '/thiMau'
    });
  }

  notifyExamDeleted(examData) {
    this.sendSystemNotification({
      title: '🗑️ Đề thi đã được xóa',
      message: `Đề thi "${examData.examName}" đã bị xóa khỏi hệ thống`,
      type: 'warning',
      icon: '⚠️'
    });
  }

  notifyMaintenance(message, startTime) {
    this.sendSystemNotification({
      title: '🔧 Bảo trì hệ thống',
      message: message || `Hệ thống sẽ bảo trì từ ${startTime}`,
      type: 'warning',
      icon: '⚠️'
    });
  }

  notifySystemError(error) {
    this.sendSystemNotification({
      title: '❌ Lỗi hệ thống',
      message: error || 'Có lỗi xảy ra, vui lòng thử lại sau',
      type: 'error',
      icon: '🚨'
    });
  }

  notifyAchievement(achievement) {
    this.sendSystemNotification({
      title: '🏆 Chúc mừng!',
      message: achievement || 'Bạn đã đạt được thành tích mới!',
      type: 'success',
      icon: '🎉'
    });
  }

  notifyExamSubmission(userData) {
    this.sendSystemNotification({
      title: '📋 Có bài thi mới!',
      message: `${userData.userName} vừa nộp bài "${userData.examName}" - Điểm: ${userData.score}/100`,
      type: 'info',
      icon: '✅',
      url: '/admin/reports'
    });
  }

  notifyExamDeadline(examData, timeLeft) {
    this.sendSystemNotification({
      title: '⏰ Sắp hết hạn!',
      message: `Đề thi "${examData.examName}" sẽ đóng trong ${timeLeft}`,
      type: 'warning',
      icon: '⏰',
      url: '/thiMau'
    });
  }

  notifyNewFeature(feature) {
    this.sendSystemNotification({
      title: '✨ Tính năng mới!',
      message: feature.message || 'Hệ thống đã được cập nhật với tính năng mới',
      type: 'info',
      icon: '🆕',
      url: feature.url
    });
  }

  notifyBulkMessage(adminMessage) {
    this.sendSystemNotification({
      title: `📢 Thông báo từ Admin`,
      message: adminMessage.content,
      type: adminMessage.type || 'info',
      icon: '📢',
      url: adminMessage.url
    });
  }

  destroy() {
    window.removeEventListener('storage', this.handleStorageEvent.bind(this));
    this.listeners.clear();
  }
}

const systemNotificationService = new SystemNotificationService();

export default systemNotificationService; 