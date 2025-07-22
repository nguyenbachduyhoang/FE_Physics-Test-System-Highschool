import React, { useState, useEffect } from "react";
import LayoutContent from "../../components/layoutContent";
import "./index.scss";
import { FaBookOpen, FaPlay, FaGraduationCap, FaMapMarkerAlt, FaEye } from "react-icons/fa";
import { Radio, Modal, Spin, Alert } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { analyticsService } from "../../services";
import toast from "react-hot-toast";

const ThiMau = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadFilteredExams();
  }, [location.search]);

  const loadFilteredExams = async () => {
    try {
      setLoading(true);
      
      const searchParams = new URLSearchParams(location.search);
      const filters = {
        grade: searchParams.get('grade') ? parseInt(searchParams.get('grade')) : null,
        chapterId: searchParams.get('chapterId') || '',
        difficulty: searchParams.get('difficulty') || ''
      };

      console.log('🔍 SampleTest - Applying filters:', filters);

      // Gọi API với filters
      let examsData = await analyticsService.getSampleExams(filters);

      console.log('📊 SampleTest - API Response:', examsData);

      // Nếu không có dữ liệu với filter, thử lấy tất cả
      if (!examsData || examsData.length === 0) {
        console.log('⚠️ SampleTest - No data with filters, trying without filters');
        examsData = await analyticsService.getSampleExams({});
      }
      
      const transformedTests = (examsData || []).map(exam => {
        // Map difficulty từ API sang tiếng Việt
        const difficultyMap = {
          'easy': 'Dễ',
          'medium': 'Trung bình', 
          'hard': 'Khó'
        };
        
        // Lấy thông tin từ URL params để tạo tiêu đề động
        const searchParams = new URLSearchParams(location.search);
        const filterGrade = searchParams.get('grade');
        const filterDifficulty = searchParams.get('difficulty');
        
        // Tạo tiêu đề động dựa trên filter
        let dynamicTitle = "Đề thi AI";
        if (filterGrade) {
          dynamicTitle += ` - Lớp ${filterGrade}`;
        }
        if (filterDifficulty) {
          const difficultyText = difficultyMap[filterDifficulty] || filterDifficulty;
          dynamicTitle += ` (${difficultyText})`;
        }
        
        return {
          id: exam.examId,
          title: dynamicTitle,
          subject: exam.description || "Đề thi vật lý",
          class: exam.grade ? `Lớp ${exam.grade}` : "10-12",
          topic: exam.subject || "Vật lý", 
          difficulty: difficultyMap[exam.difficulty] || exam.difficulty || "Trung bình",
          attempts: 0,
          stats: [
            { label: "Câu hỏi", value: exam.questionCount || 0 },
            { label: "Phút", value: exam.duration || 45 },
            { label: "Điểm TB", value: 0 },
            { label: "Lượt làm", value: 0 },
          ],
          questions: [] // Will be loaded when needed
        };
      });
      
      setTests(transformedTests);
    } catch (err) {
      console.error('Load filtered exams error:', err);
      toast.error('Không thể tải danh sách đề thi');
      // Fallback to empty list
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (test) => {
    setSelectedTest({ ...test, questions: [] });
    setIsModalVisible(true);
    setLoadingQuestions(true);

    try {
      const examDetails = await analyticsService.getExamById(test.id);
      // Kiểm tra cấu trúc response - có thể là examDetails.questions hoặc examDetails.data.questions
      let questions = null;
      if (examDetails && examDetails.questions) {
        questions = examDetails.questions;
      } else if (examDetails && examDetails.data && examDetails.data.questions) {
        questions = examDetails.data.questions;
      }

      
      if (questions && questions.length > 0) {
        
        // Map API response to component format
        const mappedQuestions = questions.map((examQuestion, index) => {
          console.log(`📝 Question ${index + 1}:`, examQuestion.question);
          return {
            id: index + 1,
            questionText: examQuestion.question?.questionText || 'Câu hỏi không có nội dung',
            options: examQuestion.question?.answerChoices?.map(choice => 
              `${choice.choiceLabel}. ${choice.choiceText}`
            ) || [],
            correctAnswer: examQuestion.question?.answerChoices?.find(choice => 
              choice.isCorrect
            )?.choiceLabel || 'A'
          };
        });
        
        console.log('🎯 SampleTest - Mapped questions:', mappedQuestions);
        
        setSelectedTest(prev => ({
          ...prev,
          questions: mappedQuestions
        }));
      } else {
        console.log('⚠️ SampleTest - No questions found in response:', examDetails);
        toast.error('Đề thi này chưa có câu hỏi');
        setSelectedTest(prev => ({
          ...prev,
          questions: []
        }));
      }
    } catch (error) {
      console.error('Error loading exam details:', error);
      toast.error('Không thể tải chi tiết đề thi');
      setSelectedTest(prev => ({
        ...prev,
        questions: []
      }));
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedTest(null);
  };

  return (
    <>
      <LayoutContent
        layoutType={1}
        content1={
          <div>
            <h1 className="title">Danh Sách Đề Thi Mẫu</h1>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <p style={{ marginTop: '16px' }}>Đang tải đề thi...</p>
              </div>
            ) : tests.length === 0 ? (
              <Alert
                message="Không tìm thấy đề thi"
                description="Không có đề thi nào phù hợp với bộ lọc của bạn. Vui lòng thử lại với điều kiện khác."
                type="info"
                showIcon
                style={{ marginTop: '20px' }}
              />
            ) : (
              <div className="test-list">
                {tests.map((test) => (
                <div key={test.id} className="test-card custom-layout">
                  <div className="test-card-header">
                    <div className="test-card-title">{test.title}</div>
                    <div className="test-card-meta">
                      <span>
                        <FaBookOpen /> Chủ đề: {test.topic}
                      </span>
                      <span>
                        <FaGraduationCap /> Lớp: {test.class}
                      </span>
                      <span>
                        <FaMapMarkerAlt /> Độ khó: {test.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="test-card-content">
                    <div className="test-card-main">
                      <div className="test-card-section">
                        <div className="section-title">
                          <span role="img" aria-label="book">
                            🧑‍🏫
                          </span>{" "}
                          Chủ đề chính
                        </div>
                        <div className="section-desc">{test.subject}</div>
                      </div>
                      <div className="test-card-section note-section">
                        <div
                          className="section-title"
                        >
                          <span role="img" aria-label="note">
                            📝
                          </span>{" "}
                          Ghi chú đề thi
                        </div>
                        <div className="section-desc">
                          Đề thi phù hợp cho học sinh ôn tập cuối kỳ, bám sát
                          chương trình SGK.
                        </div>
                      </div>
                    </div>
                    <div className="test-card-side">
                      <div className="test-card-stats">
                        {test.stats.map((stat, idx) => (
                          <div className="stat-box" key={idx}>
                            <div className="stat-value">
                              {stat.value}
                            </div>
                            <div className="stat-label">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="test-card-actions">
                        <button
                          className="btn btn-details"
                          onClick={() => handleViewDetails(test)}
                        >
                          <FaEye /> Xem trước
                        </button>
                        <button
                          className="btn btn-take-test"
                          onClick={() => navigate(`/quiz/${test.id}`)}
                        >
                          <FaPlay /> Làm bài
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        }
      />

      <Modal
        title={
          <span style={{ fontSize: 24, color: "orange", fontWeight: 700 }}>
            {selectedTest?.title}
          </span>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={950}
        centered
        styles={{ body: { maxHeight: "80vh", overflowY: "auto", padding: 4 } }}
      >
        <div className="modal-subject">{selectedTest?.subject}</div>
        {loadingQuestions ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Đang tải chi tiết đề thi...</p>
          </div>
        ) : selectedTest?.questions?.length > 0 ? (
          selectedTest.questions.map((question) => (
            <div key={question.id} className="question-card">
              <h3>{`Câu ${question.id}: ${question.questionText}`}</h3>
              <p>Chọn đáp án đúng:</p>
              <div className="options-group">
                <Radio.Group
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {(question.options || []).map((option, index) => (
                    <Radio key={index} value={option}>
                      {option}
                    </Radio>
                  ))}
                </Radio.Group>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p style={{ color: '#999', fontSize: '16px' }}>
              Đề thi này chưa có câu hỏi hoặc chưa được tạo hoàn chỉnh.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ThiMau;
