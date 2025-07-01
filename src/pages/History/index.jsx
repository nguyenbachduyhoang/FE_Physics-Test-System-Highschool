import React, { useState, useEffect } from "react";
import LayoutContent from "../../components/layoutContent";
import {
  FaChalkboardTeacher,
  FaSearch,
  FaClock,
  FaEye,
  FaRedo,
  FaShare,
  FaFilter,
  FaTrophy,
  FaCalendarAlt,
  FaBookOpen,
  FaChevronDown,
} from "react-icons/fa";
import { examService } from "../../services/examService";
import { authService } from "../../services/authService";
import { Spin, Alert, Empty } from "antd";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./index.scss";

const classes = ["Vật lý"];
const timeFilters = ["Tất cả thời gian", "Hôm nay", "Tuần này", "Tháng này"];

// Parse ngày từ format "HH:mm dd/MM/yyyy"
const parseVietnameseDate = (dateString) => {
  try {
    const [time, date] = dateString.split(' ');
    const [day, month, year] = date.split('/');
    const [hour, minute] = time.split(':');
    return new Date(year, month - 1, day, hour, minute);
  } catch {
    return null;
  }
};

// Hàm lọc theo thời gian
const filterByTime = (item, timeFilter) => {
  if (timeFilter === "Tất cả thời gian") return true;
  
  const now = new Date();
  const itemDate = parseVietnameseDate(item.date);
  
  if (!itemDate) return true; // Nếu không parse được thì hiển thị
  
  switch (timeFilter) {
    case "Hôm nay":
      return itemDate.toDateString() === now.toDateString();
    case "Tuần này": {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return itemDate >= weekAgo;
    }
    case "Tháng này":
      return itemDate.getMonth() === now.getMonth() && 
             itemDate.getFullYear() === now.getFullYear();
    default:
      return true;
  }
};

