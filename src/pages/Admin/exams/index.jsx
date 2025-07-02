import React, { useState, useEffect } from "react";
import { Tag, Button, Space, Modal, Form, Input, Select, InputNumber, Spin, Card, Divider } from "antd";
import SafeTable from "../../../components/uiBasic/SafeTable";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined, RobotOutlined } from "@ant-design/icons";
import { examService, questionBankService } from "../../../services";
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
  
  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // AI Smart Exam states
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [aiForm] = Form.useForm();
  const [chapters, setChapters] = useState([]);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Fetch exams from API
  const fetchExams = async (params = {}) => {
    setLoading(true);
    try {
      const response = await examService.getAllExams({
        page: params.current || pagination.current,
        pageSize: params.pageSize || pagination.pageSize
      });

      setExams(response.data || []);
      setPagination({
        ...pagination,
        current: params.current || pagination.current,
        pageSize: params.pageSize || pagination.pageSize,
        total: response.total || 0
      });
    } catch (err) {
      console.error('Fetch exams error:', err);
      const errorMessage = examService.formatError(err);
      toast.error(`Lỗi tải danh sách đề thi: ${errorMessage}`);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch chapters for AI generation
  const fetchChapters = async () => {
    try {
      const chaptersData = await questionBankService.getChapters();
      setChapters(Array.isArray(chaptersData) ? chaptersData : []);
    } catch (err) {
      console.error('Fetch chapters error:', err);
      toast.error('Lỗi tải danh sách chương');
    }
  };

  useEffect(() => {
    fetchExams();
    fetchChapters();
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

  // Handle AI Smart Exam Generation
  const handleAIGenerate = () => {
    setIsAIModalVisible(true);
    aiForm.resetFields();
  };

  const handleAIGenerateOk = async () => {
    try {
      const values = await aiForm.validateFields();
      setGeneratingAI(true);


      const smartExamData = {
        name: values.examName,
        description: values.description,
        examType: values.examType || 'smart_exam',
        questionCount: values.questionCount,
        difficultyLevel: values.difficultyLevel,
        chapterId: values.chapterId
      };

      const generatedExam = await examService.generateSmartExam(smartExamData);
      
      toast.success(`Tạo đề thi AI thành công! Đã tạo ${generatedExam.totalQuestions || 0} câu hỏi`);
      
      setIsAIModalVisible(false);
      aiForm.resetFields();
      await fetchExams(); // Refresh exam list
    } catch (err) {
      console.error('AI generate exam error:', err);
      const errorMessage = examService.formatError(err);
      toast.error(`Lỗi tạo đề thi AI: ${errorMessage}`);
    } finally {
      setGeneratingAI(false);
    }
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

  // Handle table change for pagination
  const handleTableChange = (newPagination) => {
    fetchExams({
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
  };

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
          <Button 
            icon={<RobotOutlined />} 
            onClick={handleAIGenerate}
            style={{ marginRight: 8, backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
          >
            Tạo đề thi AI
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
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} đề thi`,
        }}
        className="exams-table"
        scroll={{ x: 1000 }}
        onChange={handleTableChange}
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

      {/* AI Smart Exam Generation Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RobotOutlined style={{ color: '#52c41a' }} />
            <span>Tạo đề thi bằng AI</span>
          </div>
        }
        open={isAIModalVisible}
        onOk={handleAIGenerateOk}
        onCancel={() => {
          setIsAIModalVisible(false);
          aiForm.resetFields();
        }}
        destroyOnClose
        width={700}
        okText="Tạo đề thi AI"
        cancelText="Hủy"
        confirmLoading={generatingAI}
      >
        <Spin spinning={generatingAI} tip="Đang tạo đề thi bằng AI...">
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
            <p style={{ margin: 0, color: '#389e0d' }}>
              <strong>🤖 Tạo đề thi thông minh với AI</strong>
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#52c41a' }}>
              AI sẽ tự động tạo câu hỏi dựa trên chương và độ khó bạn chọn.
            </p>
          </div>

          <Form form={aiForm} layout="vertical">
            <Form.Item
              name="examName"
              label="Tên đề thi"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đề thi!' },
                { min: 5, message: 'Tên đề thi phải có ít nhất 5 ký tự!' }
              ]}
            >
              <Input placeholder="VD: Đề thi Vật lý 12 - Chương 1" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
            >
              <TextArea 
                rows={2} 
                placeholder="Mô tả ngắn gọn về đề thi này"
              />
            </Form.Item>

            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="chapterId"
                label="Chương học"
                rules={[{ required: true, message: 'Vui lòng chọn chương!' }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Chọn chương học">
                  {chapters.map(chapter => (
                    <Option 
                      key={chapter.chapterId || chapter.ChapterId} 
                      value={chapter.chapterId || chapter.ChapterId}
                    >
                      {chapter.chapterName || chapter.ChapterName} - Lớp {chapter.grade || chapter.Grade}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="questionCount"
                label="Số câu hỏi"
                rules={[
                  { required: true, message: 'Vui lòng nhập số câu hỏi!' },
                  { type: 'number', min: 5, max: 50, message: 'Số câu hỏi từ 5-50!' }
                ]}
                style={{ flex: 1 }}
              >
                <InputNumber 
                  min={5} 
                  max={50} 
                  placeholder="10"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="difficultyLevel"
                label="Độ khó"
                rules={[{ required: true, message: 'Vui lòng chọn độ khó!' }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Chọn độ khó">
                  <Option value="easy">Dễ</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="hard">Khó</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="examType"
                label="Loại đề thi"
                initialValue="practice"
                style={{ flex: 1 }}
              >
                <Select>
                  <Option value="practice">Luyện tập</Option>
                  <Option value="test">Kiểm tra</Option>
                  <Option value="midterm">Giữa kỳ</Option>
                  <Option value="final">Cuối kỳ</Option>
                </Select>
              </Form.Item>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}
