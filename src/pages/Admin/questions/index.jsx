import React, { useState, useEffect } from "react";
import { Tag, Button, Space, Modal, Form, Input, Select, Card, Empty, Alert, Spin } from "antd";
import SafeTable from "../../../components/uiBasic/SafeTable";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined, SearchOutlined, BulbOutlined } from "@ant-design/icons";
import { questionBankService, adminService } from "../../../services";
import toast from "react-hot-toast";
import "./index.scss";

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chapters, setChapters] = useState([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [form] = Form.useForm();
  const [aiForm] = Form.useForm();

  // Fetch questions from API
  const fetchQuestions = async (search = '') => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const response = await questionBankService.getQuestions(params);
      
      if (!response || !Array.isArray(response)) {
        setQuestions([]);
        toast.error("Không thể tải dữ liệu câu hỏi");
      } else {
        setQuestions(response);
      }
    } catch (err) {
      console.error('Fetch questions error:', err);
      const errorMessage = adminService.formatError(err);
      toast.error(`Lỗi tải dữ liệu: ${errorMessage}`);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchChapters();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch chapters for AI generation
  const fetchChapters = async () => {
    try {
      const chaptersData = await questionBankService.getChapters();
      setChapters(chaptersData || []);
    } catch (err) {
      console.error('Fetch chapters error:', err);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchQuestions(value);
  };

  // Handle create/update question
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const questionData = {
        questionText: values.questionText,
        difficultyLevel: values.difficultyLevel,
        topic: values.topic,
        explanation: values.explanation || "",
        answers: values.answers || []
      };

      if (editingQuestion) {
        // Update question
        await questionBankService.updateQuestion(editingQuestion.questionId, questionData);
        toast.success("Cập nhật câu hỏi thành công!");
      } else {
        // Create question
        await questionBankService.createQuestion(questionData);
        toast.success("Thêm câu hỏi thành công!");
      }

      setIsModalVisible(false);
      setEditingQuestion(null);
      form.resetFields();
      fetchQuestions(searchTerm);
    } catch (err) {
      console.error('Save question error:', err);
      const errorMessage = questionBankService.formatError(err);
      
      if (errorMessage.includes('chưa được implement')) {
        toast.error("Tính năng này đang được phát triển");
      } else {
        toast.error(`Lỗi lưu câu hỏi: ${errorMessage}`);
      }
    }
  };

  // Handle delete question
  const handleDelete = async (questionId) => {
    Modal.confirm({
      title: "Xác nhận xóa câu hỏi",
      content: "Bạn chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await questionBankService.deleteQuestion(questionId);
          toast.success("Xóa câu hỏi thành công!");
          fetchQuestions(searchTerm);
        } catch (err) {
          console.error('Delete question error:', err);
          const errorMessage = questionBankService.formatError(err);
          
          if (errorMessage.includes('chưa được implement')) {
            toast.error("Tính năng này đang được phát triển");
          } else {
            toast.error(`Lỗi xóa câu hỏi: ${errorMessage}`);
          }
        }
      },
    });
  };

  // Handle view question details
  const handleView = (question) => {
    Modal.info({
      title: "Chi tiết câu hỏi",
      content: (
        <div>
          <p><strong>Nội dung:</strong> {question.questionText}</p>
          <p><strong>Chủ đề:</strong> {question.topic?.topicName || question.topic || 'Chưa phân loại'}</p>
          <p><strong>Mức độ:</strong> {getDifficultyText(question.difficultyLevel)}</p>
          <p><strong>Giải thích:</strong> {question.explanation || 'Chưa có giải thích'}</p>
          <p><strong>Ngày tạo:</strong> {question.createdAt ? new Date(question.createdAt).toLocaleString('vi-VN') : 'N/A'}</p>
        </div>
      ),
      width: 600,
    });
  };

  // Handle edit question
  const handleEdit = (question) => {
    setEditingQuestion(question);
    setIsModalVisible(true);
    form.setFieldsValue({
      questionText: question.questionText,
      difficultyLevel: question.difficultyLevel,
      topic: question.topic?.topicName || question.topic,
      explanation: question.explanation
    });
  };

  // Handle add new question
  const handleAdd = () => {
    setEditingQuestion(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  // Handle open AI generation modal
  const handleAIGenerate = () => {
    setShowAIModal(true);
    aiForm.resetFields();
  };

  // Handle AI question generation with user criteria
  const handleAIGenerateSubmit = async () => {
    try {
      const values = await aiForm.validateFields();
      setAiGenerating(true);
      
      const criteria = {
        topicId: values.topicId || chapters[0]?.topicId || 1,
        difficultyLevel: values.difficultyLevel,
        questionType: values.questionType,
        count: values.count || 1,
        topic: values.topic
      };
      
      const generatedQuestion = await questionBankService.generateQuestion(criteria);
      
      if (generatedQuestion) {
        toast.success('Đã tạo câu hỏi bằng AI thành công!');
        fetchQuestions(searchTerm);
        setShowAIModal(false);
        aiForm.resetFields();
      }
    } catch (err) {
      console.error('AI Generation error:', err);
      const errorMessage = questionBankService.formatError(err);
      toast.error(`Lỗi tạo câu hỏi AI: ${errorMessage}`);
    } finally {
      setAiGenerating(false);
    }
  };

  // Get difficulty level display
  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'default';
    }
  };

  const getDifficultyText = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return level || 'Chưa xác định';
    }
  };

