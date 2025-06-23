/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "./index.scss";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Spin, Alert, Card, Row, Col, Tag } from 'antd';
import { UserOutlined, QuestionCircleOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons';
import AdminSidebar from "../../../components/Sidebar";
import {analyticsService } from "../../../services";
import toast from "react-hot-toast";
import SafeTable from "../../../components/uiBasic/SafeTable";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 2847,
    totalQuestions: 15672,
    totalExams: 4231,
    todayVisits: 8945,
  });

  const [recentUsers] = useState([
    {
      id: 1,
      name: "Nguyễn Văn An",
      email: "an.nguyen@email.com",
      role: "Học sinh",
      status: "active",
      joinDate: "10/06/2025",
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      email: "binh.tran@email.com",
      role: "Giáo viên",
      status: "active",
      joinDate: "09/06/2025",
    },
    {
      id: 3,
      name: "Lê Minh Châu",
      email: "chau.le@email.com",
      role: "Học sinh",
      status: "pending",
      joinDate: "09/06/2025",
    },
    {
      id: 4,
      name: "Phạm Thị Dung",
      email: "dung.pham@email.com",
      role: "Học sinh",
      status: "inactive",
      joinDate: "08/06/2025",
    },
  ]);

  const [activities] = useState([
    {
      id: 1,
      type: "question",
      title: "Câu hỏi mới được thêm",
      desc: "50 câu hỏi Vật lý 12 - Chương Điện học",
      time: "2 phút trước",
    },
    {
      id: 2,
      type: "user",
      title: "Người dùng mới đăng ký",
      desc: "15 học sinh mới từ THPT Nguyễn Huệ",
      time: "15 phút trước",
    },
    {
      id: 3,
      type: "exam",
      title: "Đề thi được tạo",
      desc: "123 đề thi được tạo tự động trong 1 giờ qua",
      time: "1 giờ trước",
    },
    {
      id: 4,
      type: "warning",
      title: "Cảnh báo hệ thống",
      desc: "API AI đã đạt 85% giới hạn quota hôm nay",
      time: "3 giờ trước",
    },
  ]);

  const chartData = [
    { name: 'T1', users: 400, questions: 2400, exams: 240 },
    { name: 'T2', users: 300, questions: 1398, exams: 221 },
    { name: 'T3', users: 200, questions: 9800, exams: 229 },
    { name: 'T4', users: 278, questions: 3908, exams: 200 },
    { name: 'T5', users: 189, questions: 4800, exams: 218 },
    { name: 'T6', users: 239, questions: 3800, exams: 250 },
    { name: 'T7', users: 349, questions: 4300, exams: 210 },
  ];

  // Fetch dashboard data from API
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sử dụng analyticsService cho dashboard data
      const data = await analyticsService.getDashboard();
      setDashboardData(data);
      
      // Cập nhật stats với dữ liệu thực từ API
      if (data) {
        setStats(prev => ({
          ...prev,
          totalUsers: data.totalUsers || prev.totalUsers,
          totalQuestions: data.totalQuestions || prev.totalQuestions,
          totalExams: data.totalExams || prev.totalExams,
          todayVisits: data.totalAttempts || data.todayVisits || prev.todayVisits,
        }));
      }
      
      console.log('Dashboard data:', data);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(analyticsService.formatError(err));
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        todayVisits: prev.todayVisits + Math.floor(Math.random() * 5),
        totalExams: prev.totalExams + Math.floor(Math.random() * 3),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'failed': return 'red';
      default: return 'default';
    }
  };

  const formatScore = (score, maxScore) => {
    const percentage = maxScore > 0 ? (score / maxScore * 100).toFixed(1) : 0;
    return `${score}/${maxScore} (${percentage}%)`;
  };

  // Recent attempts table columns
  const recentAttemptsColumns = [
    {
      title: 'Học sinh',
      dataIndex: 'userName',
      key: 'userName',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Đề thi',
      dataIndex: 'examName',
      key: 'examName',
      ellipsis: true
    },
    {
      title: 'Điểm số',
      key: 'score',
      render: (_, record) => formatScore(record.score, record.maxScore)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'completed' ? 'Hoàn thành' : 
           status === 'in_progress' ? 'Đang làm' : 
           status === 'failed' ? 'Thất bại' : status}
        </Tag>
      )
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('vi-VN')
    }
  ];

  if (loading) {
    return (
      <div className="admin-dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard" style={{ padding: '20px' }}>
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          action={
            <button onClick={fetchDashboardData} className="ant-btn ant-btn-primary">
              Thử lại
            </button>
          }
        />
      </div>
    );
  }

  const renderDashboardContent = () => (
    <>
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card 
            title="📊 Lượt thi gần đây" 
            extra={
              <button onClick={fetchDashboardData} className="ant-btn ant-btn-link">
                Làm mới
              </button>
            }
          >
            <SafeTable
              columns={recentAttemptsColumns}
              dataSource={dashboardData?.recentAttempts || []}
              rowKey="attemptId"
              pagination={{ pageSize: 10 }}
              size="small"
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>
      {/* Content Grid - Users and Activities */}
      <div className="content-grid">
        <div className="content-section">
          <h2 className="section-title">👥 Người dùng mới nhất</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tham gia</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="user-name">{user.name}</td>
                    <td className="user-email">{user.email}</td>
                    <td>{user.role}</td>
                    {/* <td>{getStatusBadge(user.status)}</td> */}
                    <td>{user.joinDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">⭐ Hoạt động gần đây</h2>
          <div className="activity-feed">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div
                  className={`activity-icon activity-icon--${activity.type}`}
                >
                  {/* {getActivityIcon(activity.type)} */}
                </div>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-desc">{activity.desc}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="quick-actions">
            <button 
              className="action-btn" 
              onClick={() => handleQuickAction("addUser")}
            >
              <span className="action-icon">➕</span>
              Thêm người dùng
            </button>
            <button 
              className="action-btn"
              onClick={() => handleQuickAction("createExam")}
            >
              <span className="action-icon">📝</span>
              Tạo đề thi mẫu
            </button>
            <button 
              className="action-btn"
              onClick={() => handleQuickAction("importQuestions")}
            >
              <span className="action-icon">📥</span>
              Import câu hỏi
            </button>
            <button 
              className="action-btn"
              onClick={() => handleQuickAction("viewReport")}
            >
              <span className="action-icon">📊</span>
              Xem báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section - Full Width */}
      <div className="charts-section">
        <h2 className="section-title">📊 Thống kê nhanh</h2>
        <div className="charts-container">
          <div className="chart-wrapper">
            <h3 className="chart-title">Thống kê theo cột</h3>
            <BarChart 
              width={window.innerWidth > 1200 ? 800 : window.innerWidth - 200} 
              height={300} 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#8884d8" name="Người dùng" />
              <Bar dataKey="questions" fill="#82ca9d" name="Câu hỏi" />
              <Bar dataKey="exams" fill="#ffc658" name="Đề thi" />
            </BarChart>
          </div>
          
          <div className="chart-wrapper">
            <h3 className="chart-title">Xu hướng theo thời gian</h3>
            <LineChart 
              width={window.innerWidth > 1200 ? 800 : window.innerWidth - 200} 
              height={300} 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#8884d8" name="Người dùng" strokeWidth={2} />
              <Line type="monotone" dataKey="questions" stroke="#82ca9d" name="Câu hỏi" strokeWidth={2} />
              <Line type="monotone" dataKey="exams" stroke="#ffc658" name="Đề thi" strokeWidth={2} />
            </LineChart>
          </div>
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>
          PhyGen Admin Dashboard v2.1 | © 2025 Physics Exam Generator System
        </p>
        <p>Cập nhật lần cuối: {new Date().toLocaleString()}</p>
      </footer>
    </>
  );

  return (
    <div className="admin-dashboard">
      <div className="dashboard-content">
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;