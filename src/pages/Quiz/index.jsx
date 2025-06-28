import React, { useState, useEffect } from "react";
import { Pagination, Modal, Spin, Alert } from "antd";
import "./index.scss";
import LayoutContent from "../../components/layoutContent";
import { useNavigate, useParams } from "react-router-dom";
import { uploadFile } from "../../quiz-uploads/firebaseStorage";
import { examService, autoGradingService } from "../../services";
import { questionBankService } from "../../services/questionBankService";
import toast from "react-hot-toast";

const PhysicsTestSystem = () => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollToQuestion, setScrollToQuestion] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({}); // 2. State
  const [examData, setExamData] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const QUESTIONS_PER_PAGE = 10; 
  const navigate = useNavigate();
  const { examId } = useParams(); 

  const loadRealQuestionsFromAI = async (placeholderQuestions) => {
    try {
      console.log('Attempting to load real AI questions for placeholders...');
      
      const chaptersArray = await questionBankService.getChapters();
      if (!Array.isArray(chaptersArray) || chaptersArray.length === 0) {
        console.warn('No chapters available in database, using placeholder questions');
        toast.warning('Không có chapters trong database. Sử dụng câu hỏi mẫu.');
        setQuestions(placeholderQuestions);
        return;
      }

      const firstChapter = chaptersArray[0];
      const chapterId = firstChapter.chapterId || firstChapter.ChapterId;
      
      if (!chapterId) {
        console.warn('No valid ChapterId found, using placeholder questions');
        toast.warning('Lỗi: Không tìm thấy ChapterId. Sử dụng câu hỏi mẫu.');
        setQuestions(placeholderQuestions);
        return;
      }

      toast.error('Quiz page không được tự động tạo đề thi! Vui lòng chọn đề thi có sẵn từ danh sách.');
      setQuestions(placeholderQuestions);

    } catch (aiError) {
      console.error('AI service error:', aiError);
      const errorMessage = examService.formatError(aiError);
      toast.error(`Lỗi AI service: ${errorMessage}. Sử dụng câu hỏi mẫu.`);
      setQuestions(placeholderQuestions);
    }
  };

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        setStartTime(new Date());

        if (examId) {
          const data = await examService.getExamById(examId);
          setExamData(data);
          
          // Set thời gian từ exam data
          const duration = data.durationMinutes || 20; // Fallback to 20 minutes if not set
          setTimeLeft(duration * 60); // Convert to seconds

          // Safe extraction of questions from exam structure
          let extractedQuestions = [];

          // Handle .NET serialization format with $values array
          const questionsArray = data.questions && data.questions.$values ?
            data.questions.$values :
            (Array.isArray(data.questions) ? data.questions : []);
          // Check if we have questions to process
          if (questionsArray && questionsArray.length > 0) {
            extractedQuestions = questionsArray.map(examQuestion => {
              // If examQuestion.question exists (nested structure)
              if (examQuestion.question) {
                return {
                  ...examQuestion.question,
                  examQuestionId: examQuestion.examQuestionId,
                  questionOrder: examQuestion.questionOrder,
                  pointsWeight: examQuestion.pointsWeight
                };
              }
              // If examQuestion is the question itself (flat structure)
              else {
                return {
                  ...examQuestion,
                  questionId: examQuestion.questionId || `question-${examQuestion.questionOrder || Math.random()}`,
                  questionText: examQuestion.questionText || '[AI Generated Question - Content loaded from frontend]',
                  answerChoices: examQuestion.answerChoices || []
                };
              }
            });
          } else {
            console.warn('No questions found in exam data:', data);
          }

          // Check if we have placeholder questions that need real content from AI API
          const hasPlaceholderQuestions = extractedQuestions.some(q =>
            q.questionText === '[AI Generated Question - Content loaded from frontend]' ||
            !q.answerChoices ||
            q.answerChoices.length === 0
          );

          if (hasPlaceholderQuestions) {
            await loadRealQuestionsFromAI(extractedQuestions);
          } else {
            setQuestions(extractedQuestions);
          }
        } else {
          // No examId provided - redirect to exam selection
          setError("Vui lòng chọn đề thi để bắt đầu làm bài");
          setLoading(false);
          return;
        }

        setError(null);
      } catch (err) {
        console.error('Fetch exam error:', err);
        setError(examService.formatError(err));
        toast.error('Không thể tải đề thi');
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId]);

  // Chỉ bắt đầu đếm ngược khi đã có thời gian
  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit(); // Tự động nộp bài khi hết giờ
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      toast.loading("Đang chấm bài...", { id: "grading" });

      // Tính thời gian làm bài
      const endTime = new Date();
      const timeTakenMs = endTime - startTime;
      const hours = Math.floor(timeTakenMs / (1000 * 60 * 60));
      const minutes = Math.floor((timeTakenMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeTakenMs % (1000 * 60)) / 1000);
      const timeTaken = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; // Format: "HH:mm:ss"

      // Lấy userId từ localStorage hoặc auth context
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const studentUserId = currentUser.userId || currentUser.id;

      if (!studentUserId) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      // Chuyển đổi selectedAnswers thành format phù hợp cho API
      const studentAnswers = Object.entries(selectedAnswers).map(([questionId, choiceLabel]) => {
        // Tìm question để lấy choiceId từ choiceLabel
        const question = questions.find(q => (q.questionId || q.id) === questionId);
        if (!question || !question.answerChoices) {
          return null;
        }

        const selectedChoice = question.answerChoices.find(choice => choice.choiceLabel === choiceLabel);
        if (!selectedChoice) {
          return null;
        }

        return {
          questionId: questionId,
          selectedChoiceId: selectedChoice.choiceId,
          answeredAt: new Date().toISOString()
        };
      }).filter(answer => answer !== null);

      if (studentAnswers.length === 0) {
        throw new Error("Không có câu trả lời nào để chấm điểm");
      }

      // Gọi API chấm điểm tự động
      const gradingResult = await autoGradingService.gradeExam(
        examId,
        studentAnswers,
        studentUserId,
        timeTaken // Format: "HH:mm:ss"
      );

      // Lưu kết quả chấm điểm để truyền sang trang Result
      localStorage.setItem('latestGradingResult', JSON.stringify(gradingResult));

      toast.success("Chấm bài thành công!", { id: "grading" });
      
      // Chuyển đến trang kết quả với data
      navigate("/result", { 
        state: { 
          gradingResults: gradingResult,
          examData: examData,
          timeTaken: timeTaken
        }
      });

    } catch (error) {
      console.error("Lỗi khi chấm bài:", error);
      toast.error(`Lỗi khi chấm bài: ${error.message || error}`, { id: "grading" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (questionId, file) => {
    // 3. Hàm upload
    try {
      const url = await uploadFile(file);
      setUploadedFiles((prev) => ({
        ...prev,
        [questionId]: url,
      }));
      alert("Upload thành công!");
    } catch (err) {
      alert("Upload thất bại!");
      console.log("Error:", err);

    }
  };

  return (
    <div className="Layout-Quiz">
      <LayoutContent
        layoutType={5}
        content1={
          <div className="timer-card">
            {examData && (
              <div className="exam-info">
                <h3>{examData.examName}</h3>
                <p>Thời gian: {examData.durationMinutes} phút</p>
              </div>
            )}
            <h2>Thời gian còn lại</h2>
            <div
              className={`timer-display ${timeLeft < 300 ? "timer-warning" : ""
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
                    className={`question-btn ${selectedAnswers[questionNum + 1]
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
                  key={question.questionId || question.id || index}
                  id={`question-${startIndex + index + 1}`}
                  className="question-card"
                >
                  <h3>{`Câu ${startIndex + index + 1}: ${question.questionText || question.question || 'Câu hỏi không có nội dung'
                    }`}</h3>
                  <div className="options">
                    {question.answerChoices && question.answerChoices.length > 0 ? (
                      question.answerChoices
                        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                        .map((choice, optionIndex) => (
                          <label key={choice.choiceId || optionIndex}>
                            <input
                              type="radio"
                              name={`question-${question.questionId || question.id}`}
                              value={choice.choiceLabel}
                              checked={selectedAnswers[question.questionId || question.id] === choice.choiceLabel}
                              onChange={() =>
                                handleAnswerSelect(question.questionId || question.id, choice.choiceLabel)
                              }
                            />
                            <span>{`${choice.choiceLabel}. ${choice.choiceText}`}</span>
                          </label>
                        ))
                    ) : (
                      // Fallback cho format cũ nếu không có answerChoices
                      ["A", "B", "C", "D"].map((optionLabel, optionIndex) => (
                        <label key={optionIndex}>
                          <input
                            type="radio"
                            name={`question-${question.questionId || question.id}`}
                            value={optionLabel}
                            checked={selectedAnswers[question.questionId || question.id] === optionLabel}
                            onChange={() =>
                              handleAnswerSelect(question.questionId || question.id, optionLabel)
                            }
                          />
                          <span>{`${optionLabel}. ${question[`answer${optionLabel}`] || 'Đáp án chưa có'
                            }`}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <div className="review-toggle">
                    <label>
                      <input
                        type="checkbox"
                        checked={markedForReview[question.questionId || question.id] || false}
                        onChange={() => handleReviewToggle(question.questionId || question.id)}
                      />
                      <span>Lát kiểm tra lại</span>
                    </label>
                  </div>
                  {/* 4. Thêm input upload file */}
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileUpload(question.questionId || question.id, e.target.files[0]);
                        }
                      }}
                    />
                    {uploadedFiles[question.questionId || question.id] && (
                      <div>
                        <a
                          href={uploadedFiles[question.questionId || question.id]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Xem file đã upload
                        </a>
                      </div>
                    )}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang chấm bài..." : "Nộp bài"}
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
