/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Spin, Alert, Card, Row, Col, Tag } from 'antd';
import AdminSidebar from "../../../components/Sidebar";
import {analyticsService } from "../../../services";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 2847,
    totalQuestions: 15672,
    totalExams: 4231,
    todayVisits: 8945,
  });

  const [recentUsers, setRecentUsers] = useState([]);

  const [activities, setActivities] = useState([]);

  const [chartData, setChartData] = useState([]);

  // Fetch dashboard data from API
  // Initialize dashboard - load from localStorage first, then API
  useEffect(() => {
    console.log('📊 Dashboard initializing...');
    
    // Load cached data from localStorage
    const cachedData = localStorage.getItem('dashboard-data');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setStats(parsed.stats || stats);
        setRecentUsers(parsed.recentUsers || []);
        setActivities(parsed.activities || []);
        setChartData(parsed.chartData || []);
        setLastUpdated(new Date(parsed.lastUpdated));
        console.log('📦 Loaded cached dashboard data');
      } catch (error) {
        console.warn('Error parsing cached dashboard data:', error);
      }
    }
    
    // Then fetch fresh data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Parallel fetch all data
      const [dashboardResponse, usersResponse, activitiesResponse, chartResponse] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getRecentUsers(10),
        analyticsService.getRecentActivities(5),
        analyticsService.getChartData('7days')
      ]);
      
      // Update dashboard data
      if (dashboardResponse?.success && dashboardResponse.data) {
        const data = dashboardResponse.data;
        setDashboardData(data);
        
        // Update stats with real data from API
        setStats(prev => ({
          ...prev,
          totalUsers: data.totalUsers || prev.totalUsers,
          totalQuestions: data.totalQuestions || prev.totalQuestions,
          totalExams: data.totalExams || prev.totalExams,
          todayVisits: data.totalAttempts || data.todayVisits || prev.todayVisits,
        }));
      } else {
        // Fallback for case without success field
        setDashboardData(dashboardResponse);
        if (dashboardResponse) {
          setStats(prev => ({
            ...prev,
            totalUsers: dashboardResponse.totalUsers || prev.totalUsers,
            totalQuestions: dashboardResponse.totalQuestions || prev.totalQuestions,
            totalExams: dashboardResponse.totalExams || prev.totalExams,
            todayVisits: dashboardResponse.totalAttempts || dashboardResponse.todayVisits || prev.todayVisits,
          }));
        }
      }
      
      // Update recent users
      if (usersResponse?.items) {
        const formattedUsers = usersResponse.items.map(user => ({
          id: user.id,
          name: user.fullName || user.username,
          email: user.email,
          role: user.role === 'student' ? 'Học sinh' : 
                user.role === 'teacher' ? 'Giáo viên' : 
                user.role === 'admin' ? 'Admin' : user.role,
          status: user.isActive ? 'active' : 'inactive',
          joinDate: new Date(user.createdAt).toLocaleDateString('vi-VN')
        }));
        setRecentUsers(formattedUsers);
      }
      
      // Update activities
      if (activitiesResponse && Array.isArray(activitiesResponse)) {
        const formattedActivities = activitiesResponse.map(activity => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          desc: activity.description,
          time: formatTimeAgo(activity.createdAt)
        }));
        setActivities(formattedActivities);
      }
      
      // Update chart data
      if (chartResponse && Array.isArray(chartResponse)) {
        setChartData(chartResponse);
      }
      
      console.log('Dashboard data loaded:', {
        dashboard: dashboardResponse,
        users: usersResponse,
        activities: activitiesResponse,
        chart: chartResponse
      });

      // Update last updated timestamp
      const now = new Date();
      setLastUpdated(now);

      // Cache data to localStorage after state updates
      const cacheData = {
        stats: dashboardResponse ? {
          totalUsers: dashboardResponse.totalUsers || stats.totalUsers,
          totalQuestions: dashboardResponse.totalQuestions || stats.totalQuestions,
          totalExams: dashboardResponse.totalExams || stats.totalExams,
          todayVisits: dashboardResponse.totalAttempts || dashboardResponse.todayVisits || stats.todayVisits,
        } : stats,
        recentUsers: usersResponse?.items ? usersResponse.items.map(user => ({
          id: user.id,
          name: user.fullName || user.username,
          email: user.email,
          role: user.role === 'student' ? 'Học sinh' : 
                user.role === 'teacher' ? 'Giáo viên' : 
                user.role === 'admin' ? 'Admin' : user.role,
          status: user.isActive ? 'active' : 'inactive',
          joinDate: new Date(user.createdAt).toLocaleDateString('vi-VN')
        })) : [],
        activities: activitiesResponse && Array.isArray(activitiesResponse) ? activitiesResponse.map(activity => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          desc: activity.description,
          time: formatTimeAgo(activity.createdAt)
        })) : [],
        chartData: chartResponse && Array.isArray(chartResponse) ? chartResponse : [],
        lastUpdated: now.toISOString()
      };
      cacheDashboardData(cacheData);

      // Show success toast only for manual refresh
      if (!loading) {
        toast.success('Dữ liệu dashboard đã được cập nhật!');
      }
          } catch (err) {
        console.error('Dashboard error:', err);
        setError(analyticsService.formatError(err));
        toast.error('Không thể tải dữ liệu dashboard');
        
        // Clear cache on error
        localStorage.removeItem('dashboard-data');
        
        // Set mock data in case of error
        setRecentUsers([
          {
            id: 1,
            name: "Demo User",
            email: "demo@example.com",
            role: "Học sinh",
            status: "active",
            joinDate: new Date().toLocaleDateString('vi-VN')
          }
        ]);
        setActivities([
          {
            id: 1,
            type: "question",
            title: "Demo Activity",
            desc: "Hoạt động mẫu khi không có dữ liệu từ API",
            time: "Vừa xong"
          }
        ]);
      } finally {
        setLoading(false);
      }
  };

  // Format time ago helper
  const formatTimeAgo = (date) => {
    const now = new Date();
    const time = new Date(date);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  // Cache dashboard data to localStorage
  const cacheDashboardData = (dataToCache) => {
    try {
      localStorage.setItem('dashboard-data', JSON.stringify(dataToCache));
      console.log('💾 Cached dashboard data to localStorage');
    } catch (error) {
      console.warn('Error caching dashboard data:', error);
    }
  };

  // Auto refresh dashboard data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !error) {
        console.log('🔄 Auto-refreshing dashboard data...');
        fetchDashboardData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loading, error]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'addUser':
        toast.success('Chuyển hướng tới trang quản lý người dùng...');
        navigate('/admin/users');
        break;
      case 'createExam':
        toast.success('Chuyển hướng tới trang tạo đề thi...');
        navigate('/admin/exams');
        break;
      case 'importQuestions':
        toast.success('Chuyển hướng tới trang quản lý câu hỏi...');
        navigate('/admin/questions');
        break;
      case 'viewReport':
        toast.success('Chuyển hướng tới trang báo cáo...');
        navigate('/admin/reports');
        break;
      default:
        toast.info('Tính năng đang được phát triển...');
    }
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'question':
      case 'question_created':
        return '❓';
      case 'exam':
      case 'exam_created':
        return '📝';
      case 'user':
      case 'user_created':
        return '👤';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '🔔';
    }
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
           status === 'failed' ? 'Thất bại' : status}x
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

  if (loading && !dashboardData) {
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
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Tổng người dùng</div>
            <div className="stat-icon stat-icon--blue">👥</div>
          </div>
          <div className="stat-number">
            {loading ? '...' : stats.totalUsers.toLocaleString()}
          </div>
          <div className="stat-change positive">
            <span>↗</span> +12% so với tháng trước
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Tổng câu hỏi</div>
            <div className="stat-icon stat-icon--green">❓</div>
          </div>
          <div className="stat-number">
            {loading ? '...' : stats.totalQuestions.toLocaleString()}
          </div>
          <div className="stat-change positive">
            <span>↗</span> +8% so với tháng trước
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Tổng đề thi</div>
            <div className="stat-icon stat-icon--yellow">📝</div>
          </div>
          <div className="stat-number">
            {loading ? '...' : stats.totalExams.toLocaleString()}
          </div>
          <div className="stat-change positive">
            <span>↗</span> +15% so với tháng trước
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Lượt truy cập hôm nay</div>
            <div className="stat-icon stat-icon--purple">👁️</div>
          </div>
          <div className="stat-number">
            {loading ? '...' : stats.todayVisits.toLocaleString()}
          </div>
          <div className="stat-change positive">
            <span>↗</span> +5% so với hôm qua
          </div>
        </div>
      </div>
      {/* <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
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
      </Row> */}
      {/* Content Grid - Users and Activities */}
      <div className="content-grid">
        <div className="content-section">
          <div className="section-header">
          <h2 className="section-title">👥 Người dùng mới nhất</h2>
          <div className="action-buttons">
            <button 
              onClick={fetchDashboardData} 
              className="refresh-btn"
              disabled={loading}
            >
              {loading ? '⏳ Đang tải...' : '🔄 Làm mới'}
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('dashboard-data');
                toast.success('Đã xóa cache dashboard');
                fetchDashboardData();
              }}
              className="clear-cache-btn"
              disabled={loading}
            >
              🗑️ Xóa cache
            </button>
          </div>
        </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  {/* <th>Trạng thái</th> */}
                  {/* <th>Ngày tham gia</th> */}
                </tr>
              </thead>
              <tbody>
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="user-name">{user.name}</td>
                      <td className="user-email">{user.email}</td>
                      <td>{user.role}</td>
                      {/* <td>
                        <span className={`status-badge status-${user.status}`}>
                          {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td> */}
                      {/* <td>{user.joinDate}</td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      {loading ? (
                        <div className="loading-skeleton">
                          <div className="skeleton-line"></div>
                          <div className="skeleton-line"></div>
                          <div className="skeleton-line"></div>
                        </div>
                      ) : (
                        'Không có dữ liệu người dùng'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="content-section">
          <h2 className="section-title">⭐ Hoạt động gần đây</h2>
          <div className="activity-feed">
            {activities.length > 0 ? (
              activities.map((activity) => (
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
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                {loading ? 'Đang tải hoạt động...' : 'Không có hoạt động gần đây'}
              </div>
            )}
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
          {chartData.length > 0 ? (
            <>
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
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
              <h3>Không có dữ liệu biểu đồ</h3>
              <p>{loading ? 'Đang tải dữ liệu...' : 'Dữ liệu biểu đồ sẽ xuất hiện sau khi có hoạt động trong hệ thống'}</p>
            </div>
          )}
        </div>
      </div>

      <footer className="dashboard-footer">
        <p>
          PhyGen Admin Dashboard v2.1 | © 2025 Physics Exam Generator System
        </p>
        <p>Cập nhật lần cuối: {lastUpdated ? lastUpdated.toLocaleString('vi-VN') : 'Chưa có'}</p>
        <p>
          <span className={`connection-status ${error ? 'offline' : 'online'}`}>
            {error ? '🔴 Offline' : '🟢 Online'}
          </span>
          {' | '}
          <span>Auto refresh: {error ? 'Tạm dừng' : 'Mỗi 30 giây'}</span>
        </p>
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