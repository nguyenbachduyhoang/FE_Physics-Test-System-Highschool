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
import { examService } from "../../services";
import "./index.scss";

const stats = [
  { value: 47, label: "Bài đã làm", icon: FaBookOpen },
  { value: 7.8, label: "Điểm trung bình", icon: FaTrophy },
  { value: 23, label: "Đề thi mẫu", icon: FaChalkboardTeacher },
  { value: "18h", label: "Thời gian học", icon: FaClock },
];

const classes = ["Lớp", "10", "11", "12"];
const timeFilters = ["Tất cả thời gian", "Hôm nay", "Tuần này", "Tháng này"];

const HistoryContent = () => {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("Tất cả môn học");
  const [timeFilter, setTimeFilter] = useState("Tất cả thời gian");
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await examService.getMyExamHistory();
        setHistoryList(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = historyList.filter((item) => {
    const matchesSearch = item.subject
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesSubject =
      subjectFilter === "Tất cả môn học" ||
      item.subject.includes(subjectFilter);
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
        {filteredHistory.map((item) => (
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
