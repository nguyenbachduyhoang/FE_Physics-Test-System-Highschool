import React from "react";
import LayoutContent from "../../components/layoutContent";
import "./index.scss";
import {
  FaRocket,
  FaUsers,
  FaChartLine,
  FaRegCheckSquare,
  FaRegFilePdf,
} from "react-icons/fa";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";

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

const handleExportPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Kết Quả Bài Thi - PhyGen", 20, 20);
  doc.setFontSize(12);
  doc.text(`Điểm số: ${resultData.score} / ${resultData.total}`, 20, 40);
  doc.text(
    `Số câu đúng: ${resultData.correct} / ${resultData.totalQuestions}`,
    20,
    50
  );
  doc.text(`Thời gian làm bài: ${resultData.time}`, 20, 60);
  doc.save("ket-qua-phygen.pdf");
};

const ResultContent = () => {
  const navigate = useNavigate();

  const handleSave = () => {
    alert("Lưu kết quả thành công!");
    navigate("/history");
  };

  return (
    <div className="result">
      <h1 className="title">Kết Quả Bài Thi - PhyGen</h1>
      <div className="stats">
        <div className="stats-card">
          <FaRocket className="stats-icon" />
          <div className="stats-label">Điểm số</div>
          <div className="stats-value">
            {resultData.score} / {resultData.total}
          </div>
        </div>
        <div className="stats-card">
          <FaUsers className="stats-icon" />
          <div className="stats-label">Số câu đúng</div>
          <div className="stats-value">
            {resultData.correct} / {resultData.totalQuestions}
          </div>
        </div>
        <div className="stats-card">
          <FaChartLine className="stats-icon" />
          <div className="stats-label">Thời gian làm bài</div>
          <div className="stats-value">{resultData.time}</div>
        </div>
      </div>
      <h2 className="section-title">Phân tích & Thống kê</h2>
      <div className="tip">
        <span role="img" aria-label="bulb">
          💡
        </span>{" "}
        Gợi ý luyện tập: {resultData.suggestions[0]}
      </div>
      <div className="tip">
        <span role="img" aria-label="system">
          📝
        </span>{" "}
        Hệ thống có thể tạo đề luyện tương tự theo chủ đề này.{" "}
        <a href="#" className="link">
          [Làm đề tương tự]
        </a>
      </div>
      <h2 className="section-title">Phân tích chi tiết câu hỏi</h2>
      <div className="questions">
        {resultData.questions.map((q) => (
          <div className="question" key={q.id}>
            <div className="question-title">
              Câu {q.id}: {q.question}
            </div>
            <div className="question-answer">
              <span className="label">Câu trả lời của bạn:</span>{" "}
              <span className="incorrect">{q.yourAnswer}</span>
            </div>
            <div className="question-answer">
              <span className="label">Đáp án đúng:</span>{" "}
              <span className="correct">{q.correctAnswer}</span>
            </div>
            <div className="question-analysis">{q.analysis}</div>
          </div>
        ))}
      </div>
      <div className="actions">
        <button className="btn btn--primary" onClick={handleSave}>
          <FaRegCheckSquare style={{ marginRight: 8 }} /> Lưu kết quả
        </button>
        <button className="btn btn--danger" onClick={handleExportPDF}>
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
