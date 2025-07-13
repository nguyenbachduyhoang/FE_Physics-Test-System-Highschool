import React, { createContext, useContext, useState, useEffect } from 'react';
import { messaging, onMessage } from '../firebase';
import notificationService from '../services/notificationService';
import systemNotificationService from '../services/systemNotificationService';
import notificationApiService from '../services/notificationApiService';

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
  const [loading, setLoading] = useState(false);

  // Load notifications from API when component mounts
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationApiService.getNotifications({
        includeRead: true,
        pageSize: 50 // Load more notifications
      });

      if (response?.success && response?.data) {
        const apiNotifications = response.data.map(notif => ({
          id: notif.notificationId,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          icon: getIconForType(notif.type),
          timestamp: new Date(notif.createdAt),
          read: notif.isRead,
          source: 'api'
        }));

        setNotifications(apiNotifications);
        setUnreadCount(apiNotifications.filter(n => !n.read).length);
        console.log('📥 Loaded', apiNotifications.length, 'notifications from API');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get icon for notification type
  const getIconForType = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '🔔';
    }
  };

  // Initialize notifications - load from API
  useEffect(() => {
    console.log('🔔 Notification system initializing...');
    loadNotifications();
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
  const markAsRead = async (notificationId) => {
    try {
      // Update local state first for immediate UI feedback
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Call API to mark as read on backend
      await notificationApiService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Optionally revert local state on error
    }
  };

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = async () => {
    try {
      // Update local state first
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);

      // Call API for each unread notification
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notif => 
          notificationApiService.markAsRead(notif.id)
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Xóa notification
  const removeNotification = async (notificationId) => {
    try {
      // Update local state first for immediate UI feedback
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      setUnreadCount(prev => {
        return notification && !notification.read ? Math.max(0, prev - 1) : prev;
      });

      // Call API to delete on backend
      await notificationApiService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Error removing notification:', error);
      // Optionally revert local state on error
    }
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
    loading,
    addNotification,
    addNotificationWithToast,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 