import React, { useState, useEffect } from "react";
import { Pagination, Modal } from "antd";
import "./index.scss";
import LayoutContent from "../../components/layoutContent";
import { useNavigate } from "react-router-dom";

const PhysicsTestSystem = () => {
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollToQuestion, setScrollToQuestion] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const QUESTIONS_PER_PAGE = 10; // Số câu hỏi trên mỗi trang
  const API_URL = "https://684276aee1347494c31cddbd.mockapi.io/question";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }
        const data = await response.json();
        setQuestions(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleReviewToggle = (questionId) => {
    setMarkedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setScrollToQuestion(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const scrollToQuestionWithOffset = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      console.log(`Scrolling to ${id}`);
    }
  };
  useEffect(() => {
    if (scrollToQuestion !== null) {
      setTimeout(() => {
        scrollToQuestionWithOffset(`question-${scrollToQuestion}`, 32);
        setScrollToQuestion();
      }, 100);
    }
  }, [currentPage, scrollToQuestion]);

  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentPageQuestions = questions.slice(startIndex, endIndex);

  const handleSubmit = () => {
    navigate("/result");
  };

  return (
    <div className="Layout-Quiz">
      <LayoutContent
        layoutType={5}
        content1={
          <div className="timer-card">
            <h2>Thời gian còn lại</h2>
            <div
              className={`timer-display ${
                timeLeft < 300 ? "timer-warning" : ""
              }`}
            >
              {formatTime(timeLeft)}
            </div>
            <div className="time-bar">
              <div>Số câu đã làm</div>
              <div>
                {Object.keys(selectedAnswers).length}/{questions.length || 0}
              </div>
            </div>

            <div className="question-grid">
              {questions.map((_, questionNum) => {
                const pageOfQuestion =
                  Math.floor(questionNum / QUESTIONS_PER_PAGE) + 1;
                return (
                  <button
                    key={questionNum + 1}
                    className={`question-btn ${
                      selectedAnswers[questionNum + 1]
                        ? "question-btn--answered"
                        : markedForReview[questionNum + 1]
                        ? "question-btn--review"
                        : "question-btn--unanswered"
                    }`}
                    onClick={() => {
                      if (pageOfQuestion !== currentPage) {
                        setScrollToQuestion(questionNum + 1);
                        setCurrentPage(pageOfQuestion);
                      } else {
                        const targetElement = document.getElementById(
                          `question-${questionNum + 1}`
                        );
                        if (targetElement) {
                          scrollToQuestionWithOffset(
                            `question-${questionNum + 1}`,
                            12
                          );
                        }
                      }
                    }}
                  >
                    {questionNum + 1}
                  </button>
                );
              })}
            </div>
            <div className="legend">
              <div>
                <span className="legend-color legend-color--answered"></span>
                Câu đã làm
              </div>
              <div>
                <span className="legend-color legend-color--unanswered"></span>
                Câu chưa làm
              </div>
              <div>
                <span className="legend-color legend-color--review"></span>
                Câu cần kiểm tra lại
              </div>
            </div>
            <a
              href="#submit"
              style={{ textDecoration: "none" }}
              className="submit-link"
              onClick={(e) => {
                e.preventDefault();
                setShowConfirmSubmit(true);
              }}
            >
              Nộp bài ngay
            </a>
          </div>
        }
        content2={
          <div className="questions-container">
            <h2 className="title-question">Đề Thi Vật Lý Lớp 12 - Học Kỳ I</h2>
            {loading ? (
              <div>Đang tải câu hỏi...</div>
            ) : error ? (
              <div>Lỗi: {error}</div>
            ) : currentPageQuestions.length > 0 ? (
              currentPageQuestions.map((question, index) => (
                <div
                  key={question.id}
                  id={`question-${startIndex + index + 1}`}
                  className="question-card"
                >
                  <h3>{`Câu ${startIndex + index + 1}: ${
                    question.question
                  }`}</h3>
                  <div className="options">
                    {["A", "B", "C", "D"].map((optionLabel, optionIndex) => (
                      <label key={optionIndex}>
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={optionLabel}
                          checked={selectedAnswers[question.id] === optionLabel}
                          onChange={() =>
                            handleAnswerSelect(question.id, optionLabel)
                          }
                        />
                        <span>{`${optionLabel}. ${
                          question[`answer${optionLabel}`]
                        }`}</span>
                      </label>
                    ))}
                  </div>
                  <div className="review-toggle">
                    <label>
                      <input
                        type="checkbox"
                        checked={markedForReview[question.id] || false}
                        onChange={() => handleReviewToggle(question.id)}
                      />
                      <span>Lát kiểm tra lại</span>
                    </label>
                  </div>
                </div>
              ))
            ) : (
              <div>Không có câu hỏi nào được tìm thấy.</div>
            )}
            <Pagination
              current={currentPage}
              total={questions.length}
              pageSize={QUESTIONS_PER_PAGE}
              onChange={handlePageChange}
              style={{ marginTop: "20px", textAlign: "center" }}
            />
            <div className="submit-btn-row">
              <button
                className="submit-btn"
                onClick={() => setShowConfirmSubmit(true)}
              >
                Nộp bài
              </button>
            </div>
          </div>
        }
      />
      <Modal
        open={showConfirmSubmit}
        onCancel={() => setShowConfirmSubmit(false)}
        onOk={() => {
          setShowConfirmSubmit(false);
          handleSubmit();
        }}
        okText="Xác nhận nộp bài"
        cancelText="Hủy"
      >
        <p>Bạn chắc chắn muốn nộp bài? Sau khi nộp sẽ không thể sửa lại.</p>
      </Modal>
    </div>
  );
};

export default PhysicsTestSystem;
