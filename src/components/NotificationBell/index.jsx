import React, { useState } from 'react';
import { Badge, Dropdown, List, Button, Space, Typography, Empty, Divider } from 'antd';
import { 
  BellOutlined, 
  DeleteOutlined, 
  CheckOutlined,
  ClearOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNotification } from '../../contexts/NotificationContext';
import './index.scss';

const { Text, Title } = Typography;

const NotificationBell = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll
  } = useNotification();
  
  const [visible, setVisible] = useState(false);

  // Format thời gian hiển thị
  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  // Lấy màu cho type notification
  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return '#52c41a';
      case 'error': return '#ff4d4f';
      case 'warning': return '#faad14';
      case 'info':
      default: return '#1890ff';
    }
  };

  // Handle click notification item
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to URL if provided
    if (notification.url) {
      window.location.href = notification.url;
    }
  };

  // Render notification item
  const renderNotificationItem = (notification) => (
    <List.Item
      key={notification.id}
      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
      actions={[
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={async (e) => {
            e.stopPropagation();
            if (!notification.read) await markAsRead(notification.id);
          }}
          title="Đánh dấu đã đọc"
        />,
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={async (e) => {
            e.stopPropagation();
            await removeNotification(notification.id);
          }}
          title="Xóa thông báo"
          danger
        />
      ]}
      onClick={() => handleNotificationClick(notification)}
      style={{ cursor: 'pointer' }}
    >
      <List.Item.Meta
        avatar={
          <div 
            className="notification-icon"
            style={{ 
              backgroundColor: getTypeColor(notification.type),
              color: 'white',
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
          >
            {notification.icon || '🔔'}
          </div>
        }
        title={
          <div className="notification-title">
            <Text strong={!notification.read}>{notification.title}</Text>
            {!notification.read && <div className="unread-dot" />}
          </div>
        }
        description={
          <div className="notification-content">
            <Text type="secondary">{notification.message}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatTime(notification.timestamp)}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  // Dropdown menu content
  const dropdownContent = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <Title level={5} style={{ margin: 0 }}>
          Thông báo {unreadCount > 0 && `(${unreadCount})`}
        </Title>
        <div className="notification-time">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Cập nhật: {new Date().toLocaleTimeString('vi-VN')}
          </Text>
        </div>
      </div>
      
      <Divider style={{ margin: '8px 0' }} />
      
      {notifications.length > 0 && (
        <div className="notification-actions">
          <Space>
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={async () => await markAllAsRead()}
              disabled={unreadCount === 0}
            >
              Đánh dấu tất cả đã đọc
            </Button>
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={clearAll}
              danger
            >
              Xóa tất cả
            </Button>
          </Space>
        </div>
      )}

      <div className="notification-list">
        {notifications.length > 0 ? (
          <List
            dataSource={notifications.slice(0, 10)} // Hiển thị tối đa 10 thông báo
            renderItem={renderNotificationItem}
            size="small"
          />
        ) : (
          <Empty 
            description="Không có thông báo nào" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '20px 0' }}
          />
        )}
      </div>

      {notifications.length > 10 && (
        <div className="notification-footer">
          <Button type="link" size="small" block>
            Xem tất cả thông báo ({notifications.length})
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      overlay={dropdownContent}
      trigger={['click']}
      visible={visible}
      onVisibleChange={setVisible}
      placement="bottomRight"
      overlayClassName="notification-dropdown-overlay"
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          className="notification-bell-button"
          size="large"
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell; 