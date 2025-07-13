import React, { useState } from "react";
import "./index.scss";

const faqData = [
  {
    question: "Làm thế nào để tạo đề thi?",
    answer: (
      <>
        <p>Để tạo đề thi mới, bạn làm theo các bước sau:</p>
        <ul>
          <li>Truy cập mục <b>"Tạo đề thi"</b> trong thanh menu.</li>
          <li>Điền đầy đủ thông tin về đề thi như tên đề, thời lượng, mô tả.</li>
          <li>Chọn câu hỏi từ ngân hàng hoặc tạo mới.</li>
          <li>Bấm <b>"Lưu & Xuất bản"</b> để hoàn tất.</li>
        </ul>
      </>
    ),
  },
  {
    question: "Làm sao để liên hệ hỗ trợ?",
    answer: (
      <>
        <p>Nếu gặp bất kỳ sự cố nào, bạn có thể liên hệ qua:</p>
        <ul>
          <li>Email: <a href="mailto:support@phygen.vn">support@phygen.vn</a></li>
          <li>Hotline: 1900 1234 (8:00 - 18:00, Thứ 2 đến Thứ 6)</li>
        </ul>
      </>
    ),
  },
  {
    question: "Tôi có thể chỉnh sửa câu hỏi sau khi đã lưu không?",
    answer: (
      <>
        <p>Có. Để chỉnh sửa câu hỏi, bạn làm như sau:</p>
        <ul>
          <li>Vào mục <b>"Ngân hàng câu hỏi"</b>.</li>
          <li>Tìm câu hỏi bạn muốn chỉnh sửa theo từ khóa hoặc bộ lọc.</li>
          <li>Bấm nút <b>"Chỉnh sửa"</b> và cập nhật nội dung câu hỏi.</li>
          <li>Bấm <b>"Lưu thay đổi"</b>.</li>
        </ul>
      </>
    ),
  },
  {
    question: "Tôi có thể thêm nhiều học sinh vào lớp như thế nào?",
    answer: (
      <>
        <p>Để thêm học sinh vào lớp học:</p>
        <ul>
          <li>Truy cập mục <b>"Lớp học"</b>.</li>
          <li>Chọn lớp bạn muốn thêm học sinh.</li>
          <li>Bấm <b>"Thêm học sinh"</b>.</li>
          <li>Nhập email học sinh hoặc gửi mã lớp để học sinh tự tham gia.</li>
        </ul>
      </>
    ),
  },
  {
    question: "Có thể xuất báo cáo kết quả làm bài không?",
    answer: (
      <>
        <p>Hệ thống hỗ trợ xuất báo cáo dưới dạng:</p>
        <ul>
          <li><b>PDF</b>: Dễ in ấn, trình bày rõ ràng.</li>
          <li><b>Excel</b>: Phù hợp cho phân tích hoặc tính toán thêm.</li>
        </ul>
        <p>Truy cập mục <b>"Phân tích kết quả"</b>, chọn đề thi và bấm nút <b>"Xuất báo cáo"</b>.</p>
      </>
    ),
  },
  {
    question: "Tôi quên mật khẩu, phải làm sao?",
    answer: (
      <>
        <p>Nếu bạn quên mật khẩu:</p>
        <ul>
          <li>Tại trang đăng nhập, bấm <b>"Quên mật khẩu"</b>.</li>
          <li>Nhập email bạn đã đăng ký để nhận liên kết đặt lại mật khẩu.</li>
          <li>Kiểm tra email và làm theo hướng dẫn.</li>
        </ul>
        <p>Nếu không nhận được email, hãy kiểm tra thư rác hoặc liên hệ bộ phận hỗ trợ.</p>
      </>
    ),
  },
];

const FAQ = () => {
  const [selected, setSelected] = useState(0);
  return (
    <div className="faq-page two-column">
      <div className="faq-sidebar">
        <ul>
          {faqData.map((item, idx) => (
            <li
              key={idx}
              className={selected === idx ? "active" : ""}
              onClick={() => setSelected(idx)}
            >
              {item.question}
            </li>
          ))}
        </ul>
      </div>
      <div className="faq-content">
        <h1 className="faq-title">Câu hỏi thường gặp</h1>
        <div className="faq-item">
          <h3 className="faq-question">
            {faqData[selected].question}
          </h3>
          <div className="faq-answer">{faqData[selected].answer}</div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
