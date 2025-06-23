import React, { useState, useEffect } from "react";
import { Tag, Button, Space, Modal, Form, Input, Select, InputNumber, Spin, Card } from "antd";
import SafeTable from "../../../components/uiBasic/SafeTable";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { examService } from "../../../services";
import toast from "react-hot-toast";
import "./index.scss";

const { Option } = Select;
const { TextArea } = Input;

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form] = Form.useForm();

  // Fetch exams from API
  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await examService.getAllExams();
      console.log('Exams response:', response);
      setExams(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Fetch exams error:', err);
      const errorMessage = examService.formatError(err);
      toast.error(`Lỗi tải danh sách đề thi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Handle create/update exam
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const examData = {
        examName: values.examName,
        description: values.description,
        durationMinutes: values.durationMinutes,
        examType: values.examType,
        createdBy: "admin", // You might want to get this from current user
        questions: [] // Empty for now, can be added later
      };

      if (editingExam) {
        // Update exam
        await examService.updateExam(editingExam.examId, {
          ...examData,
          isPublished: values.isPublished
        });
        toast.success("Cập nhật đề thi thành công!");
      } else {
        // Create exam
        await examService.createExam(examData);
        toast.success("Tạo đề thi thành công!");
      }

      setIsModalVisible(false);
      setEditingExam(null);
      form.resetFields();
      fetchExams();
    } catch (err) {
      console.error('Save exam error:', err);
      const errorMessage = examService.formatError(err);
      toast.error(`Lỗi lưu đề thi: ${errorMessage}`);
    }
  };

  // Handle delete exam
  const handleDelete = async (examId) => {
    Modal.confirm({
      title: "Xác nhận xóa đề thi",
      content: "Bạn chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await examService.deleteExam(examId);
          toast.success("Xóa đề thi thành công!");
          fetchExams();
        } catch (err) {
          console.error('Delete exam error:', err);
          const errorMessage = examService.formatError(err);
          toast.error(`Lỗi xóa đề thi: ${errorMessage}`);
        }
      },
    });
  };

  // Handle view exam details
  const handleView = async (examId) => {
    try {
      const examDetails = await examService.getExamById(examId);
      console.log('Exam details:', examDetails);
      
      Modal.info({
        title: "Chi tiết đề thi",
        content: (
          <div>
            <p><strong>Tên đề thi:</strong> {examDetails.examName}</p>
            <p><strong>Mô tả:</strong> {examDetails.description}</p>
            <p><strong>Thời gian:</strong> {examDetails.durationMinutes} phút</p>
            <p><strong>Loại đề thi:</strong> {examDetails.examType}</p>
            <p><strong>Số câu hỏi:</strong> {examDetails.questions?.length || 0}</p>
            <p><strong>Trạng thái:</strong> {examDetails.isPublished ? "Đã xuất bản" : "Nháp"}</p>
            <p><strong>Ngày tạo:</strong> {new Date(examDetails.createdAt).toLocaleString('vi-VN')}</p>
          </div>
        ),
        width: 600,
      });
    } catch (err) {
      console.error('View exam error:', err);
      toast.error("Không thể xem chi tiết đề thi");
    }
  };

  // Handle edit exam
  const handleEdit = (exam) => {
    setEditingExam(exam);
    setIsModalVisible(true);
    form.setFieldsValue({
      examName: exam.examName,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      examType: exam.examType,
      isPublished: exam.isPublished
    });
  };

  // Handle add new exam
  const handleAdd = () => {
    setEditingExam(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  // Get status color and text
  const getStatusDisplay = (isPublished) => {
    if (isPublished) {
      return <Tag color="green">Đã xuất bản</Tag>;
    } else {
      return <Tag color="orange">Nháp</Tag>;
    }
  };

  const getExamTypeDisplay = (examType) => {
    const typeMap = {
      'practice': 'Luyện tập',
      'test': 'Kiểm tra',
      'exam': 'Thi chính thức',
      'midterm': 'Giữa kỳ',
      'final': 'Cuối kỳ'
    };
    return typeMap[examType] || examType;
  };

  const columns = [
    {
      title: "Tên đề thi",
      dataIndex: "examName",
      key: "examName",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
      ellipsis: true,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 200,
    },
    {
      title: "Số câu hỏi",
      key: "questionCount",
      render: (_, record) => (
        <Tag color="blue">{record.questions?.length || 0}</Tag>
      ),
      width: 100,
    },
    {
      title: "Thời gian",
      dataIndex: "durationMinutes",
      key: "durationMinutes",
      render: (minutes) => `${minutes} phút`,
      width: 100,
    },
    {
      title: "Loại đề thi",
      dataIndex: "examType",
      key: "examType",
      render: (type) => (
        <Tag color="purple">{getExamTypeDisplay(type)}</Tag>
      ),
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (isPublished) => getStatusDisplay(isPublished),
      width: 100,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '',
      width: 120,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => handleView(record.examId)}
            title="Xem chi tiết"
          />
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger 
            onClick={() => handleDelete(record.examId)}
            title="Xóa"
          />
        </Space>
      ),
      width: 150,
    },
  ];

  return (
    <div className="admin-exams-page">
      <div className="exams-header">
        <h1>Quản lý đề thi</h1>
        <div className="exams-actions">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchExams}
            style={{ marginRight: 8 }}
          >
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Tạo đề thi mới
          </Button>
        </div>
      </div>

      <div className="exams-stats">
        <Card size="small" style={{ marginBottom: 16 }}>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Tổng số đề thi:</span>
              <span className="stat-value">{Array.isArray(exams) ? exams.length : 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Đã xuất bản:</span>
              <span className="stat-value">
                {Array.isArray(exams) ? exams.filter(exam => exam.isPublished).length : 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Nháp:</span>
              <span className="stat-value">
                {Array.isArray(exams) ? exams.filter(exam => !exam.isPublished).length : 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <SafeTable 
        columns={columns} 
        dataSource={exams} 
        rowKey="examId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} đề thi`,
        }}
        className="exams-table"
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingExam ? "Cập nhật đề thi" : "Tạo đề thi mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingExam(null);
          form.resetFields();
        }}
        destroyOnClose
        width={700}
        okText={editingExam ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="examName"
            label="Tên đề thi"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đề thi!' },
              { min: 5, message: 'Tên đề thi phải có ít nhất 5 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tên đề thi" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả!' }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Nhập mô tả chi tiết về đề thi"
            />
          </Form.Item>

          <Form.Item
            name="durationMinutes"
            label="Thời gian làm bài (phút)"
            rules={[
              { required: true, message: 'Vui lòng nhập thời gian!' },
              { type: 'number', min: 1, message: 'Thời gian phải lớn hơn 0!' }
            ]}
          >
            <InputNumber 
              min={1} 
              max={300} 
              placeholder="Nhập thời gian (phút)"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="examType"
            label="Loại đề thi"
            rules={[{ required: true, message: 'Vui lòng chọn loại đề thi!' }]}
          >
            <Select placeholder="Chọn loại đề thi">
              <Option value="practice">Luyện tập</Option>
              <Option value="test">Kiểm tra</Option>
              <Option value="midterm">Giữa kỳ</Option>
              <Option value="final">Cuối kỳ</Option>
              <Option value="exam">Thi chính thức</Option>
            </Select>
          </Form.Item>

          {editingExam && (
            <Form.Item
              name="isPublished"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value={false}>Nháp</Option>
                <Option value={true}>Đã xuất bản</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
