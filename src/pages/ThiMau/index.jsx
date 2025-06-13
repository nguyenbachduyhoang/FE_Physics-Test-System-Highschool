import React, { useState } from "react";
import LayoutContent from "../../components/layoutContent";
import "./index.scss";
import { FaBookOpen, FaPlay, FaGraduationCap, FaMapMarkerAlt, FaEye } from "react-icons/fa";
import { Radio, Modal } from "antd";
import { useNavigate } from "react-router-dom";

const ThiMau = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const navigate = useNavigate();

  const tests = [
    {
      id: 1,
      title: "Đề Thi Cơ Học Lớp 10",
      subject:
        "Chuyển động thẳng đều và biến đổi đều - Khám phá các định luật cơ bản về chuyển động, vận tốc và gia tốc trong vật lý học lớp 10.",
      class: "10",
      topic: "Cơ học",
      difficulty: "Trung bình",
      attempts: 500,
      stats: [
        { label: "Câu hỏi", value: 20 },
        { label: "Phút", value: 45 },
        { label: "Điểm TB", value: 20 },
        { label: "Lượt làm", value: 500 },
      ],
      questions: [
        {
          id: 1,
          question: "Định luật Newton thứ nhất nói về điều gì?",
          options: [
            "Một vật sẽ giữ nguyên trạng thái chuyển động hoặc đứng yên nếu không có lực tác dụng.",
            "Một vật sẽ chuyển động mãi mãi nếu không có lực cản.",
            "Một vật sẽ tăng tốc khi có lực tác dụng.",
            "Một vật sẽ giảm tốc khi có lực cản.",
          ],
        },
        {
          id: 2,
          question: "Công thức tính lực hấp dẫn giữa hai vật là gì?",
          options: [
            "F = m × a",
            "F = G × (m1 × m2) / r²",
            "F = k × q1 × q2 / r²",
            "F = m × g",
          ],
        },
        {
          id: 4,
          question: "Đơn vị của công suất là gì?",
          options: [
            "Joule (J)",
            "Watt (W)",
            "F × k × q1 × q2 / r²",
            "F = m × g",
          ],
        },
        {
          id: 5,
          question: "Đơn vị của công suất là gì?",
          options: [
            "Joule (J)",
            "Watt (W)",
            "F × k × q1 × q2 / r²",
            "F = m × g",
          ],
        },
        {
          id: 6,
          question: "Đơn vị của công suất là gì?",
          options: [
            "Joule (J)",
            "Watt (W)",
            "F × k × q1 × q2 / r²",
            "F = m × g",
          ],
        },
        {
          id: 7,
          question: "Đơn vị của công suất là gì?",
          options: [
            "Joule (J)",
            "Watt (W)",
            "F × k × q1 × q2 / r²",
            "F = m × g",
          ],
        },
      ],
    },
    {
      id: 2,
      title: "Đề Thi Cơ Học Lớp 10",
      subject: "Chủ đề: Chuyển động thẳng đều và biến đổi đều",
      class: "10",
      topic: "Cơ học",
      difficulty: "Trung bình",
      attempts: 500,
      stats: [
        { label: "Câu hỏi", value: 20 },
        { label: "Phút", value: 45 },
        { label: "Điểm trung bình", value: 20 },
        { label: "Lượt làm", value: 500 },
      ],
      questions: [
        {
          id: 1,
          question: "Định luật Newton thứ nhất nói về điều gì?",
          options: [
            "Một vật sẽ giữ nguyên trạng thái chuyển động hoặc đứng yên nếu không có lực tác dụng.",
            "Một vật sẽ chuyển động mãi mãi nếu không có lực cản.",
            "Một vật sẽ tăng tốc khi có lực tác dụng.",
            "Một vật sẽ giảm tốc khi có lực cản.",
          ],
        },
        {
          id: 2,
          question: "Công thức tính lực hấp dẫn giữa hai vật là gì?",
          options: [
            "F = m × a",
            "F = G × (m1 × m2) / r²",
            "F = k × q1 × q2 / r²",
            "F = m × g",
          ],
        },
        {
          id: 3,
          question: "Đơn vị của công suất là gì?",
          options: [
            "Joule (J)",
            "Watt (W)",
            "F × k × q1 × q2 / r²",
            "F = m × g",
          ],
        },
      ],
    },
    {
      id: 3,
      title: "Đề Thi Cơ Học Lớp 10",
      subject: "Chủ đề: Chuyển động thẳng đều và biến đổi đều",
      class: "10",
      topic: "Cơ học",
      difficulty: "Trung bình",
      attempts: 500,
      stats: [
        { label: "Câu hỏi", value: 20 },
        { label: "Phút", value: 45 },
        { label: "Điểm trung bình", value: 20 },
        { label: "Lượt làm", value: 500 },
      ],
    },
    {
      id: 4,
      title: "Đề Thi Cơ Học Lớp 10",
      subject: "Chủ đề: Chuyển động thẳng đều và biến đổi đều",
      class: "10",
      topic: "Cơ học",
      difficulty: "Trung bình",
      attempts: 500,
      stats: [
        { label: "Câu hỏi", value: 20 },
        { label: "Phút", value: 45 },
        { label: "Điểm trung bình", value: 20 },
        { label: "Lượt làm", value: 500 },
      ],
    },
    {
      id: 5,
      title: "Đề Thi Cơ Học Lớp 10",
      subject: "Chủ đề: Chuyển động thẳng đều và biến đổi đều",
      class: "10",
      topic: "Cơ học",
      difficulty: "Trung bình",
      attempts: 500,
      stats: [
        { label: "Câu hỏi", value: 20 },
        { label: "Phút", value: 45 },
        { label: "Điểm trung bình", value: 20 },
        { label: "Lượt làm", value: 500 },
      ],
    },
    {
      id: 6,
      title: "Đề Thi Cơ Học Lớp 10",
      subject: "Chủ đề: Chuyển động thẳng đều và biến đổi đều",
      class: "10",
      topic: "Cơ học",
      difficulty: "Trung bình",
      attempts: 500,
      stats: [
        { label: "Câu hỏi", value: 20 },
        { label: "Phút", value: 45 },
        { label: "Điểm trung bình", value: 20 },
        { label: "Lượt làm", value: 500 },
      ],
    },
    {
      id: 7,
      title: "Đề Thi Cơ Học Lớp 10",
      subject: "Chủ đề: Chuyển động thẳng đều và biến đổi đều",
      class: "10",
      topic: "Cơ học",
      difficulty: "Trung bình",
      attempts: 500,
      stats: [
        { label: "Câu hỏi", value: 20 },
        { label: "Phút", value: 45 },
        { label: "Điểm trung bình", value: 20 },
        { label: "Lượt làm", value: 500 },
      ],
    },
    {
      id: 8,
      title: "Đề Thi Cơ Học Lớp 10",
      subject: "Chủ đề: Chuyển động thẳng đều và biến đổi đều",
      class: "10",
      topic: "Cơ học",
      difficulty: "Trung bình",
      attempts: 500,
      stats: [
        { label: "Câu hỏi", value: 20 },
        { label: "Phút", value: 45 },
        { label: "Điểm trung bình", value: 20 },
        { label: "Lượt làm", value: 500 },
      ],
    },

    // Thêm các đề thi khác nếu cần
  ];

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
                          onClick={() => navigate("/quiz")}
                        >
                          <FaPlay /> Làm bài
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
