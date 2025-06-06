import React, { useState } from "react";
import LayoutContent from "../../components/layoutContent";
import { FaChalkboardTeacher, FaSearch, FaClock, FaEye, FaRedo, FaShare, FaFilter, FaTrophy, FaCalendarAlt, FaBookOpen, FaChevronDown } from "react-icons/fa";
import "./index.scss";

const stats = [
  { value: 47, label: "Bài đã làm", icon: FaBookOpen },
  { value: 7.8, label: "Điểm trung bình", icon: FaTrophy },
  { value: 23, label: "Đề thi mẫu", icon: FaChalkboardTeacher },
  { value: "18h", label: "Thời gian học", icon: FaClock },
];

const historyList = [
  {
    id: 1,
    score: 9.5,
    total: 10,
    subject: "Vật lý - Lớp 10",
    correct: 39,
    totalQuestions: 40,
    time: "15 phút",
    date: "Hôm nay, 18:30",
    difficulty: "Trung bình",
    accuracy: 97.5
  },
  {
    id: 2,
    score: 9.0,
    total: 10,
    subject: "Toán học - Lớp 10",
    correct: 36,
    totalQuestions: 40,
    time: "20 phút",
    date: "Hôm qua, 14:20",
    difficulty: "Khó",
    accuracy: 90
  },
  {
    id: 3,
    score: 8.5,
    total: 10,
    subject: "Hóa học - Lớp 10",
    correct: 34,
    totalQuestions: 40,
    time: "18 phút",
    date: "2 ngày trước, 16:45",
    difficulty: "Dễ",
    accuracy: 85
  }
];

const classes = ["Lớp", "10", "11", "12"];
const timeFilters = ["Tất cả thời gian", "Hôm nay", "Tuần này", "Tháng này"];

const HistoryContent = () => {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("Tất cả môn học");
  const [timeFilter, setTimeFilter] = useState("Tất cả thời gian");

  const filteredHistory = historyList.filter(item => {
    const matchesSearch = item.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === "Tất cả môn học" || item.subject.includes(subjectFilter);
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="history">
      {/* Header */}
      <div className="history-header">
        <h1 className="title">Lịch Sử Bài Làm</h1>
        <p className="subtitle">Theo dõi tiến trình học tập của bạn</p>
      </div>

      {/* Stats */}
      <div className="stats">
        {stats.map((stat, idx) => {
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
              {classes.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <FaChevronDown className="select-arrow" />
          </div>

          <div className="filter-select">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              {timeFilters.map(filter => (
                <option key={filter} value={filter}>{filter}</option>
              ))}
            </select>
            <FaChevronDown className="select-arrow" />
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="list">
        {filteredHistory.map(item => (
          <div className="item" key={item.id}>
            <div className="item-header">
              <div className="item-left">
                <div className={`score score-${item.score >= 9 ? 'excellent' : item.score >= 7 ? 'good' : 'average'}`}>
                  {item.score}/10
                </div>
                <div className="item-info">
                  <h3 className="subject">{item.subject}</h3>
                  <div className="item-badges">
                    <span className={`difficulty difficulty-${item.difficulty === 'Dễ' ? 'easy' : item.difficulty === 'Trung bình' ? 'medium' : 'hard'}`}>
                      {item.difficulty}
                    </span>
                    <span className="accuracy">{item.accuracy}% độ chính xác</span>
                  </div>
                </div>
              </div>
              
              <div className="item-right">
                <div className="correct">{item.correct}/{item.totalQuestions} câu đúng</div>
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
                <span>{item.accuracy}%</span>
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
              <button className="btn btn-view">
                <FaEye />
                <span>Xem lại</span>
              </button>
              <button className="btn btn-retry">
                <FaRedo />
                <span>Làm lại</span>
              </button>
              <button className="btn btn-share">
                <FaShare />
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const History = () => (
  <LayoutContent layoutType={1} content1={<HistoryContent />} />
);

export default History;