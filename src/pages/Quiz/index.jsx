import React, { useState, useEffect, useRef } from "react";
import { Pagination, Modal, Spin, Alert } from "antd";
import "./index.scss";
import LayoutContent from "../../components/layoutContent";
import EssayQuestion from "../../components/EssayQuestion";
import { useParams } from "react-router-dom";
import { examService, autoGradingService, essayService } from "../../services";
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
  const [examData, setExamData] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [essayValidations, setEssayValidations] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false); // Thêm state để tránh submit nhiều lần
  const containerRef = useRef(null);

  const QUESTIONS_PER_PAGE = 10; 
  const { examId } = useParams();

  const loadRealQuestionsFromAI = async (placeholderQuestions) => {
    try {
      
      const chaptersArray = await questionBankService.getChapters();
      if (!Array.isArray(chaptersArray) || chaptersArray.length === 0) {
        console.warn('No chapters available in database, using placeholder questions');
        setQuestions(placeholderQuestions);
        return;
      }

      const firstChapter = chaptersArray[0];
      const chapterId = firstChapter.chapterId || firstChapter.ChapterId;
      
      if (!chapterId) {
        console.warn('No valid ChapterId found, using placeholder questions');
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
          const response = await examService.getExamById(examId);
          const data = response.data || response; // Đảm bảo lấy đúng object chứa questions
          console.log('Exam data:', data);
          setExamData(data);
          const duration = data.durationMinutes || 20; 
          setTimeLeft(duration * 60);

          let extractedQuestions = [];
          const questionsArray = Array.isArray(data.questions) ? data.questions : (data.questions && data.questions.$values ? data.questions.$values : []);
          if (questionsArray && questionsArray.length > 0) {
            extractedQuestions = questionsArray.map(examQuestion => {
              if (examQuestion.question) {
                return {
                  ...examQuestion.question,
                  examQuestionId: examQuestion.examQuestionId,
                  questionOrder: examQuestion.questionOrder,
                  pointsWeight: examQuestion.pointsWeight
                };
              } else {
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
    if (timeLeft === null || isSubmitted) return; // Thêm check isSubmitted

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          if (!isSubmitted) { // Kiểm tra trước khi auto submit
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]); // Thêm isSubmitted vào dependency

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
      // Scroll to top with a small delay to ensure the new page content is rendered
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 0);
    };
  const scrollToQuestionWithOffset = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
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

  const handleEssayValidationChange = (questionId, isValid) => {
    setEssayValidations(prev => ({
      ...prev,
      [questionId]: isValid
    }));
  };

  const renderQuestionContent = (question) => {
    const questionId = question.questionId || question.id;
    
    // Kiểm tra xem có phải câu hỏi tự luận không
    if (question.questionType === 'essay' || question.type === 'essay') {
      return (
        <EssayQuestion
          question={question}
          value={selectedAnswers[questionId] || ''}
          onChange={(value) => handleAnswerSelect(questionId, value)}
          onValidationChange={(isValid) => handleEssayValidationChange(questionId, isValid)}
          disabled={isSubmitting}
        />
      );
    }

    return (
      <div className="options">
        {question.answerChoices && question.answerChoices.length > 0 ? (
          [...question.answerChoices]
            .sort((a, b) => {
              const orderA = a.displayOrder === null ? 0 : a.displayOrder;
              const orderB = b.displayOrder === null ? 0 : b.displayOrder;
              return orderA - orderB;
            })
            .map((choice, optionIndex) => (
              <label key={choice.choiceId || optionIndex}>
                <input
                  type="radio"
                  name={`question-${questionId}`}
                  value={choice.choiceLabel}
                  checked={selectedAnswers[questionId] === choice.choiceLabel}
                  onChange={() => handleAnswerSelect(questionId, choice.choiceLabel)}
                  disabled={isSubmitting}
                />
                <span>{`${choice.choiceLabel}. ${choice.choiceText}`}</span>
              </label>
            ))
        ) : (
          ["A", "B", "C", "D"].map((optionLabel, optionIndex) => (
            <label key={optionIndex}>
              <input
                type="radio"
                name={`question-${questionId}`}
                value={optionLabel}
                checked={selectedAnswers[questionId] === optionLabel}
                onChange={() => handleAnswerSelect(questionId, optionLabel)}
                disabled={isSubmitting}
              />
              <span>{`${optionLabel}. ${question[`answer${optionLabel}`] || 'Đáp án chưa có'}`}</span>
            </label>
          ))
        )}
      </div>
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitted(true); 
      
      // Kiểm tra đăng nhập
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const studentUserId = currentUser.userId || currentUser.id;

      if (!studentUserId) {
        toast.error("Vui lòng đăng nhập để nộp bài");
        return;
      }

      // Kiểm tra xem có câu trả lời nào không
      if (Object.keys(selectedAnswers).length === 0) {
        toast.error("Vui lòng trả lời ít nhất một câu hỏi trước khi nộp bài");
        return;
      }

      const essayQuestions = questions.filter(q => q.questionType === 'essay' || q.type === 'essay');
      const invalidEssays = essayQuestions.filter(q => {
        const questionId = q.questionId || q.id;
        return selectedAnswers[questionId] && essayValidations[questionId] === false;
      });

      if (invalidEssays.length > 0) {
        toast.error(`Có ${invalidEssays.length} câu tự luận chưa đạt yêu cầu về độ dài. Vui lòng kiểm tra lại.`);
        return;
      }

      setIsSubmitting(true);
      toast.loading("Đang chấm bài...", { id: "grading" });

      const endTime = new Date();
      const timeTakenMs = endTime - startTime;
      const hours = Math.floor(timeTakenMs / (1000 * 60 * 60));
      const minutes = Math.floor((timeTakenMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeTakenMs % (1000 * 60)) / 1000);
      const timeTaken = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      let essayGradingResults = {};

      // Chấm điểm các câu tự luận trước
      if (essayQuestions.length > 0) {
        try {
          // toast.loading("Đang chấm điểm các câu tự luận...", { id: "essay-grading" });
          
          const essaySubmissions = essayQuestions
            .filter(q => selectedAnswers[q.questionId || q.id])
            .map(q => essayService.createEssaySubmission(
              q.questionId || q.id,
              studentUserId,
              selectedAnswers[q.questionId || q.id]
            ));

          if (essaySubmissions.length > 0) {
            const batchGradingResult = await essayService.batchGradeEssays({
              Submissions: essaySubmissions,  // PascalCase để match backend DTO
              UseStrictGrading: false,
              ProvideDetailedFeedback: true,
              GradingStyle: "balanced"
            });

            // Backend returns { success: true, data: [...] }
            const gradingResults = batchGradingResult.data || batchGradingResult;
            
            // Convert array to object with questionId as key
            essayGradingResults = {};
            if (Array.isArray(gradingResults)) {
              gradingResults.forEach(result => {
                essayGradingResults[result.QuestionId || result.questionId] = {
                  totalScore: result.TotalScore || result.totalScore,
                  overallFeedback: result.OverallFeedback || result.overallFeedback,
                  criteriaScores: result.CriteriaScores || result.criteriaScores,
                  strengths: result.Strengths || result.strengths,
                  areasForImprovement: result.AreasForImprovement || result.areasForImprovement
                };
              });
            }
            
            console.log('📝 Essay grading results:', essayGradingResults);
            // toast.success("Chấm điểm tự luận hoàn thành!", { id: "essay-grading" });
          }
        } catch (error) {
          console.warn('Lỗi khi chấm điểm tự luận:', error);
          toast.dismiss("essay-grading");
          // toast.error("Không thể chấm điểm tự luận, sẽ sử dụng chấm điểm thủ công sau");
        }
      }

      const studentAnswers = questions.map(question => {
        const questionId = question.questionId || question.id;
        const answer = selectedAnswers[questionId];
        
        if (question.questionType === 'essay' || question.type === 'essay') {
          return {
            questionId,
            studentTextAnswer: answer,
            answeredAt: new Date().toISOString(),
            // Thêm kết quả chấm điểm tự luận nếu có
            ...(essayGradingResults[questionId] && {
              essayScore: essayGradingResults[questionId].totalScore,
              essayFeedback: essayGradingResults[questionId].overallFeedback
            })
          };
        }

        // Xử lý câu hỏi trắc nghiệm như cũ
        const selectedChoice = question.answerChoices?.find(choice => 
          choice.choiceLabel === answer
        );
        return {
          questionId,
          selectedChoiceId: selectedChoice?.choiceId,
          answeredAt: new Date().toISOString()
        };
      }).filter(answer => answer.selectedChoiceId || answer.studentTextAnswer);

      if (studentAnswers.length === 0) {
        throw new Error("Có lỗi xảy ra khi xử lý câu trả lời. Vui lòng thử lại");
      }

      // Gọi API chấm điểm tự động
      const gradingResult = await autoGradingService.gradeExam(
        examId,
        studentAnswers,
        studentUserId,
        timeTaken
      );

      if (!gradingResult) {
        throw new Error("Không nhận được kết quả chấm điểm từ server");
      }

      // Lưu kết quả chấm điểm
      localStorage.setItem('latestGradingResult', JSON.stringify(gradingResult));

      toast.success("Chấm bài thành công!", { id: "grading" }); 
      
      // Lưu tất cả data cần thiết vào localStorage
      const resultData = {
        gradingResults: gradingResult,
        examData: examData,
        timeTaken: timeTaken,
        timestamp: Date.now()
      };
      
      console.log('💾 Saving to localStorage:', resultData);
      localStorage.setItem('resultPageData', JSON.stringify(resultData));
      
      // Force reload để đảm bảo component mới được mount
      console.log('🔄 Navigating to result page...');
      
      // Delay ngắn để đảm bảo data được lưu xong
      setTimeout(() => {
        window.location.replace('/result');
      }, 100);

    } catch (error) {
      console.error("Lỗi khi chấm bài:", error);
      setIsSubmitted(false); // Reset để có thể thử lại
      toast.error(
        error.message || "Có lỗi xảy ra khi chấm bài. Vui lòng thử lại sau",
        { id: "grading" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  // Styles cho essay questions đã được chuyển vào EssayQuestion component

  return (
    <div className="Layout-Quiz" ref={containerRef}>
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
              {questions.map((question, questionNum) => {
                const pageOfQuestion =
                  Math.floor(questionNum / QUESTIONS_PER_PAGE) + 1;
                const questionId = question.questionId || question.id;
                return (
                  <button
                    key={questionId}
                    className={`question-btn ${selectedAnswers[questionId]
                      ? "question-btn--answered"
                      : markedForReview[questionId]
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
                  {renderQuestionContent(question, index)}
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
