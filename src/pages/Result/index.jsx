/* eslint-disable no-unused-vars */
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
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { autoGradingService, explanationService } from "../../services";
import { Modal, Spin, Alert, Collapse, Tag, Progress, Divider, Button, Tooltip } from "antd";
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
  const [activeCollapseKeys, setActiveCollapseKeys] = useState([]);
  const [error, setError] = useState(null);

  // Thêm refs cho animation
  const statsRef = useRef(null);
  const titleRef = useRef(null);
  const analysisRef = useRef(null);
  const questionsRef = useRef(null);

  useEffect(() => {
    const loadGradingResults = async () => {
      try {
        setLoading(true);
        console.log('🔍 Result component: Loading grading results...');
        console.log('📍 Current URL:', window.location.pathname);
        
        // Thứ tự ưu tiên đọc data:
        // 1. Navigation state
        // 2. resultPageData từ localStorage
        // 3. latestGradingResult từ localStorage
        // 4. fallbackNavigationData từ localStorage
        
        let results = null;
        let examData = null;
        let timeTaken = null;
        
        // 1. Thử navigation state trước
        if (location.state?.gradingResults) {
          results = location.state.gradingResults;
          examData = location.state.examData;
          timeTaken = location.state.timeTaken;
          console.log('✅ Using navigation state:', results);
        }
        
        // 2. Thử resultPageData
        if (!results) {
          const resultPageData = localStorage.getItem('resultPageData');
          console.log('💾 ResultPageData from localStorage:', resultPageData);
          if (resultPageData) {
            try {
              const parsedData = JSON.parse(resultPageData);
              results = parsedData.gradingResults;
              examData = parsedData.examData;
              timeTaken = parsedData.timeTaken;
              console.log('✅ Using resultPageData:', results);
              // Cleanup sau khi đọc
              localStorage.removeItem('resultPageData');
            } catch (parseError) {
              console.error('Error parsing resultPageData:', parseError);
            }
          }
        }
        
        // 3. Thử latestGradingResult
        if (!results) {
          const savedResults = localStorage.getItem('latestGradingResult');
          console.log('💾 LatestGradingResult from localStorage:', savedResults);
          if (savedResults) {
            try {
              results = JSON.parse(savedResults);
              console.log('✅ Using latestGradingResult:', results);
            } catch (parseError) {
              console.error('Error parsing latestGradingResult:', parseError);
            }
          }
        }

        // 4. Thử fallback data
        if (!results) {
          const fallbackData = localStorage.getItem('fallbackNavigationData');
          if (fallbackData) {
            try {
              const parsedFallback = JSON.parse(fallbackData);
              results = parsedFallback.gradingResults;
              examData = parsedFallback.examData;
              timeTaken = parsedFallback.timeTaken;
              localStorage.removeItem('fallbackNavigationData'); // Cleanup
              console.log('✅ Using fallbackNavigationData:', results);
            } catch (parseError) {
              console.error('Error parsing fallbackNavigationData:', parseError);
            }
          }
        }

        if (results) {
          console.log('🎉 Final results data:', results);
          setGradingData(results);
          // Tự động load explanation cho tất cả câu hỏi
          if (results.questionResults && results.questionResults.length > 0) {
            results.questionResults.forEach(async (result, index) => {
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
          console.warn('⚠️ No grading results found, using demo data');
          // Fallback to demo data if no grading results
          setGradingData(null);
        }

        setError(null);
      } catch (err) {
        console.error('❌ Error loading results:', err);
        setError('Không thể tải kết quả bài thi');
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

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <Spin size="large" />
        <div style={{ color: '#666', fontSize: '16px' }}>Đang tải kết quả bài thi...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <Alert 
          message="Lỗi tải dữ liệu" 
          description={error}
          type="error" 
          showIcon 
        />
        <Button type="primary" onClick={() => navigate('/home')}>
          Về trang chủ
        </Button>
      </div>
    );
  }

  // Sử dụng dữ liệu thực từ auto grading hoặc fallback
  const displayData = gradingData || resultData;
  const isRealData = !!gradingData;

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
          <div className={`stats-subtitle ${isRealData 
            ? (displayData.percentageScore >= 80 ? 'success' : 
               displayData.percentageScore >= 60 ? 'warning' : 'error')
            : 'error'
          }`}>
            {isRealData 
              ? `${displayData.percentageScore?.toFixed(1)}% - ${autoGradingService.getGradeText(displayData.grade)}`
              : "30.0% - Yếu"
            }
          </div>
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
          <Progress 
            percent={isRealData 
              ? Math.round((displayData.correctAnswers / displayData.totalQuestions) * 100)
              : 30
            } 
            showInfo={false} 
            strokeColor={isRealData 
              ? (displayData.percentageScore >= 80 ? "#52c41a" : 
                 displayData.percentageScore >= 60 ? "#faad14" : "#ff4d4f")
              : "#19d6b4"
            } 
          />
        </div>

        <div className="stats-card">
          <FaChartLine className="stats-icon" />
          <div className="stats-label">Thời gian làm bài</div>
          <div className="stats-value">
            {isRealData ? (displayData.timeTaken || location.state?.timeTaken || "N/A") : "N/A"}
          </div>
          {isRealData && (displayData.timeTaken || location.state?.timeTaken) && (
            <div className="stats-subtitle">
              Hoàn thành
            </div>
          )}
        </div>

        <div className="stats-card">
          <FaTrophy className="stats-icon" />
          <div className="stats-label">Hiệu suất</div>
          <div className="stats-value">
            {isRealData 
              ? (displayData.analysis?.performanceLevel || autoGradingService.getPerformanceLevelText(displayData.analysis?.performanceLevel) || "Trung bình")
              : "Chưa xác định"
            }
          </div>
          <div className={`stats-subtitle ${isRealData 
            ? (displayData.percentageScore >= 90 ? 'success' : 
               displayData.percentageScore >= 70 ? 'warning' : 'error')
            : 'error'
          }`}>
            {isRealData 
              ? (displayData.percentageScore >= 90 ? "Xuất sắc" :
                 displayData.percentageScore >= 80 ? "Giỏi" :
                 displayData.percentageScore >= 70 ? "Khá" :
                 displayData.percentageScore >= 60 ? "Trung bình" : "Cần cải thiện")
              : "Chưa xác định"
            }
          </div>
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
              {isRealData && displayData.analysis?.recommendations?.length > 0 ? (
                displayData.analysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))
              ) : (
                <>
                  <li>Cần tập trung ôn tập các chủ đề: Điện học, Từ học</li>
                  <li>Cần luyện tập thêm các bài tập khó</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="study-plan">
          <h3>
            <FaChartLine /> Kế hoạch học tập
          </h3>
          {isRealData && displayData.analysis?.studyPlan?.length > 0 ? (
            <ul>
              {displayData.analysis.studyPlan.map((plan, index) => (
                <li key={index}>{plan}</li>
              ))}
            </ul>
          ) : (
            <p>Xem lại lý thuyết và làm thêm bài tập về các chủ đề trên. Tăng dần độ khó của bài tập khi luyện tập</p>
          )}
        </div>

        <div className="difficulty-analysis">
          <h3>Phân tích theo độ khó:</h3>
          <div className="difficulty-tags">
            {isRealData && displayData.difficultyBreakdown ? (
              Object.entries(displayData.difficultyBreakdown).map(([difficulty, count]) => (
                <div key={difficulty} className={`difficulty-tag ${difficulty.toLowerCase().replace('_', '-')}`}>
                  <span>{difficulty === 'easy' ? 'Dễ' : 
                         difficulty === 'medium' ? 'Trung bình' : 
                         difficulty === 'hard' ? 'Khó' : 
                         difficulty === 'very_easy' ? 'Rất dễ' :
                         difficulty === 'very_hard' ? 'Rất khó' : difficulty}:</span> {count} câu
                </div>
              ))
            ) : (
              <>
                <div className="difficulty-tag easy">
                  <span>Dễ:</span> 1 câu đúng
                </div>
                <div className="difficulty-tag medium">
                  <span>Trung bình:</span> 2 câu đúng
                </div>
                <div className="difficulty-tag hard">
                  <span>Khó:</span> 1 câu đúng
                </div>
                <div className="difficulty-tag very-hard">
                  <span>Rất khó:</span> 6 câu đúng
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="section-title">
          <FaExclamationTriangle style={{ marginRight: '8px' }} />
          Phân tích chi tiết câu hỏi
          {isRealData && displayData.questionResults && (
            <span style={{ 
              fontSize: '0.8rem', 
              fontWeight: 'normal', 
              color: '#666',
              marginLeft: '8px',
              background: '#f0f0f0',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              {activeCollapseKeys.length}/{displayData.questionResults.length} đang mở
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isRealData && displayData.questionResults && displayData.questionResults.length > 0 && (
            <>
              <Tooltip title={activeCollapseKeys.length === displayData.questionResults.length ? 'Đóng tất cả câu hỏi' : 'Mở tất cả câu hỏi'}>
                <button 
                  // className="btn btn--small"
                  className="btn btn--secondary"
                  onClick={() => {
                    const allKeys = displayData.questionResults.map(result => result.questionId);
                    const isClosingAll = activeCollapseKeys.length === allKeys.length;
                    
                    if (isClosingAll) {
                      // Đóng tất cả với animation
                      setActiveCollapseKeys([]);
                      toast.success('Đã đóng tất cả câu hỏi');
                    } else {
                      // Mở tất cả với animation
                      setActiveCollapseKeys(allKeys);
                      toast.success(`Đã mở tất cả ${allKeys.length} câu hỏi`);
                    }
                  }}
                >
                  {activeCollapseKeys.length === displayData.questionResults.length ? (
                    <>
                      <FaEyeSlash style={{ marginRight: '6px' }} />
                      Đóng tất cả
                    </>
                  ) : (
                    <>
                      <FaEye style={{ marginRight: '6px' }} />
                      Mở tất cả
                    </>
                  )}
                </button>
              </Tooltip>
              {/* <button 
                className="btn btn--secondary"
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
              >
                {showDetailedAnalysis ? 'Ẩn phân tích AI' : 'Xem phân tích AI'}
              </button> */}
            </>
          )}
        </div>
      </div>

      <div className="questions" ref={questionsRef}>
        {isRealData && displayData.questionResults ? (
          <Collapse 
            ghost
            activeKey={activeCollapseKeys}
            onChange={setActiveCollapseKeys}
          >
            {displayData.questionResults.map((result, index) => {
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
                      {result.questionType === 'essay' 
                        ? (result.studentChoiceText || result.studentTextAnswer || "Không có câu trả lời")
                        : (result.studentChoiceLabel && result.studentChoiceText 
                            ? `${result.studentChoiceLabel}. ${result.studentChoiceText}`
                            : result.studentChoiceText || "Không có câu trả lời"
                          )
                      }
                    </span>
                  </div>
                  <div className="question-answer">
                    <span className="label">Đáp án đúng:</span>
                    <span className="correct">
                      {result.questionType === 'essay' 
                        ? (result.correctChoiceText || "Câu hỏi tự luận - xem hướng dẫn chi tiết")
                        : (result.correctChoiceLabel && result.correctChoiceText 
                            ? `${result.correctChoiceLabel}. ${result.correctChoiceText}`
                            : result.correctChoiceText || "Không xác định được đáp án"
                          )
                      }
                    </span>
                  </div>
                  {result.explanation && (
                    <div className="question-analysis">
                      <strong>Giải thích:</strong> {result.explanation}
                    </div>
                  )}
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