const HistoryContent = () => {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("Tất cả môn học");
  const [timeFilter, setTimeFilter] = useState("Tất cả thời gian");
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    totalTime: 0,
    completedExams: 0,
    accuracy: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Kiểm tra authentication trước khi fetch data
        if (!authService.isAuthenticated()) {
          toast.error('Vui lòng đăng nhập để xem lịch sử');
          navigate('/login');
          return;
        }

        setLoading(true);
        const historyData = await examService.getMyExamHistory();
        
        if (Array.isArray(historyData) && historyData.length > 0) {
          setHistoryList(historyData);
          
          // Tính toán thống kê
          const totalExams = historyData.length;
          const completedExams = historyData.filter(item => item.time !== "Đang làm bài").length;
          const averageScore = totalExams > 0 
            ? (historyData.reduce((sum, item) => sum + parseFloat(item.score), 0) / totalExams).toFixed(1)
            : 0;
          
          // Tính tổng thời gian (convert từ string "X phút" sang số)
          const totalMinutes = historyData.reduce((sum, item) => {
            if (item.time && item.time.includes('phút')) {
              const minutes = parseInt(item.time.match(/\d+/)?.[0] || '0');
              return sum + minutes;
            }
            return sum;
          }, 0);
          
          const totalHours = Math.floor(totalMinutes / 60);
          const remainingMinutes = totalMinutes % 60;
          const totalTimeString = totalHours > 0 
            ? `${totalHours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`
            : `${totalMinutes}m`;

          const accuracy = historyData.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / totalExams;

          setStats({
            totalExams,
            averageScore: parseFloat(averageScore),
            totalTime: totalTimeString,
            completedExams,
            accuracy: accuracy.toFixed(1)
          });

          console.log('✅ History loaded successfully:', {
            totalExams,
            averageScore,
            totalTime: totalTimeString,
            completedExams
          });
        } else {
          console.log('ℹ️ No history data found');
          setHistoryList([]);
          setStats({
            totalExams: 0,
            averageScore: 0,
            totalTime: "0h",
            completedExams: 0,
            accuracy: 0
          });
          toast.info('Bạn chưa có lịch sử làm bài nào');
        }
      } catch (error) {
        console.error('Error:', error);
        if (error.response?.status === 401) {
          toast.error('Vui lòng đăng nhập lại để xem lịch sử');
          navigate('/login');
        } else {
          toast.error('Có lỗi xảy ra khi tải lịch sử làm bài');
        }
        setHistoryList([]);
        setStats({
          totalExams: 0,
          averageScore: 0,
          totalTime: "0h",
          completedExams: 0,
          accuracy: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  // Lọc dữ liệu dựa trên search và filter
  const filteredHistory = historyList.filter((item) => {
    const matchesSearch = item.subject
      .toLowerCase()
      .includes(search.toLowerCase());
    
    const matchesSubject =
      subjectFilter === "Tất cả môn học" ||
      item.subject.toLowerCase().includes(subjectFilter.toLowerCase());
    
    const matchesTime = filterByTime(item, timeFilter);
    
    return matchesSearch && matchesSubject && matchesTime;
  });

  // Xử lý xem lại bài thi
  const handleViewResult = (item) => {
    console.log('👁️ Viewing result for:', item);
    // Navigate to result page with attempt ID
    if (item.id) {
      navigate(`/result/${item.id}`);
    } else {
      toast.error('Không thể xem kết quả bài thi này');
    }
  };

  // Xử lý làm lại bài thi
  const handleRetakeExam = (item) => {
    console.log('🔄 Retaking exam:', item);
    // Logic để làm lại bài thi - cần exam ID
    // navigate(`/quiz/${examId}`);
    toast.info('Tính năng làm lại bài thi sẽ được cập nhật sớm');
  };

  // Xử lý chia sẻ
  const handleShareResult = (item) => {
    console.log('📤 Sharing result:', item);
    // Logic chia sẻ kết quả
    if (navigator.share) {
      navigator.share({
        title: `Kết quả bài thi: ${item.subject}`,
        text: `Tôi đã đạt ${item.score}/${item.total} điểm trong bài thi ${item.subject}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Kết quả bài thi: ${item.subject} - Điểm: ${item.score}/${item.total} - Độ chính xác: ${item.accuracy.toFixed(1)}%`
      );
      toast.success('Đã sao chép kết quả vào clipboard');
    }
  };

  // Stats configuration với dữ liệu thực
  const statsConfig = [
    { value: stats.totalExams, label: "Bài đã làm", icon: FaBookOpen },
    { value: stats.averageScore, label: "Điểm trung bình", icon: FaTrophy },
    { value: stats.completedExams, label: "Bài hoàn thành", icon: FaChalkboardTeacher },
    { value: stats.totalTime, label: "Thời gian học", icon: FaClock },
  ];

  if (loading) {
    return (
      <div className="history">
        <div className="history-header">
          <h1 className="title">Lịch Sử Bài Làm</h1>
          <p className="subtitle">Theo dõi tiến trình học tập của bạn</p>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Spin size="large" />
          <p style={{ color: '#666', fontSize: '16px' }}>Đang tải lịch sử bài làm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history">
      {/* Header */}
      <div className="history-header">
        <h1 className="title">Lịch Sử Bài Làm</h1>
        <p className="subtitle">Theo dõi tiến trình học tập của bạn</p>
      </div>

      {/* Stats */}
      <div className="stats">
        {statsConfig.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div key={idx} className="stat-card">
              <div className="stat-icon">
                <IconComponent />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bài làm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <div className="filter-select">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              {classes.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <FaChevronDown className="select-arrow" />
          </div>

          <div className="filter-select">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              {timeFilters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
            <FaChevronDown className="select-arrow" />
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="list">
        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            {historyList.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: '#666', fontSize: '16px' }}>
                    Bạn chưa làm bài thi nào. <br />
                    Hãy bắt đầu với các đề thi mẫu!
                  </span>
                }
              >
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/thiMau')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Xem đề thi mẫu
                </button>
              </Empty>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: '#666', fontSize: '16px' }}>
                    Không tìm thấy bài thi nào phù hợp với bộ lọc của bạn
                  </span>
                }
              />
            )}
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div className="item" key={item.id}>
              <div className="item-header">
                <div className="item-left">
                  <div
                    className={`score score-${
                      item.score >= 9
                        ? "excellent"
                        : item.score >= 7
                        ? "good"
                        : "average"
                    }`}
                  >
                    {item.score}/{item.total}
                  </div>
                  <div className="item-info">
                    <h3 className="subject">{item.subject}</h3>
                    <div className="item-badges">
                      <span
                        className={`difficulty difficulty-${
                          item.difficulty === "Dễ"
                            ? "easy"
                            : item.difficulty === "Trung bình"
                            ? "medium"
                            : "hard"
                        }`}
                      >
                        {item.difficulty}
                      </span>
                      <span className="accuracy">
                        {item.accuracy.toFixed(1)}% độ chính xác
                      </span>
                    </div>
                  </div>
                </div>

                <div className="item-right">
                  <div className="correct">
                    {item.correct}/{item.totalQuestions} câu đúng
                  </div>
                  <div className="date">
                    <FaCalendarAlt />
                    {item.date}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-header">
                  <span>Tiến độ hoàn thành</span>
                  <span>{item.accuracy.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.accuracy}%` }}
                  ></div>
                </div>
              </div>

              {/* Meta Info */}
              <div className="item-meta">
                <div className="time">
                  <FaClock />
                  <span>{item.time}</span>
                </div>
                <div className="score-info">
                  <FaTrophy />
                  <span>Điểm: {item.score}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="actions">
                <button 
                  className="btn btn-view"
                  onClick={() => handleViewResult(item)}
                >
                  <FaEye />
                  <span>Xem lại</span>
                </button>
                <button 
                  className="btn btn-retry"
                  onClick={() => handleRetakeExam(item)}
                >
                  <FaRedo />
                  <span>Làm lại</span>
                </button>
                <button 
                  className="btn btn-share"
                  onClick={() => handleShareResult(item)}
                >
                  <FaShare />
                  <span>Chia sẻ</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const History = () => (
  <LayoutContent layoutType={1} content1={<HistoryContent />} />
);

export default History;
