import React, { useState, useEffect } from "react";
import { Pagination, Modal, Spin, Alert } from "antd";
import "./index.scss";
import LayoutContent from "../../components/layoutContent";
import { useNavigate, useParams } from "react-router-dom";
import { uploadFile } from "../../quiz-uploads/firebaseStorage";
import { examService } from "../../services";
import { questionBankService } from "../../services/questionBankService";
import toast from "react-hot-toast";

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
  const [uploadedFiles, setUploadedFiles] = useState({}); // 2. State
  const [examData, setExamData] = useState(null);

  const QUESTIONS_PER_PAGE = 10; // Số câu hỏi trên mỗi trang
  const navigate = useNavigate();
  const { examId } = useParams(); // Get exam ID from URL

  // Load real questions from AI API for placeholder questions
  const loadRealQuestionsFromAI = async (placeholderQuestions) => {
    console.log('=== LOADING REAL AI QUESTIONS ===');
    try {
      // Use service instead of manual fetch
      console.log('Fetching available chapters using service...');
      const chaptersArray = await questionBankService.getChapters();

      console.log('Chapters from service:', chaptersArray);
      console.log('Chapters array length:', chaptersArray.length);

      if (chaptersArray.length === 0) {
        throw new Error('No chapters available in database');
      }

      const firstChapter = chaptersArray[0];
      const chapterId = firstChapter.chapterId || firstChapter.ChapterId;
      console.log('Using first chapter:', firstChapter);
      console.log('Chapter ID extracted:', chapterId);
      console.log('Chapter name:', firstChapter.chapterName || firstChapter.ChapterName);

      const questionsWithRealContent = [];

      for (let i = 0; i < placeholderQuestions.length; i++) {
        const question = placeholderQuestions[i];
        console.log(`Loading question ${i + 1}/${placeholderQuestions.length}...`);

        // Call AI API to generate real question content
        try {
          const response = await fetch(`http://localhost:5298/ai-question/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              questionType: 'multiple_choice',
              chapterId: chapterId,
              difficultyLevel: 'medium',
              saveToDatabase: false // Don't save, just generate for display
            })
          });

          if (response.ok) {
            const aiData = await response.json();
            console.log(`AI API response for question ${i + 1}:`, aiData);

            if (aiData.success && aiData.data) {
              // Use AI generated content - ONLY from API
              questionsWithRealContent.push({
                ...question,
                questionText: aiData.data.questionText,
                answerChoices: aiData.data.answerChoices
              });
            } else {
              console.warn(`AI API response invalid for question ${i + 1}, retrying...`);
              // Retry API call once more
              const retryResponse = await fetch(`http://localhost:5298/ai-question/generate`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                  questionType: 'multiple_choice',
                  chapterId: chapterId,
                  difficultyLevel: 'medium',
                  saveToDatabase: false
                })
              });

              if (retryResponse.ok) {
                const retryData = await retryResponse.json();
                if (retryData.success && retryData.data) {
                  questionsWithRealContent.push({
                    ...question,
                    questionText: retryData.data.questionText,
                    answerChoices: retryData.data.answerChoices
                  });
                } else {
                  // If still fails, keep original placeholder
                  questionsWithRealContent.push(question);
                }
              } else {
                questionsWithRealContent.push(question);
              }
            }
          } else {
            console.error(`AI API HTTP error for question ${i + 1}:`, response.status);
            // Keep original placeholder if API fails
            questionsWithRealContent.push(question);
          }
        } catch (err) {
          console.error(`Error calling AI API for question ${i + 1}:`, err);
          // Keep original placeholder if API call fails
          questionsWithRealContent.push(question);
        }
      }

      console.log('Final questions with real AI content:', questionsWithRealContent);
      setQuestions(questionsWithRealContent);

    } catch (error) {
      console.error('Error in loadRealQuestionsFromAI:', error);
      console.error('Error details:', error.message);
      // Show error message to user instead of using placeholders
      alert(`Lỗi khi tải câu hỏi AI: ${error.message}`);
      setQuestions(placeholderQuestions);
    }
  };

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);

        // If we have specific exam ID from URL, get that exam
        if (examId) {
          const data = await examService.getExamById(examId);
          console.log('Exam data received:', data);
          setExamData(data);

          // Safe extraction of questions from exam structure
          let extractedQuestions = [];

          // Handle .NET serialization format with $values array
          const questionsArray = data.questions && data.questions.$values ?
            data.questions.$values :
            (Array.isArray(data.questions) ? data.questions : []);

          console.log('Questions array detected:', questionsArray);
          console.log('Questions array length:', questionsArray.length);

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

          console.log('Extracted questions:', extractedQuestions);

          // Check if we have placeholder questions that need real content from AI API
          const hasPlaceholderQuestions = extractedQuestions.some(q =>
            q.questionText === '[AI Generated Question - Content loaded from frontend]' ||
            !q.answerChoices ||
            q.answerChoices.length === 0
          );

          if (hasPlaceholderQuestions) {
            console.log('Detected placeholder questions, loading real content from AI API...');
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
