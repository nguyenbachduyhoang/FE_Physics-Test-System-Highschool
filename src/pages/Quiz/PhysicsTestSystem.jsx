import React, { useState, useEffect } from 'react';
import { Clock, Home, FileText, HelpCircle, BarChart3, Search } from 'lucide-react';
import './PhysicsTestSystem.css';

const PhysicsTestSystem = () => {
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const QUESTIONS_PER_PAGE = 10;

  // API URL - replace with your actual endpoint
  const API_URL = 'https://684276aee1347494c31cddbd.mockapi.io/question';

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        setQuestions(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Pagination logic
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentPageQuestions = questions.slice(startIndex, endIndex);
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of content when changing pages
      const contentArea = document.querySelector('.content-scrollable');
      if (contentArea) {
        contentArea.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };
  
  const isLastPage = currentPage === totalPages;

  const getQuestionStatus = (questionNum) => {
    if (selectedAnswers[questionNum]) return 'answered';
    return 'unanswered';
  };

  const getQuestionButtonClass = (questionNum) => {
    const status = getQuestionStatus(questionNum);
    const isInCurrentPage = questionNum >= startIndex + 1 && questionNum <= endIndex;
    let className = `question-btn question-btn--${status}`;
    if (!isInCurrentPage) {
      className += ' question-btn--hidden';
    }
    return className;
  };

  // Format API data to match component structure
  const formatQuestionData = (apiQuestion, index) => {
    return {
      id: parseInt(apiQuestion.id),
      text: `Câu ${index + 1}: ${apiQuestion.question}`,
      subtitle: "Chọn đáp án đúng:",
      options: [
        apiQuestion.answerA,
        apiQuestion.answerB,
        apiQuestion.answerC,
        apiQuestion.answerD
      ],
      correctAnswer: apiQuestion.correctAnswer
    };
  };

  const handleSubmit = () => {
    // Handle test submission
    const answeredCount = Object.keys(selectedAnswers).length;
    const totalQuestions = questions.length;
    
    if (answeredCount < totalQuestions) {
      const confirm = window.confirm(
        `Bạn đã trả lời ${answeredCount}/${totalQuestions} câu hỏi. Bạn có chắc chắn muốn nộp bài không?`
      );
      if (!confirm) return;
    }
    
    alert('Bài thi đã được nộp thành công!');
    // Here you can add logic to submit answers to your API
  };

  const scrollToQuestion = (questionNum) => {
    const questionElement = document.getElementById(`question-${questionNum}`);
    if (questionElement) {
      questionElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest' 
      });
    }
  };

  return (
    <div className="physics-test-system">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <div className="logo-circle">
                <div className="logo-inner"></div>
              </div>
            </div>
            <h1 className="header-title">Physics Test System</h1>
          </div>
          
          <div className="header-nav">
            <div className="nav-item">
              <Home size={16} />
              <span>Trang chủ</span>
            </div>
            <div className="nav-item">
              <FileText size={16} />
              <span>Tạo đề thi</span>
            </div>
            <div className="nav-item">
              <HelpCircle size={16} />
              <span>Ngân hàng câu hỏi</span>
            </div>
            <div className="nav-item">
              <BarChart3 size={16} />
              <span>Lịch sử</span>
            </div>
            <div className="nav-item">
              <Search size={16} />
              <span>Tìm kiếm</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-container">
        {/* Left Sidebar */}
        <div className="sidebar">
          {/* Timer */}
          <div className="timer-card">
            <h3 className="timer-title">Thời gian còn lại</h3>
            <div className={`timer-display ${timeLeft < 300 ? 'timer-warning' : ''}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="timer-label">Số câu đã làm</div>
            <div className="timer-count">
              {Object.keys(selectedAnswers).length}/{questions.length || 0}
            </div>
          </div>

          {/* Question Grid */}
          <div className="question-grid-container">
            <h3 className="question-grid-title">Danh sách câu hỏi</h3>
            <div className="question-grid">
              {Array.from({ length: QUESTIONS_PER_PAGE }, (_, i) => {
                const questionNum = startIndex + i + 1;
                if (questionNum > questions.length) return null;
                return (
                  <button
                    key={questionNum}
                    onClick={() => scrollToQuestion(questionNum)}
                    className={getQuestionButtonClass(questionNum)}
                    disabled={loading}
                  >
                    {questionNum}
                  </button>
                );
              })}
            </div>

            {/* Pagination Info */}
            <div className="pagination-info">
              <span className="page-indicator">
                Trang {currentPage} / {totalPages}
              </span>
              <span className="question-range">
                Câu {startIndex + 1} - {Math.min(endIndex, questions.length)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="legend">
            <h3 className="legend-title">Chú thích</h3>
            <div className="legend-item">
              <div className="legend-color legend-color--answered"></div>
              <span>Câu đã làm</span>
            </div>
            <div className="legend-item">
              <div className="legend-color legend-color--unanswered"></div>
              <span>Câu chưa làm</span>
            </div>
            <div className="legend-item">
              <div className="legend-color legend-color--review"></div>
              <span>Câu cần kiểm tra lại</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="content">
          <div className="content-header">
            <h2
              className="content-title"
              style={{ color: '#2DD4BF', textAlign: 'center' }}
            >
              Đề Thi Vật Lý Lớp 12 - Học Kỳ I
            </h2>
          </div>

          <div className="content-scrollable">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải câu hỏi...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p className="error-message">Lỗi: {error}</p>
                <button 
                  className="retry-btn"
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </button>
              </div>
            ) : currentPageQuestions.length > 0 ? (
              <>
                {currentPageQuestions.map((apiQuestion, index) => {
                  const questionNum = startIndex + index + 1;
                  const questionData = formatQuestionData(apiQuestion, startIndex + index);
                  
                  return (
                    <div key={questionNum} id={`question-${questionNum}`} className="question-card">
                      <h3 className="question-text">
                        {questionData.text}
                      </h3>
                      <p className="question-subtitle">{questionData.subtitle}</p>

                      {/* Answer Options */}
                      <div className="options-list">
                        {questionData.options.map((option, optionIndex) => {
                          const optionLabel = ['A', 'B', 'C', 'D'][optionIndex];
                          return (
                            <label key={optionIndex} className="option-item">
                              <input
                                type="radio"
                                name={`question-${questionNum}`}
                                value={optionLabel}
                                checked={selectedAnswers[questionNum] === optionLabel}
                                onChange={() => handleAnswerSelect(questionNum, optionLabel)}
                                className="option-radio"
                              />
                              <span className="option-text">
                                <strong>{optionLabel}.</strong> {option}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Navigation at the end */}
                <div className="content-footer">
                  <div className="auto-save-text">
                    Lưu kết quả tự động
                  </div>
                  
                  <div className="navigation-buttons">
                    <button 
                      className="nav-btn nav-btn--prev"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      ← Trước
                    </button>
                    
                    {isLastPage ? (
                      <button 
                        className="nav-btn nav-btn--submit"
                        onClick={handleSubmit}
                      >
                        Nộp bài
                      </button>
                    ) : (
                      <button 
                        className="nav-btn nav-btn--next"
                        onClick={handleNextPage}
                      >
                        Tiếp theo →
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-questions">
                <p>Không có câu hỏi nào được tìm thấy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsTestSystem;