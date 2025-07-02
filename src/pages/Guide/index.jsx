import React, { useState } from "react";
import "./index.scss";

const guideTopics = [
  {
    key: "login",
    title: "Đăng nhập hệ thống",
    content: (
      <>
        <h2>Đăng nhập hệ thống</h2>
        <p>Sử dụng tài khoản được cấp để đăng nhập vào hệ thống.</p>
        <p>Nếu chưa có tài khoản, hãy liên hệ quản trị viên hoặc giáo viên để được cấp.</p>
        <p>Sau khi đăng nhập, bạn sẽ được chuyển đến bảng điều khiển chính.</p>
      </>
    ),
  },
  {
    key: "create-exam",
    title: "Tạo đề thi mới",
    content: (
      <>
        <h2>Tạo đề thi mới</h2>
        <p>Chọn mục <b>"Tạo đề thi"</b> trên thanh menu.</p>
        <p>Điền các thông tin như tên đề, thời gian làm bài, cấp độ và mô tả.</p>
        <p>Chọn câu hỏi từ ngân hàng câu hỏi hoặc tạo mới trực tiếp.</p>
        <p>Sau khi hoàn tất, bấm "Lưu & Xuất bản".</p>
      </>
    ),
  },
  {
    key: "question-bank",
    title: "Quản lý ngân hàng câu hỏi",
    content: (
      <>
        <h2>Quản lý ngân hàng câu hỏi</h2>
        <p>Truy cập mục <b>"Ngân hàng câu hỏi"</b> để xem, chỉnh sửa hoặc xóa câu hỏi đã có.</p>
        <p>Bạn có thể lọc theo môn học, cấp độ hoặc từ khóa.</p>
        <p>Click "Thêm câu hỏi" để tạo mới với định dạng trắc nghiệm hoặc tự luận.</p>
      </>
    ),
  },
  {
    key: "assign-exam",
    title: "Giao bài cho học sinh (Coming Soon)",
    content: (
      <>
        <h2>Giao bài cho học sinh (Coming Soon)</h2>
        <p>Sau khi tạo đề thi, bạn có thể giao bài cho lớp học cụ thể.</p>
        <p>Chọn lớp → Chọn đề thi → Đặt thời gian mở & đóng bài → Giao bài.</p>
        <p>Học sinh sẽ nhận được thông báo và có thể bắt đầu làm bài.</p>
      </>
    ),
  },
  {
    key: "result-analysis",
    title: "Xem kết quả và phân tích",
    content: (
      <>
        <h2>Xem kết quả và phân tích</h2>
        <p>Truy cập mục <b>"Phân tích kết quả"</b> để xem điểm số và thống kê.</p>
        <p>Biểu đồ sẽ thể hiện tỉ lệ đúng/sai, thời gian làm bài trung bình và điểm trung vị.</p>
        <p>Bạn có thể tải xuống báo cáo dưới dạng PDF hoặc Excel.</p>
      </>
    ),
  },
  {
    key: "class-management",
    title: "Quản lý lớp học",
    content: (
      <>
        <h2>Quản lý lớp học</h2>
        <p>Chọn mục <b>"Lớp học"</b> để tạo lớp mới hoặc quản lý lớp hiện tại.</p>
        <p>Bạn có thể thêm học sinh bằng email hoặc mã lớp.</p>
        <p>Có thể phân nhóm, mời giáo viên phụ trách và theo dõi tiến độ lớp.</p>
      </>
    ),
  },
  {
    key: "profile-settings",
    title: "Cài đặt tài khoản cá nhân",
    content: (
      <>
        <h2>Cài đặt tài khoản cá nhân</h2>
        <p>Click vào ảnh đại diện ở góc phải và chọn "Cài đặt".</p>
        <p>Bạn có thể đổi mật khẩu, cập nhật ảnh đại diện hoặc thay đổi thông tin cá nhân.</p>
        <p>Đừng quên lưu lại sau khi chỉnh sửa.</p>
      </>
    ),
  },
  {
    key: "support",
    title: "Liên hệ hỗ trợ",
    content: (
      <>
        <h2>Liên hệ hỗ trợ</h2>
        <p>Nếu gặp khó khăn, hãy liên hệ với đội ngũ kỹ thuật:</p>
        <ul>
          <li>Email: <a href="mailto:support@phygen.vn">support@phygen.vn</a></li>
          <li>Hotline: 1900 1234</li>
        </ul>
        <p>Thời gian hỗ trợ: 8h – 18h từ thứ 2 đến thứ 6.</p>
      </>
    ),
  },
];

const Guide = () => {
  const [selected, setSelected] = useState(guideTopics[0].key);
  const current = guideTopics.find((t) => t.key === selected);

  return (
    <div className="guide-page two-column">
      <div className="guide-sidebar">
        <ul>
          {guideTopics.map((topic) => (
            <li
              key={topic.key}
              className={selected === topic.key ? "active" : ""}
              onClick={() => setSelected(topic.key)}
            >
              {topic.title}
            </li>
          ))}
        </ul>
      </div>
      <div className="guide-content">
        <h1>Hướng dẫn sử dụng</h1>
        <div className="guide-section">{current.content}</div>
      </div>
    </div>
  );
};

export default Guide;