const columns = [
  {
    title: "Nội dung câu hỏi",
      dataIndex: "questionText",
      key: "questionText",
      render: (text) => (
        <span style={{ fontWeight: 500 }}>
          {text?.length > 100 ? `${text.substring(0, 100)}...` : text}
        </span>
      ),
      ellipsis: true,
  },
  {
    title: "Chủ đề",
      key: "topic",
      render: (_, record) => (
        <Tag color="blue">
          {record.topic?.topicName || record.topic || 'Chưa phân loại'}
        </Tag>
      ),
      width: 150,
  },
  {
    title: "Mức độ",
      dataIndex: "difficultyLevel",
      key: "difficultyLevel",
      render: (level) => (
        <Tag color={getDifficultyColor(level)}>
          {getDifficultyText(level)}
        </Tag>
      ),
      width: 120,
  },
  {
    title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A',
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
            onClick={() => handleView(record)}
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
            onClick={() => handleDelete(record.questionId)}
            title="Xóa"
          />
      </Space>
    ),
      width: 150,
  },
];

  return (
    <div className="admin-questions-page">
      <div className="questions-header">
        <h1>Ngân hàng câu hỏi</h1>
        <div className="questions-actions">
          <Search
            placeholder="Tìm kiếm câu hỏi..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={handleSearch}
            style={{ width: 300, marginRight: 16 }}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchQuestions(searchTerm)}
            style={{ marginRight: 8 }}
          >
            Làm mới
          </Button>
          <Button 
            icon={<BulbOutlined />} 
            onClick={handleAIGenerate}
            loading={aiGenerating}
            style={{ marginRight: 8 }}
          >
            Tạo câu hỏi AI
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm câu hỏi
          </Button>
        </div>
      </div>

      <div className="questions-stats">
        <Card size="small" style={{ marginBottom: 16 }}>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Tổng số câu hỏi:</span>
              <span className="stat-value">{Array.isArray(questions) ? questions.length : 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Câu hỏi dễ:</span>
              <span className="stat-value">
                {Array.isArray(questions) ? questions.filter(q => q.difficultyLevel?.toLowerCase() === 'easy').length : 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Câu hỏi trung bình:</span>
              <span className="stat-value">
                {Array.isArray(questions) ? questions.filter(q => q.difficultyLevel?.toLowerCase() === 'medium').length : 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Câu hỏi khó:</span>
              <span className="stat-value">
                {Array.isArray(questions) ? questions.filter(q => q.difficultyLevel?.toLowerCase() === 'hard').length : 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <SafeTable 
        columns={columns} 
        dataSource={questions} 
        rowKey="questionId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} câu hỏi`,
        }}
        className="questions-table"
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingQuestion ? "Cập nhật câu hỏi" : "Thêm câu hỏi mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingQuestion(null);
          form.resetFields();
        }}
        destroyOnClose
        width={800}
        okText={editingQuestion ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="questionText"
            label="Nội dung câu hỏi"
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung câu hỏi!' },
              { min: 10, message: 'Nội dung câu hỏi phải có ít nhất 10 ký tự!' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập nội dung câu hỏi..."
            />
          </Form.Item>

          <Form.Item
            name="topic"
            label="Chủ đề"
            rules={[{ required: true, message: 'Vui lòng nhập chủ đề!' }]}
          >
            <Input placeholder="Nhập chủ đề (VD: Vật lý 10 - Cơ học)" />
          </Form.Item>

          <Form.Item
            name="difficultyLevel"
            label="Mức độ khó"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ khó!' }]}
          >
            <Select placeholder="Chọn mức độ khó">
              <Option value="easy">Dễ</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="hard">Khó</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="explanation"
            label="Giải thích (tùy chọn)"
          >
            <TextArea 
              rows={3} 
              placeholder="Nhập giải thích chi tiết cho câu hỏi..."
            />
          </Form.Item>
                  </Form>
        </Modal>

        {/* AI Generation Modal */}
        <Modal
          title="Tạo câu hỏi bằng AI"
          open={showAIModal}
          onOk={handleAIGenerateSubmit}
          onCancel={() => {
            setShowAIModal(false);
            aiForm.resetFields();
          }}
          confirmLoading={aiGenerating}
          destroyOnClose
          okText="Tạo câu hỏi"
          cancelText="Hủy"
        >
          <Form form={aiForm} layout="vertical">
            <Form.Item
              name="topic"
              label="Chủ đề"
              rules={[{ required: true, message: 'Vui lòng nhập chủ đề!' }]}
            >
              <Input placeholder="VD: Cơ học, Điện học, Quang học..." />
            </Form.Item>

            <Form.Item
              name="difficultyLevel"
              label="Mức độ khó"
              rules={[{ required: true, message: 'Vui lòng chọn mức độ khó!' }]}
              initialValue="medium"
            >
              <Select placeholder="Chọn mức độ khó">
                <Option value="easy">Dễ</Option>
                <Option value="medium">Trung bình</Option>
                <Option value="hard">Khó</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="questionType"
              label="Loại câu hỏi"
              rules={[{ required: true, message: 'Vui lòng chọn loại câu hỏi!' }]}
              initialValue="multiple_choice"
            >
              <Select placeholder="Chọn loại câu hỏi">
                <Option value="multiple_choice">Trắc nghiệm</Option>
                <Option value="true_false">Đúng/Sai</Option>
                <Option value="fill_blank">Điền từ</Option>
                <Option value="essay">Tự luận</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="count"
              label="Số lượng câu hỏi"
              initialValue={1}
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng!' },
                { type: 'number', min: 1, max: 10, message: 'Số lượng từ 1-10 câu hỏi!' }
              ]}
            >
              <Select>
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <Option key={num} value={num}>{num} câu hỏi</Option>
                ))}
              </Select>
            </Form.Item>

            {chapters.length > 0 && (
              <Form.Item
                name="topicId"
                label="Chương (tùy chọn)"
              >
                <Select placeholder="Chọn chương học cụ thể..." allowClear>
                  {Array.isArray(chapters) ? chapters.map(chapter => (
                    <Option key={chapter.topicId} value={chapter.topicId}>
                      {chapter.topicName}
                    </Option>
                  )) : []}
                </Select>
              </Form.Item>
            )}
          </Form>
        </Modal>
      </div>
    );
  }
