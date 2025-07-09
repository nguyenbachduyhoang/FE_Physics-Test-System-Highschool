# Admin Module - Chi tiết tính năng

## Tổng quan

Module Admin đã được cập nhật với các trang chi tiết hoàn chỉnh cho tất cả các phần quản lý chính:

- **Users**: Quản lý người dùng với trang chi tiết
- **Questions**: Quản lý câu hỏi với mã câu hỏi và trang chi tiết
- **Exams**: Quản lý đề thi với mã đề thi và trang chi tiết  
- **Essays**: Quản lý bài luận với trang chi tiết

## Tính năng mới

### 1. Mã định danh (Code System)

#### Mã câu hỏi (Question Code)
- **Format**: `QS{chapterId}_{timestamp}_{questionId}`
- **Ví dụ**: `QS01_123456_7890`
- **Hiển thị**: Cột đầu tiên trong bảng questions
- **Tính năng**: Có thể sao chép bằng một click

#### Mã đề thi (Exam Code)  
- **Format**: `{typePrefix}{timestamp}_{examId}`
- **Các prefix**:
  - `EX15_`: Kiểm tra 15 phút
  - `EX45_`: Kiểm tra 1 tiết
  - `EXMD_`: Thi giữa kỳ
  - `EXFN_`: Thi cuối kỳ
  - `EXAI_`: Đề thi thông minh
  - `EXAM_`: Loại khác
- **Ví dụ**: `EXFN_123456_7890`
- **Hiển thị**: Cột đầu tiên trong bảng exams

#### Mã bài luận (Essay Code)
- **Format**: `ES{timestamp}_{essayId}`
- **Ví dụ**: `ES123456_7890`

### 2. Trang chi tiết (Detail Pages)

#### Questions Detail (`/admin/questions/:id`)
- **Thông tin cơ bản**: ID, loại, độ khó, chủ đề, người tạo
- **Nội dung câu hỏi**: Hiển thị đầy đủ với hình ảnh (nếu có)
- **Các lựa chọn**: Hiển thị tất cả đáp án với đánh dấu đúng/sai
- **Giải thích**: Phần giải thích chi tiết
- **Tính năng**:
  - Sửa câu hỏi inline
  - Xóa với xác nhận
  - Kiểm tra chất lượng bằng AI
  - Sao chép mã câu hỏi

#### Exams Detail (`/admin/exams/:id`)
- **Thông tin cơ bản**: ID, tên, loại, trạng thái, thời gian
- **Thống kê**: Số câu hỏi, tổng điểm, số người thi
- **Phân bố câu hỏi**: Biểu đồ theo độ khó và loại
- **Danh sách câu hỏi**: Bảng hiển thị tất cả câu hỏi trong đề
- **Tính năng**:
  - Sửa thông tin đề thi
  - Xem chi tiết từng câu hỏi
  - Xóa với xác nhận
  - Sao chép mã đề thi

#### Users Detail (`/admin/users/:id`)
- **Profile**: Avatar, thông tin cá nhân, vai trò
- **Thống kê**: (Đối với học sinh) Số bài thi, điểm TB, điểm cao nhất
- **Lịch sử thi**: Bảng chi tiết các lần làm bài
- **Tính năng**:
  - Sửa thông tin người dùng
  - Khóa/mở khóa tài khoản
  - Xem lịch sử chi tiết

#### Essays Detail (`/admin/essays/:id`)
- **Thông tin bài luận**: Đề bài, hướng dẫn, giới hạn từ
- **Thống kê**: Số bài nộp, đã chấm, điểm TB
- **Bài làm của học sinh**: Bảng hiển thị tất cả submission
- **Tính năng**:
  - Xem chi tiết từng bài làm
  - Chấm điểm và nhận xét
  - Thống kê phân bố điểm

## Cách sử dụng

### Truy cập trang chi tiết

1. **Từ bảng danh sách**: Click vào icon "Xem" (👁️) 
2. **Từ URL trực tiếp**: 
   - Questions: `/admin/questions/{questionId}`
   - Exams: `/admin/exams/{examId}`
   - Users: `/admin/users/{userId}`
   - Essays: `/admin/essays/{essayId}`

### Navigation

- **Quay lại**: Nút "← Quay lại" ở góc trái trên
- **Breadcrumb**: Hiển thị đường dẫn hiện tại
- **Actions**: Các nút thao tác ở góc phải trên

### Responsive Design

- **Desktop**: Hiển thị đầy đủ với layout 2 cột
- **Tablet**: Layout 1 cột với spacing điều chỉnh
- **Mobile**: Compact view với scroll ngang cho bảng

## File Structure

```
src/pages/Admin/
├── questions/
│   ├── index.jsx          # Danh sách câu hỏi
│   ├── detail.jsx         # Chi tiết câu hỏi
│   ├── index.scss
│   └── detail.scss
├── exams/
│   ├── index.jsx          # Danh sách đề thi
│   ├── detail.jsx         # Chi tiết đề thi
│   ├── index.scss
│   └── detail.scss
├── users/
│   ├── index.jsx          # Danh sách người dùng
│   ├── detail.jsx         # Chi tiết người dùng
│   ├── index.scss
│   └── detail.scss
├── essays/
│   ├── index.jsx          # Danh sách bài luận
│   ├── detail.jsx         # Chi tiết bài luận
│   ├── index.scss
│   └── detail.scss
└── AdminLayout.jsx        # Layout chung
```

## API Integration

Các trang detail sử dụng các service methods:
- `questionBankService.getQuestionById(id)`
- `examService.getExamById(id)` 
- `adminService.getUserById(id)`
- `essayService.getEssayById(id)`

## Lưu ý phát triển

1. **Error Handling**: Tất cả trang đều có xử lý lỗi và fallback UI
2. **Loading States**: Hiển thị loading khi fetch data
3. **Performance**: Sử dụng lazy loading cho hình ảnh lớn
4. **Accessibility**: Đầy đủ ARIA labels và keyboard navigation
5. **Internationalization**: Sẵn sàng cho đa ngôn ngữ

## Tương lai

Các tính năng sẽ được thêm:
- Export PDF cho câu hỏi/đề thi
- Print friendly view
- Bulk operations từ detail pages
- Advanced filtering và search
- Real-time collaboration features 