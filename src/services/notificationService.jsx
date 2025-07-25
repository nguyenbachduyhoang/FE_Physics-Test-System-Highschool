import { messaging, getToken, onMessage } from '../firebase.js';
import { toast } from 'react-hot-toast';

class NotificationService {
  constructor() {
    this.vapidKey = 'BJ8Q9XvYqZ9W3h_1rC8F0KvQwJ7Y2mF3G4rN5sL6tK8pH9aZ2bC3dE4fG5hI6jK7lM8nO9pQ0rS1tU2vW3xY4z'; // Thay bằng VAPID key thực tế
    this.permission = null;
    this.token = null;
    this.init();
  }

  async init() {
    if (!messaging) {
      console.warn('Firebase Messaging không được hỗ trợ');
      return;
    }

    try {
      this.permission = await Notification.requestPermission();
      
      if (this.permission === 'granted') {
        this.token = await getToken(messaging, { vapidKey: this.vapidKey });
        console.log('Firebase registration token:', this.token);
        
        this.onMessageListener();
      } else {
        console.warn('Notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  onMessageListener() {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      
      const { notification, data } = payload;
      
      if (notification) {
        toast.success(`${notification.title}: ${notification.body}`, {
          duration: 5000,
          position: 'top-right',
        });
      }
      
      if (this.permission === 'granted' && notification) {
        new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/favicon.ico',
          data: data
        });
      }
    });
  }

  showSuccess(message) {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#f6ffed',
        color: '#389e0d',
        border: '1px solid #b7eb8f'
      }
    });
  }

  showError(message) {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#fff2f0',
        color: '#cf1322',
        border: '1px solid #ffccc7'
      }
    });
  }

  showWarning(message) {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#fffbe6',
        color: '#d46b08',
        border: '1px solid #ffe58f'
      }
    });
  }

  showInfo(message) {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#e6f7ff',
        color: '#1890ff',
        border: '1px solid #91d5ff'
      }
    });
  }

  showLoading(message = 'Đang xử lý...') {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#f0f0f0',
        color: '#595959'
      }
    });
  }

  dismiss(toastId) {
    toast.dismiss(toastId);
  }

  getToken() {
    return this.token;
  }

  getPermission() {
    return this.permission;
  }
}

const notificationService = new NotificationService();

export default notificationService; 