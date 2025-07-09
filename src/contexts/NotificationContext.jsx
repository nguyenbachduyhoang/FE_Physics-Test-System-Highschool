import React, { createContext, useContext, useState, useEffect } from 'react';
import { messaging, onMessage } from '../firebase';
import notificationService from '../services/notificationService';
import systemNotificationService from '../services/systemNotificationService';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize empty notifications - only real events will add notifications
  useEffect(() => {
    console.log('🔔 Notification system ready - waiting for real events...');
  }, []);

  // Thêm notification mới (CHỈ VÀO STATE, KHÔNG HIỂN THỊ TOAST)
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Giữ tối đa 50 thông báo
    setUnreadCount(prev => prev + 1);

    console.log('📝 Added notification to state:', newNotification.title);
  };

  // Thêm notification VÀ hiển thị toast (cho các action tạo thủ công)
  const addNotificationWithToast = (notification) => {
    // Add to state
    addNotification(notification);
    
    // Show toast
    switch (notification.type) {
      case 'success':
        notificationService.showSuccess(notification.message);
        break;
      case 'error':
        notificationService.showError(notification.message);
        break;
      case 'warning':
        notificationService.showWarning(notification.message);
        break;
      case 'info':
      default:
        notificationService.showInfo(notification.message);
        break;
    }
  };

  // Đánh dấu đã đọc
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  // Xóa notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.read ? Math.max(0, prev - 1) : prev;
    });
  };

  // Xóa tất cả notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Listen for Firebase real-time messages
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Real-time message received:', payload);
      
      const { notification: firebaseNotification, data } = payload;
      
      if (firebaseNotification) {
        addNotification({
          title: firebaseNotification.title,
          message: firebaseNotification.body,
          type: data?.type || 'info',
          icon: data?.icon || '🔔',
          url: data?.url,
          source: 'firebase'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen for system notifications
  useEffect(() => {
    const unsubscribe = systemNotificationService.subscribe((systemNotification) => {
      console.log('System notification received:', systemNotification);
      addNotification(systemNotification);
    });

    return () => unsubscribe();
  }, []);



  const value = {
    notifications,
    unreadCount,
    addNotification,
    addNotificationWithToast,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 