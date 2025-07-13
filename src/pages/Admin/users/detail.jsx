import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Tag,
  Descriptions,
  Spin,
  Alert,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Row,
  Col,
  Table,
  Statistic,
  Avatar,
  Progress
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  TrophyOutlined,
  FileTextOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { adminService, analyticsService } from "../../../services";
import toast from "react-hot-toast";
import "./detail.scss";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch user details
  const fetchUserDetail = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await adminService.getUserById(id);
      if (response?.success || response?.data || response) {
        const userData = response.data || response;
        setUser(userData);

        // Fetch user statistics
        try {
          const statsResponse = await analyticsService.getStudentProgress(id);
          setUserStats(statsResponse);
        } catch (error) {
          console.warn('Could not load user statistics:', error);
        }

        // Fetch user exam history (mock data for now)
        setUserHistory([
          { examId: '1', examName: 'Đề thi Vật lý 10 - Chương 1', score: 8.5, maxScore: 10, completedAt: new Date().toISOString() },
          { examId: '2', examName: 'Kiểm tra 15p - Chương 2', score: 7.0, maxScore: 10, completedAt: new Date().toISOString() }
        ]);
      } else {
        throw new Error('Không thể tải thông tin người dùng');
      }
    } catch (error) {
      console.error('Error fetching user detail:', error);
      toast.error('Lỗi khi tải thông tin người dùng: ' + error.message);
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  // Handle edit user
  const handleEdit = () => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        isActive: user.is_active
      });
      setEditModalVisible(true);
    }
  };

  // Handle update user
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const updateData = {
        full_name: values.fullName,
        email: values.email,
        is_active: values.isActive
      };

      const response = await adminService.updateUser(id, updateData);

      // adminService.updateUser bây giờ trả về toàn bộ response
      if (response?.success) {
        toast.success('Cập nhật người dùng thành công!');
        setEditModalVisible(false);
        fetchUserDetail();
      } else {
        throw new Error(response?.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Lỗi cập nhật: ' + error.message);
    }
  };

  // Handle delete user
  const handleDelete = async () => {
    try {
      const response = await adminService.deleteUser(id);

      // adminService.deleteUser bây giờ trả về toàn bộ response
      if (response?.success) {
        toast.success('Xóa người dùng thành công!');
        navigate('/admin/users');
      } else {
        throw new Error(response?.message || 'Xóa thất bại');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Lỗi xóa: ' + error.message);
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'red';
      case 'teacher': return 'blue';
      case 'student': return 'green';
      default: return 'default';
    }
  };

  // Get role text
  const getRoleText = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'Quản trị viên';
      case 'teacher': return 'Giáo viên';
      case 'student': return 'Học sinh';
      default: return role;
    }
  };

  // Get status color
  const getStatusColor = (isActive) => {
    return isActive ? 'green' : 'red';
  };

  // Get status text
  const getStatusText = (isActive) => {
    return isActive ? 'Hoạt động' : 'Bị khóa';
  };

  // Exam history table columns
  const historyColumns = [
    {
      title: 'Tên đề thi',
      dataIndex: 'examName',
      key: 'examName'
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      width: 100,
      render: (score, record) => (
        <Text strong style={{ color: score >= 5 ? '#52c41a' : '#f5222d' }}>
          {score}/{record.maxScore}
        </Text>
      )
    },
    {
      title: 'Phần trăm',
      key: 'percentage',
      width: 120,
      render: (_, record) => {
        const percentage = (record.score / record.maxScore * 100).toFixed(1);
        return (
          <div>
            <Progress
              percent={percentage}
              size="small"
              status={percentage >= 50 ? 'normal' : 'exception'}
            />
            <Text style={{ fontSize: '12px' }}>{percentage}%</Text>
          </div>
        );
      }
    },
    {
      title: 'Ngày thi',
      dataIndex: 'completedAt',
      key: 'completedAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <div>Đang tải thông tin người dùng...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <Alert
          message="Không tìm thấy người dùng"
          description="Người dùng có thể đã bị xóa hoặc không tồn tại."
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/admin/users')}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="user-detail-page">
      {/* Header */}
      <Card className="header-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/users')}
              >
                Quay lại
              </Button>
              <Title level={3} style={{ margin: 0 }}>Chi tiết người dùng</Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Sửa
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => setDeleteModalVisible(true)}
              >
                Xóa
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* User Profile */}
      <Card className="profile-card">
        <Row gutter={24} align="middle">
          <Col xs={24} md={6} style={{ textAlign: 'center' }}>
            <Avatar
              size={120}
              icon={<UserOutlined />}
              src={user.avatarUrl}
              style={{ marginBottom: '16px' }}
            />
            <div>
              <Title level={4} style={{ margin: 0 }}>{user.full_name}</Title>
              <Text type="secondary">@{user.username}</Text>
            </div>
          </Col>
          <Col xs={24} md={18}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="ID" span={2}>{user.id}</Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag color={getRoleColor(user.role)}>
                  {getRoleText(user.role)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(user.is_active)}>
                  {getStatusText(user.is_active)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
                <Space>
                  <MailOutlined />
                  <Text copyable>{user.email}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                <Space>
                  <CalendarOutlined />
                  {user.created_at ? new Date(user.created_at).toLocaleString('vi-VN') : 'N/A'}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      {user.role === 'student' && (
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Số bài thi"
                value={userStats?.totalAttempts || userHistory.length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Điểm trung bình"
                value={userStats?.averageScore || 7.25}
                precision={2}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Điểm cao nhất"
                value={userStats?.highestScore || 8.5}
                precision={1}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Thời gian học"
                value={userStats?.totalStudyTime || 120}
                suffix="giờ"
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Exam History */}
      {user.role === 'student' && userHistory.length > 0 && (
        <Card title="Lịch sử thi" className="history-card">
          <Table
            columns={historyColumns}
            dataSource={userHistory}
            rowKey="examId"
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </Card>
      )}

      {/* Additional Info */}
      {user.bio && (
        <Card title="Thông tin thêm" className="bio-card">
          <Paragraph>{user.bio}</Paragraph>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        title="Sửa thông tin người dùng"
        open={editModalVisible}
        onOk={handleUpdate}
        onCancel={() => setEditModalVisible(false)}
        width={800}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên đăng nhập"
                name="username"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
              >
                <Input placeholder="Nhập tên đăng nhập..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
              >
                <Input placeholder="Nhập họ và tên..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập email..." />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Vai trò"
                name="role"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="admin">Quản trị viên</Option>
                  <Option value="teacher">Giáo viên</Option>
                  <Option value="student">Học sinh</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="isActive"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Option value={true}>Hoạt động</Option>
                  <Option value={false}>Bị khóa</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa người dùng này không?</p>
        <p><strong>Tên đăng nhập:</strong> {user.username}</p>
        <p><strong>Họ và tên:</strong> {user.full_name}</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
} 