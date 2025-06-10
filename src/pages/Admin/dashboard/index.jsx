/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "./index.scss";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import AdminSidebar from "../../../components/Sidebar";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const handleQuickAction = (action) => {
    console.log(`Quick action: ${action}`);
    // Implement quick actions here
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: "Hoạt động", class: "status-active" },
      inactive: { text: "Không hoạt động", class: "status-inactive" },
      pending: { text: "Chờ xác thực", class: "status-pending" },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`status-badge ${config.class}`}>{config.text}</span>
    );
  };

  const getActivityIcon = (type) => {
    const icons = {
      question: "❓",
      user: "👤",
      exam: "📝",
      warning: "⚠️",
    };
    return icons[type] || "📋";
  };

  const renderDashboardContent = () => (
    <>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Tổng số người dùng</div>
            <div className="stat-icon stat-icon--blue">👥</div>
          </div>
          <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
          <div className="stat-change positive">
            ↗ +12.5% so với tháng trước
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Câu hỏi trong hệ thống</div>
            <div className="stat-icon stat-icon--green">❓</div>
          </div>
          <div className="stat-number">
            {stats.totalQuestions.toLocaleString()}
          </div>
          <div className="stat-change positive">↗ +8.2% tuần này</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Đề thi đã tạo</div>
            <div className="stat-icon stat-icon--yellow">📝</div>
          </div>
          <div className="stat-number">{stats.totalExams.toLocaleString()}</div>
          <div className="stat-change positive">↗ +15.3% hôm nay</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Lượt truy cập hôm nay</div>
            <div className="stat-icon stat-icon--purple">📈</div>
          </div>
          <div className="stat-number">
            {stats.todayVisits.toLocaleString()}
          </div>
          <div className="stat-change negative">↘ -2.1% so với hôm qua</div>
        </div>
      </div>

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
                    <td>{getStatusBadge(user.status)}</td>
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
                  {getActivityIcon(activity.type)}
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
      <div className="admin-dashboard-content">
        {renderDashboardContent()}
      </div>
  );
};

export default AdminDashboard;