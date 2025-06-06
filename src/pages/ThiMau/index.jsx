import React, { useState } from "react";
import LayoutContent from "../../components/layoutContent";
import "./index.scss";
import { FaBookOpen, FaPlay } from "react-icons/fa";
import { Radio } from "antd";
import CustomModal from "./CustomModal";
import { useNavigate } from "react-router-dom";

const ThiMau = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const navigate = useNavigate();

  const tests = [
    {
      id: 1,
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
                <div key={test.id} className="test-card">
                  <div className="card-header">
                    <h3>{test.title}</h3>
                    <p>{test.subject}</p>
                  </div>
                  <div className="card-body">
                    <div className="card-stats">
                      {test.stats.map((stat, index) => (
                        <div key={index} className="stat-item">
                          <span className="stat-value">{stat.value}</span>
                          <span className="stat-label">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="card-details">
                      <p>
                        <strong>Lớp:</strong> {test.class}
                      </p>
                      <p>
                        <strong>Chủ đề:</strong> {test.topic}
                      </p>
                      <p>
                        <strong>Độ khó:</strong> {test.difficulty}
                      </p>
                      <p>
                        <strong>Lượt làm:</strong> {test.attempts}
                      </p>
                    </div>
                    <div className="card-actions">
                      <button
                        className="btn btn-details"
                        onClick={() => handleViewDetails(test)}
                      >
                        <FaBookOpen /> Chi tiết
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
              ))}
            </div>
          </div>
        }
      />

      <CustomModal
        open={isModalVisible}
        onClose={handleModalClose}
        title={selectedTest?.title}
        subject={selectedTest?.subject}
      >
        {selectedTest?.questions.map((question) => (
          <div key={question.id} className="question-card">
            <h3>{`Câu ${question.id}: ${question.question}`}</h3>
            <p>Chọn đáp án đúng:</p>
            <div className="options-group">
              <Radio.Group className="options-group">
                {question.options.map((option, index) => (
                  <Radio key={index} value={option}>
                    {option}
                  </Radio>
                ))}
              </Radio.Group>
            </div>
          </div>
        ))}
      </CustomModal>
    </>
  );
};

export default ThiMau;
