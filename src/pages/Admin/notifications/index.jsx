import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, message, Space, Typography, Alert } from 'antd';
import { BellOutlined, SendOutlined } from '@ant-design/icons';
import systemNotificationService from '../../../services/systemNotificationService';
import './index.scss';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

export default function NotificationManagement() {
  const [form] = Form.useForm();
  const [sending, setSending] = useState(false);

  // Send bulk notification to all users
  const handleSendNotification = async () => {
    try {
      const values = await form.validateFields();
      setSending(true);

      // Send notification via SystemNotificationService
      systemNotificationService.notifyBulkMessage({
        content: values.message,
        type: values.type,
        url: values.url
      });

      message.success('Thông báo đã được gửi đến tất cả người dùng!');
      form.resetFields();
    } catch (error) {
      console.error('Error sending notification:', error);
      message.error('Có lỗi xảy ra khi gửi thông báo');
    } finally {
      setSending(false);
    }
  };

  // Send system maintenance notification
  const handleMaintenanceNotification = () => {
    systemNotificationService.notifyMaintenance(
      'Hệ thống sẽ bảo trì từ 2:00-3:00 AM mai để cập nhật tính năng mới',
      '2:00 AM'
    );
    message.success('Đã gửi thông báo bảo trì!');
  };

  // Send new feature notification
  const handleNewFeatureNotification = () => {
    systemNotificationService.notifyNewFeature({
      message: 'Hệ thống AI chấm tự luận đã được cập nhật với độ chính xác cao hơn',
      url: '/thiMau'
    });
    message.success('Đã gửi thông báo tính năng mới!');
  };

  // Send achievement notification
  const handleAchievementNotification = () => {
    systemNotificationService.notifyAchievement(
      'Chúc mừng! Hệ thống đã có 1000+ người dùng hoạt động!'
    );
    message.success('Đã gửi thông báo thành tích!');
  };

  return (
    <div className="notification-management">
      <div className="page-header">
        <Title level={2}>
          <BellOutlined /> Quản lý Thông báo
        </Title>
        <p>Gửi thông báo đến tất cả người dùng trong hệ thống</p>
      </div>

      <div className="notification-content">
        <Card title="📢 Gửi Thông báo Tùy chỉnh" className="custom-notification-card">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSendNotification}
          >
            <Form.Item
              label="Loại thông báo"
              name="type"
              rules={[{ required: true, message: 'Vui lòng chọn loại thông báo!' }]}
              initialValue="info"
            >
              <Select>
                <Option value="success">✅ Thành công (Xanh lá)</Option>
                <Option value="info">ℹ️ Thông tin (Xanh dương)</Option>
                <Option value="warning">⚠️ Cảnh báo (Vàng)</Option>
                <Option value="error">❌ Lỗi (Đỏ)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Nội dung thông báo"
              name="message"
              rules={[
                { required: true, message: 'Vui lòng nhập nội dung thông báo!' },
                { min: 10, message: 'Nội dung phải có ít nhất 10 ký tự!' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập nội dung thông báo sẽ hiển thị cho tất cả người dùng..."
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Form.Item
              label="Đường dẫn (tùy chọn)"
              name="url"
              help="Khi user click vào thông báo sẽ chuyển đến đường dẫn này"
            >
              <Input
                placeholder="/thiMau hoặc /admin/exams"
                addonBefore="🔗"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                icon={<SendOutlined />}
                htmlType="submit"
                loading={sending}
                size="large"
                block
              >
                Gửi Thông báo đến Tất cả Users
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="🚀 Thông báo Nhanh" className="quick-notifications-card">
          <Alert
            message="Gửi các loại thông báo phổ biến với một cú click"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button
              type="default"
              icon="🔧"
              onClick={handleMaintenanceNotification}
              block
              size="large"
            >
              Thông báo Bảo trì Hệ thống
            </Button>

            <Button
              type="default"
              icon="✨"
              onClick={handleNewFeatureNotification}
              block
              size="large"
            >
              Thông báo Tính năng Mới
            </Button>

            <Button
              type="default"
              icon="🏆"
              onClick={handleAchievementNotification}
              block
              size="large"
            >
              Thông báo Thành tích
            </Button>
          </Space>
        </Card>

        <Card title="📊 Thống kê Thông báo" className="notification-stats-card">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">24</div>
              <div className="stat-label">Thông báo hôm nay</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">156</div>
              <div className="stat-label">Thông báo tháng này</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">89%</div>
              <div className="stat-label">Tỷ lệ đọc</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">452</div>
              <div className="stat-label">Users hoạt động</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 