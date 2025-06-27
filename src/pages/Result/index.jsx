import React, { useState, useEffect } from "react";
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
import { autoGradingService } from "../../services";
import { Modal, Spin, Alert, Collapse, Tag, Progress, Divider } from "antd";
import toast from "react-hot-toast";


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

        if (results) {
          setGradingData(results);
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

  return (
    <div className="result">
      <h1 className="title">
        {isRealData ? `Kết Quả Bài Thi - ${displayData.examName || 'PhyGen'}` : 'Kết Quả Bài Thi - PhyGen (Mẫu)'}
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

      <div className="stats">
        <div className="stats-card">
          <FaRocket className="stats-icon" />
          <div className="stats-label">Điểm số</div>
          <div className="stats-value">
            {isRealData 
              ? `${displayData.totalPointsEarned?.toFixed(1) || 0} / ${displayData.maxPossiblePoints?.toFixed(1) || 10}`
              : `${resultData.score} / ${resultData.total}`
            }
          </div>
          {isRealData && (
            <div className="stats-subtitle">
              <Tag color={displayData.percentageScore >= 80 ? 'green' : displayData.percentageScore >= 60 ? 'orange' : 'red'}>
                {displayData.percentageScore?.toFixed(1)}% - {autoGradingService.getGradeText(displayData.grade)}
              </Tag>
            </div>
          )}
        </div>
        <div className="stats-card">
          <FaUsers className="stats-icon" />
          <div className="stats-label">Số câu đúng</div>
          <div className="stats-value">
            {isRealData 
              ? `${displayData.correctAnswers || 0} / ${displayData.totalQuestions || 0}`
              : `${resultData.correct} / ${resultData.totalQuestions}`
            }
          </div>
          {isRealData && (
            <Progress 
              percent={displayData.totalQuestions > 0 ? (displayData.correctAnswers / displayData.totalQuestions * 100) : 0}
              size="small"
              status={displayData.correctAnswers / displayData.totalQuestions >= 0.8 ? 'success' : 'normal'}
            />
          )}
        </div>
        <div className="stats-card">
          <FaChartLine className="stats-icon" />
          <div className="stats-label">Thời gian làm bài</div>
          <div className="stats-value">
            {isRealData ? (displayData.timeTaken || 'N/A') : resultData.time}
          </div>
        </div>
        {isRealData && (
          <div className="stats-card">
            <FaTrophy className="stats-icon" />
            <div className="stats-label">Hiệu suất</div>
            <div className="stats-value">
              <Tag color={
                displayData.analysis?.performanceLevel === 'Excellent' ? 'gold' :
                displayData.analysis?.performanceLevel === 'Good' ? 'green' :
                displayData.analysis?.performanceLevel === 'Average' ? 'blue' : 'red'
              }>
                {autoGradingService.getPerformanceLevelText(displayData.analysis?.performanceLevel)}
              </Tag>
            </div>
          </div>
        )}
      </div>
      <h2 className="section-title">
        <FaBrain style={{ marginRight: '8px' }} />
        Phân tích & Thống kê
      </h2>
      
      {isRealData && displayData.analysis ? (
        <div className="ai-analysis">
          <div className="tip">
            <FaLightbulb style={{ marginRight: '8px', color: '#faad14' }} />
            <strong>Gợi ý luyện tập:</strong>
            <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
              {displayData.analysis.recommendations?.map((rec, index) => (
                <li key={index}>{rec}</li>
              )) || <li>Tiếp tục luyện tập để cải thiện kỹ năng</li>}
            </ul>
          </div>
          
          {displayData.analysis.studyPlan && (
            <div className="tip">
              <span role="img" aria-label="system">📚</span>
              <strong>Kế hoạch học tập:</strong> {displayData.analysis.studyPlan}
            </div>
          )}

          {displayData.difficultyBreakdown && Object.keys(displayData.difficultyBreakdown).length > 0 && (
            <div className="difficulty-breakdown">
              <h3>Phân tích theo độ khó:</h3>
              {Object.entries(displayData.difficultyBreakdown).map(([level, count]) => (
                <Tag key={level} color="blue" style={{ margin: '4px' }}>
                  {level}: {count} câu đúng
                </Tag>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="tip">
            <FaLightbulb style={{ marginRight: '8px', color: '#faad14' }} />
            Gợi ý luyện tập: {resultData.suggestions[0]}
          </div>
          <div className="tip">
            <span role="img" aria-label="system">📝</span>
            Hệ thống có thể tạo đề luyện tương tự theo chủ đề này.{" "}
            <a href="#" className="link">[Làm đề tương tự]</a>
          </div>
        </div>
      )}

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

      <div className="questions">
        {isRealData && displayData.questionResults ? (
          <Collapse ghost>
            {displayData.questionResults.map((result, index) => (
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
                      {result.studentChoiceLabel}. {result.studentChoiceText}
                    </span>
                  </div>
                  <div className="question-answer">
                    <span className="label">Đáp án đúng:</span>
                    <span className="correct">
                      {result.correctChoiceLabel}. {result.correctChoiceText}
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
                  
                  {showDetailedAnalysis && (
                    <div style={{ marginTop: '12px' }}>
                      <button 
                        className="btn btn--small"
                        onClick={() => handleGetDetailedFeedback(result.questionId, result.studentChoiceId)}
                      >
                        Xem phân tích chi tiết
                      </button>
                      
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
            ))}
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
      <div className="actions">
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
