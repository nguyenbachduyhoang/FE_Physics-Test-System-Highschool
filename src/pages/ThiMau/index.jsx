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
  const navigate = useNavigate();
  const location = useLocation();

  // Load filtered exams from API based on URL params
  useEffect(() => {
    loadFilteredExams();
  }, [location.search]);

  const loadFilteredExams = async () => {
    try {
      setLoading(true);
      
      // Parse URL params for filters
      const searchParams = new URLSearchParams(location.search);
      const filters = {
        grade: searchParams.get('grade') || '',
        subject: searchParams.get('subject') || '',
        difficulty: searchParams.get('difficulty') || ''
      };

      // BƯỚC 2: Thử API debug trước
      let examsData = await analyticsService.getSampleExams(filters);

      // BƯỚC 3: Nếu debug API không có dữ liệu, thử API gốc
      if (!examsData || examsData.length === 0) {
        examsData = await analyticsService.getSampleExams(filters);
      }

      // BƯỚC 4: Nếu vẫn không có dữ liệu, thử lấy tất cả (không filter)
      if (!examsData || examsData.length === 0) {
        examsData = await analyticsService.getSampleExams({});
      }
      
      const transformedTests = (examsData || []).map(exam => ({
        id: exam.examId,
        title: exam.examName,
        subject: exam.description || "Đề thi vật lý",
        class: exam.grade || "10-12",
        topic: exam.subject || "Vật lý", 
        difficulty: exam.difficulty || "Trung bình",
        attempts: 0,
        stats: [
          { label: "Câu hỏi", value: exam.questionCount || 0 },
          { label: "Phút", value: exam.duration || 45 },
          { label: "Điểm TB", value: 0 },
          { label: "Lượt làm", value: 0 },
        ],
        questions: [] // Will be loaded when needed
      }));
      
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

  

  const handleViewDetails = (test) => {
    setSelectedTest(test);
    setIsModalVisible(true);
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
                      {/* Thay thế tiến độ hoàn thành bằng ghi chú hoặc thông tin khác */}
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
                        {[0, 1, 2, 3].map((idx) => (
                          <div className="stat-box" key={idx}>
                            <div className="stat-value">
                              {test.stats && test.stats[idx]
                                ? test.stats[idx].value
                                : "--"}
                            </div>
                            <div className="stat-label">
                              {test.stats && test.stats[idx]
                                ? test.stats[idx].label
                                : ""}
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
        {selectedTest?.questions?.map((question) => (
          <div key={question.id} className="question-card">
            <h3>{`Câu ${question.id}: ${question.question}`}</h3>
            <p>Chọn đáp án đúng:</p>
            <div className="options-group">
              <Radio.Group
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                {question.options.map((option, index) => (
                  <Radio key={index} value={option}>
                    {option}
                  </Radio>
                ))}
              </Radio.Group>
            </div>
          </div>
        ))}
      </Modal>
    </>
  );
};

export default ThiMau;
