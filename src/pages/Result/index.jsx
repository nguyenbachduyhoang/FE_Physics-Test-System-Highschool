import React, { useState, useEffect, useRef } from "react";
import LayoutContent from "../../components/layoutContent";
import "./index.scss";
import {
  FaRocket,
  FaUsers,
  FaChartLine,
  FaRegCheckSquare,
  FaRegFilePdf,
  FaBrain,
  FaLightbulb,
  FaExclamationTriangle,
  FaTrophy,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { autoGradingService, explanationService } from "../../services";
import { Modal, Spin, Alert, Collapse, Tag, Progress, Divider, Button } from "antd";
import toast from "react-hot-toast";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const resultData = {
  score: 8.5,
  total: 10,
  correct: 34,
  totalQuestions: 40,
  time: "18:30 phút",
  suggestions: [
    "Làm thêm bài tập về Định luật Newton, Công thức lực điện và chuyển động đều.",
    "Hệ thống có thể tạo đề luyện tương tự theo chủ đề này.",
  ],
  questions: [
    {
      id: 1,
      question: "Định luật Newton thứ nhất nói về điều gì?",
      yourAnswer: "Một vật có khối lượng lớn sẽ chuyển động nhanh.",
      correctAnswer:
        "Một vật sẽ giữ nguyên trạng thái nếu không có lực tác dụng.",
      analysis:
        "Đây là định luật quán tính. Bạn nên ôn tập lại chủ đề 'Cơ học - Định luật Newton'.",
      isCorrect: false,
    },
    // Thêm các câu hỏi khác nếu muốn
  ],
};

const handleExportPDF = (displayData, isRealData) => {
  try {
    // Check if pdfMake is loaded
    if (!window.pdfMake) {
      throw new Error('PDF generator is not loaded yet. Please try again in a few seconds.');
    }

    const docDefinition = {
      content: [
        {
          text: isRealData ? `Kết Quả Bài Thi - ${displayData.examName || 'PhyGen'}` : "Kết Quả Bài Thi - PhyGen",
          style: 'header'
        },
        {
          text: [
            { text: '\nĐiểm số: ', bold: true },
            isRealData 
              ? `${displayData.totalPointsEarned?.toFixed(1)} / ${displayData.maxPossiblePoints?.toFixed(1)}`
              : `${resultData.score} / ${resultData.total}`
          ]
        },
        {
          text: [
            { text: '\nTỷ lệ: ', bold: true },
            isRealData 
              ? `${displayData.percentageScore?.toFixed(1)}% - ${autoGradingService.getGradeText(displayData.grade)}`
              : ''
          ]
        },
        {
          text: [
            { text: '\nSố câu đúng: ', bold: true },
            isRealData 
              ? `${displayData.correctAnswers} / ${displayData.totalQuestions}`
              : `${resultData.correct} / ${resultData.totalQuestions}`
          ]
        },
        {
          text: [
            { text: '\nThời gian làm bài: ', bold: true },
            isRealData ? (displayData.timeTaken || 'N/A') : resultData.time
          ]
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        }
      },
      defaultStyle: {
        font: 'Roboto'
      }
    };

    if (isRealData) {
      docDefinition.content.push(
        {
          text: [
            { text: '\nHiệu suất: ', bold: true },
            autoGradingService.getPerformanceLevelText(displayData.analysis?.performanceLevel)
          ]
        }
      );

      if (displayData.analysis?.recommendations?.length > 0) {
        docDefinition.content.push(
          { text: '\nGợi ý cải thiện:', bold: true, margin: [0, 10, 0, 5] },
          {
            ul: displayData.analysis.recommendations
          }
        );
      }
    }

    // Create and download PDF using global pdfMake
    window.pdfMake.createPdf(docDefinition).download('ket-qua-phygen.pdf');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error(error.message || 'Có lỗi khi tạo file PDF');
  }
};

const ResultContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [gradingData, setGradingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailedFeedback, setDetailedFeedback] = useState({});
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [explanations, setExplanations] = useState({});
  const [loadingExplanations, setLoadingExplanations] = useState({});

  // Thêm refs cho animation
  const statsRef = useRef(null);
  const titleRef = useRef(null);
  const analysisRef = useRef(null);
  const questionsRef = useRef(null);

  useEffect(() => {
    const loadGradingResults = async () => {
      try {
        setLoading(true);
        
        // Lấy kết quả từ navigation state hoặc localStorage
        let results = location.state?.gradingResults;
        
        if (!results) {
          const savedResults = localStorage.getItem('latestGradingResult');
          if (savedResults) {
            results = JSON.parse(savedResults);
          }
        }

        // Thêm fallback navigation data
        if (!results) {
          const fallbackData = localStorage.getItem('fallbackNavigationData');
          if (fallbackData) {
            const parsedFallback = JSON.parse(fallbackData);
            results = parsedFallback.gradingResults;
            localStorage.removeItem('fallbackNavigationData'); // Cleanup
          }
        }

        // Debug: Log kết quả tìm được
        console.log('🔍 DEBUG - Kết quả tìm được:', {
          fromState: !!location.state?.gradingResults,
          fromLocalStorage: !!localStorage.getItem('latestGradingResult'),
          fromFallback: !!localStorage.getItem('fallbackNavigationData'),
          finalResults: results,
          hasQuestionResults: !!results?.questionResults,
          questionResultsCount: results?.questionResults?.length || 0
        });

        if (results) {
          setGradingData(results);
          
          // Debug: Log chi tiết questionResults
          console.log('🔍 DEBUG - Chi tiết questionResults:', {
            questionResults: results.questionResults,
            firstQuestion: results.questionResults?.[0],
            questionKeys: results.questionResults?.[0] ? Object.keys(results.questionResults[0]) : []
          });
          
          // Tự động load explanation cho tất cả câu hỏi
          if (results.questionResults && results.questionResults.length > 0) {
            results.questionResults.forEach(async (result, index) => {
              console.log(`🔍 DEBUG - Question ${index + 1}:`, {
                questionId: result.questionId,
                studentChoiceId: result.studentChoiceId,
                studentChoiceLabel: result.studentChoiceLabel,
                studentChoiceText: result.studentChoiceText,
                studentTextAnswer: result.studentTextAnswer,
                correctChoiceId: result.correctChoiceId,
                correctChoiceLabel: result.correctChoiceLabel,
                correctChoiceText: result.correctChoiceText,
                isCorrect: result.isCorrect,
                questionType: result.questionType
              });
              
              if (result.questionId) {
                try {
                  const explanationResult = await explanationService.getExplanationByQuestion(result.questionId);
                  if (explanationResult.success) {
                    setExplanations(prev => ({
                      ...prev,
                      [result.questionId]: explanationResult.data
                    }));
                  }
                } catch {
                  console.log(`Không thể tải explanation cho câu ${result.questionId}`);
                }
              }
            });
          }
        } else {
          // Fallback to demo data if no grading results
          setGradingData(null);
          toast.warning("Không tìm thấy kết quả chấm điểm. Hiển thị dữ liệu mẫu.");
        }
      } catch (error) {
        console.error("Lỗi khi tải kết quả:", error);
        toast.error("Có lỗi khi tải kết quả chấm điểm");
        setGradingData(null);
      } finally {
        setLoading(false);
      }
    };

    loadGradingResults();
  }, [location.state]);

  // Thêm animation khi component mount
  useEffect(() => {
    if (!loading && gradingData) {
      // Title animation
      gsap.from(titleRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      // Stats cards animation với hiệu ứng 3D
      gsap.from(".stats-card", {
        scale: 0.8,
        opacity: 0,
        rotationY: 45,
        duration: 0.6,
        stagger: 0.2,
        ease: "back.out(1.7)",
        transformPerspective: 1000
      });

      // Questions animation với hiệu ứng 3D
      gsap.from(".question", {
        opacity: 0,
        rotationX: -30,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        transformPerspective: 1000,
        scrollTrigger: {
          trigger: questionsRef.current,
          start: "top center+=100",
          toggleActions: "play none none reverse"
        }
      });

      // Progress bars animation
      gsap.from(".ant-progress-circle", {
        rotation: 360,
        scale: 0.5,
        opacity: 0,
        duration: 1.5,
        ease: "power2.out",
        stagger: 0.2
      });

      // Stats numbers counting animation
      const statsElements = document.querySelectorAll('.stats-value');
      statsElements.forEach(stat => {
        const value = parseFloat(stat.textContent);
        if (!isNaN(value)) {
          gsap.from(stat, {
            textContent: 0,
            duration: 2,
            ease: "power2.out",
            snap: { textContent: 1 },
            onUpdate: function() {
              this.targets()[0].textContent = Number(this.targets()[0].textContent).toFixed(1);
            }
          });
        }
      });
    }
  }, [loading, gradingData]);

  // Thêm hover animations
  useEffect(() => {
    // Stats card hover effect
    gsap.utils.toArray(".stats-card").forEach(card => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          rotationY: 10,
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotationY: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });

    // Question hover effect
    gsap.utils.toArray(".question").forEach(question => {
      question.addEventListener("mouseenter", () => {
        gsap.to(question, {
          scale: 1.02,
          rotationX: 2,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      question.addEventListener("mouseleave", () => {
        gsap.to(question, {
          scale: 1,
          rotationX: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });
  }, []);

  const handleSave = () => {
    // Lưu kết quả vào history hoặc database
    const savedData = {
      ...gradingData,
      savedAt: new Date().toISOString()
    };
    
    // Lưu vào localStorage history
    const existingHistory = JSON.parse(localStorage.getItem('examHistory') || '[]');
    existingHistory.unshift(savedData);
    localStorage.setItem('examHistory', JSON.stringify(existingHistory.slice(0, 10))); // Giữ 10 kết quả gần nhất
    
    toast.success("Lưu kết quả thành công!");
    navigate("/history");
  };

  const handleGetDetailedFeedback = async (questionId, studentChoiceId) => {
    try {
      const feedback = await autoGradingService.getDetailedFeedback(questionId, studentChoiceId);
      setDetailedFeedback(prev => ({
        ...prev,
        [questionId]: feedback
      }));
    } catch (error) {
      console.error("Lỗi khi lấy feedback chi tiết:", error);
      toast.error("Không thể tải feedback chi tiết");
    }
  };

  // Thêm function để lấy explanation từ database
  const handleGetExplanation = async (questionId) => {
    if (explanations[questionId] || loadingExplanations[questionId]) {
      return; // Đã có hoặc đang tải
    }

    try {
      setLoadingExplanations(prev => ({ ...prev, [questionId]: true }));
      
      const result = await explanationService.getExplanationByQuestion(questionId);
      
      if (result.success) {
        setExplanations(prev => ({
          ...prev,
          [questionId]: result.data
        }));
        toast.success("Đã tải giải thích chi tiết");
      } else {
        // Nếu không tìm thấy explanation trong DB, có thể tạo mới bằng AI
        if (result.statusCode === 404) {
          toast.info("Chưa có giải thích cho câu hỏi này. Bạn có thể tạo mới.");
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy explanation:", error);
      toast.error("Không thể tải giải thích");
    } finally {
      setLoadingExplanations(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // Function để tạo explanation tự động bằng AI (nếu cần)
  const handleCreateExplanationWithAI = async (questionId) => {
    try {
      setLoadingExplanations(prev => ({ ...prev, [questionId]: true }));
      
      // Thử tạo explanation bằng AI trước
      const aiResult = await explanationService.generateExplanationWithAI(questionId);
      
      if (aiResult.success) {
        // Sau khi AI tạo xong, tạo explanation trong database
        const createResult = await explanationService.createExplanation({
          questionId: questionId,
          explanationText: aiResult.data.explanation || "Giải thích được tạo tự động bằng AI"
        });
        
        if (createResult.success) {
          setExplanations(prev => ({
            ...prev,
            [questionId]: createResult.data
          }));
          toast.success("Đã tạo giải thích mới bằng AI");
        } else {
          toast.error(createResult.error);
        }
      } else {
        toast.error("Không thể tạo giải thích bằng AI");
      }
    } catch (error) {
      console.error("Lỗi khi tạo explanation:", error);
      toast.error("Không thể tạo giải thích mới");
    } finally {
      setLoadingExplanations(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // Hiển thị loading khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="result" style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>Đang tải kết quả chấm điểm...</p>
      </div>
    );
  }

  // Sử dụng dữ liệu thực từ auto grading hoặc fallback
  const displayData = gradingData || resultData;
  const isRealData = !!gradingData;

  // Debug: Log toàn bộ dữ liệu
  console.log('🔍 DEBUG - Toàn bộ dữ liệu Result:', {
    gradingData,
    displayData,
    isRealData,
    hasQuestionResults: !!displayData?.questionResults,
    questionResultsLength: displayData?.questionResults?.length || 0
  });

  return (
    <div className="result">
      <h1 className="title" ref={titleRef}>
        Kết Quả Bài Thi - {gradingData?.examName || "Đề thi - Động lực học chất điểm"}
      </h1>
      
      {!isRealData && (
        <Alert 
          message="Đang hiển thị dữ liệu mẫu" 
          description="Kết quả chấm điểm tự động không khả dụng. Dữ liệu hiển thị chỉ mang tính chất minh họa."
          type="warning" 
          showIcon 
          style={{ marginBottom: '20px' }}
        />
      )}

      <div className="stats" ref={statsRef}>
        <div className="stats-card">
          <FaRocket className="stats-icon" />
          <div className="stats-label">Điểm số</div>
          <div className="stats-value">
            {isRealData 
              ? `${displayData.totalPointsEarned?.toFixed(1)} / ${displayData.maxPossiblePoints?.toFixed(1)}`
              : "3.0 / 10.0"
            }
          </div>
          <div className="stats-subtitle error">30.0% - Yếu</div>
        </div>

        <div className="stats-card">
          <FaUsers className="stats-icon" />
          <div className="stats-label">Số câu đúng</div>
          <div className="stats-value">
            {isRealData 
              ? `${displayData.correctAnswers} / ${displayData.totalQuestions}`
              : "3 / 10"
            }
          </div>
          <Progress percent={30} showInfo={false} strokeColor="#19d6b4" />
        </div>

        <div className="stats-card">
          <FaChartLine className="stats-icon" />
          <div className="stats-label">Thời gian làm bài</div>
          <div className="stats-value">
            {isRealData ? displayData.timeTaken || "N/A" : "N/A"}
          </div>
        </div>

        <div className="stats-card">
          <FaTrophy className="stats-icon" />
          <div className="stats-label">Hiệu suất</div>
          <div className="stats-value">
            {isRealData 
              ? autoGradingService.getPerformanceLevelText(displayData.analysis?.performanceLevel)
              : "Chưa xác định"
            }
          </div>
          <div className="stats-subtitle error">Chưa xác định</div>
        </div>
      </div>

      <div className="analysis-section">
        <h2>
          <FaBrain /> Phân tích & Thống kê
        </h2>
        
        <div className="suggestion-item">
          <FaLightbulb />
          <div>
            <strong>Gợi ý luyện tập:</strong>
            <ul>
              <li>Cần tập trung ôn tập các chủ đề: Điện học, Từ học</li>
              <li>Cần luyện tập thêm các bài tập khó</li>
            </ul>
          </div>
        </div>

        <div className="study-plan">
          <h3>
            <FaChartLine /> Kế hoạch học tập
          </h3>
          <p>Xem lại lý thuyết và làm thêm bài tập về các chủ đề trênTăng dần độ khó của bài tập khi luyện tập</p>
        </div>

        <div className="difficulty-analysis">
          <h3>Phân tích theo độ khó:</h3>
          <div className="difficulty-tags">
            <div className="difficulty-tag easy">
              <span>Dễ:</span> 1 câu đúng
            </div>
            <div className="difficulty-tag medium">
              <span>Trung bình:</span> 2 câu đúng
            </div>
            <div className="difficulty-tag hard">
              <span>Khó:</span> 1 câu đúng
            </div>
            <div className="difficulty-tag very_hard">
              <span>Rất khó:</span> 6 câu đúng
            </div>
          </div>
        </div>
      </div>

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="section-title">
          <FaExclamationTriangle style={{ marginRight: '8px' }} />
          Phân tích chi tiết câu hỏi
        </h2>
        {isRealData && (
          <button 
            className="btn btn--secondary"
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
          >
            {showDetailedAnalysis ? 'Ẩn phân tích AI' : 'Xem phân tích AI'}
          </button>
        )}
      </div>

      <div className="questions" ref={questionsRef}>
        {isRealData && displayData.questionResults ? (
          <Collapse ghost>
            {displayData.questionResults.map((result, index) => {
              // Debug: Log dữ liệu của từng câu hỏi
              console.log(`🔍 Dữ liệu câu ${index + 1}:`, {
                questionId: result.questionId,
                studentChoiceLabel: result.studentChoiceLabel,
                studentChoiceText: result.studentChoiceText,
                studentTextAnswer: result.studentTextAnswer,
                correctChoiceLabel: result.correctChoiceLabel,
                correctChoiceText: result.correctChoiceText,
                isCorrect: result.isCorrect,
                questionType: result.questionType
              });
              
              return (
              <Collapse.Panel 
                key={result.questionId}
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Câu {index + 1}: {result.questionType === 'multiple_choice' ? 'Trắc nghiệm' : result.questionType}</span>
                    <div>
                      <Tag color={result.isCorrect ? 'green' : 'red'}>
                        {result.isCorrect ? 'Đúng' : 'Sai'}
                      </Tag>
                      <span style={{ marginLeft: '8px' }}>
                        {result.pointsEarned}/{result.maxPoints} điểm
                      </span>
                    </div>
                  </div>
                }
              >
                <div className="question-detailed">
                  <div className="question-answer">
                    <span className="label">Câu trả lời của bạn:</span>
                    <span className={result.isCorrect ? "correct" : "incorrect"}>
                      {result.studentChoiceLabel && result.studentChoiceText 
                        ? `${result.studentChoiceLabel}. ${result.studentChoiceText}`
                        : result.studentChoiceText || result.studentTextAnswer || "Không có câu trả lời"
                      }
                    </span>
                  </div>
                  <div className="question-answer">
                    <span className="label">Đáp án đúng:</span>
                    <span className="correct">
                      {result.correctChoiceLabel && result.correctChoiceText 
                        ? `${result.correctChoiceLabel}. ${result.correctChoiceText}`
                        : result.correctChoiceText || "Không xác định được đáp án"
                      }
                    </span>
                  </div>
                  {result.explanation && (
                    <div className="question-analysis">
                      <strong>Giải thích:</strong> {result.explanation}
                    </div>
                  )}
                  {result.feedback && (
                    <div className="ai-feedback">
                      <FaBrain style={{ marginRight: '8px', color: '#1890ff' }} />
                      <strong>AI Feedback:</strong> {result.feedback}
                    </div>
                  )}
                  
                  {/* Button để lấy explanation từ database */}
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button 
                      size="small"
                      loading={loadingExplanations[result.questionId]}
                      onClick={() => handleGetExplanation(result.questionId)}
                      icon={<FaLightbulb />}
                      style={{ 
                        borderColor: '#1890ff',
                        color: explanations[result.questionId] ? '#52c41a' : '#1890ff'
                      }}
                    >
                      {explanations[result.questionId] ? 'Đã có giải thích chi tiết' : 'Xem giải thích chi tiết từ DB'}
                    </Button>
                    
                    {!explanations[result.questionId] && (
                      <Button 
                        size="small"
                        loading={loadingExplanations[result.questionId]}
                        onClick={() => handleCreateExplanationWithAI(result.questionId)}
                        icon={<FaBrain />}
                        type="dashed"
                        style={{ 
                          borderColor: '#ff9c6e',
                          color: '#ff9c6e'
                        }}
                      >
                        Tạo giải thích bằng AI
                      </Button>
                    )}
                  </div>
                  
                  {/* Hiển thị explanation từ database */}
                  {explanations[result.questionId] && (
                    <div className="database-explanation" style={{ marginTop: '12px', padding: '12px', background: '#f0f8ff', borderRadius: '6px', border: '1px solid #d9ecff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <FaLightbulb style={{ marginRight: '8px', color: '#1890ff' }} />
                        <strong>Giải thích chi tiết từ AI:</strong>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        {explanations[result.questionId].explanationText}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Tạo bởi: {explanations[result.questionId].creator?.fullName || 'Hệ thống'} • 
                        {new Date(explanations[result.questionId].createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  )}
                  
                  {showDetailedAnalysis && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button 
                          className="btn btn--small"
                          onClick={() => handleGetDetailedFeedback(result.questionId, result.studentChoiceId)}
                        >
                          Xem phân tích chi tiết
                        </button>
                        
                        <Button 
                          size="small"
                          loading={loadingExplanations[result.questionId]}
                          onClick={() => handleGetExplanation(result.questionId)}
                          icon={<FaLightbulb />}
                          style={{ 
                            borderColor: '#1890ff',
                            color: explanations[result.questionId] ? '#52c41a' : '#1890ff'
                          }}
                        >
                          {explanations[result.questionId] ? 'Đã có giải thích' : 'Lấy giải thích từ DB'}
                        </Button>
                      </div>
                      
                      {detailedFeedback[result.questionId] && (
                        <div className="detailed-feedback" style={{ marginTop: '12px', padding: '12px', background: '#f6f8fa', borderRadius: '6px' }}>
                          <div>
                            <strong>Phân tích AI:</strong> {detailedFeedback[result.questionId].aiFeedback}
                          </div>
                          {detailedFeedback[result.questionId].studyRecommendations?.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                              <strong>Gợi ý học tập:</strong>
                              <ul>
                                {detailedFeedback[result.questionId].studyRecommendations.map((tip, i) => (
                                  <li key={i}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Collapse.Panel>
              );
            })}
          </Collapse>
        ) : (
          // Fallback cho dữ liệu mẫu
          resultData.questions.map((q) => (
            <div className="question" key={q.id}>
              <div className="question-title">Câu {q.id}: {q.question}</div>
              <div className="question-answer">
                <span className="label">Câu trả lời của bạn:</span>
                <span className="incorrect">{q.yourAnswer}</span>
              </div>
              <div className="question-answer">
                <span className="label">Đáp án đúng:</span>
                <span className="correct">{q.correctAnswer}</span>
              </div>
              <div className="question-analysis">{q.analysis}</div>
            </div>
          ))
        )}
      </div>
      <div className="actions" ref={analysisRef}>
        <button className="btn btn--primary" onClick={handleSave}>
          <FaRegCheckSquare style={{ marginRight: 8 }} /> Lưu kết quả
        </button>
        <button className="btn btn--danger" onClick={() => handleExportPDF(displayData, isRealData)}>
          <FaRegFilePdf style={{ marginRight: 8 }} /> Tải file PDF
        </button>
      </div>
    </div>
  );
};

const Result = () => {
  return <LayoutContent layoutType={1} content1={<ResultContent />} />;
};

export default Result;
