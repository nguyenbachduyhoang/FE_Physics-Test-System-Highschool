/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  Button, 
  Space, 
  Tag, 
  Descriptions, 
  Spin, 
  Alert, 
  Modal, 
  Form, 
  Input,
  Select,
  Divider,
  Typography,
  Row,
  Col
} from "antd";
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  BulbOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined
} from "@ant-design/icons";
import { questionBankService } from "../../../services";
import toast from "react-hot-toast";
import "./detail.scss";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function toVNTime(dateString) {
  if (!dateString) return 'N/A';
  if (dateString.includes('Z') || /[+-]\d{2}:\d{2}$/.test(dateString)) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false });
  }
  if (dateString.includes('T')) {
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    const [h, m, s] = timePart.split(':');
    const date = new Date(Date.UTC(year, month - 1, day, h, m, s));
    date.setUTCHours(date.getUTCHours());
    return date.toLocaleString('vi-VN', { hour12: false });
  }
  const [time, dmy] = dateString.split(' ');
  const [h, m, s] = time.split(':');
  const [day, month, year] = dmy.split('/');
  const date = new Date(Date.UTC(year, month - 1, day, h, m, s));
  date.setUTCHours(date.getUTCHours());
  return date.toLocaleString('vi-VN', { hour12: false });
}

export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState(null);
  const [_chapters, setChapters] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [form] = Form.useForm();

  // Fetch question details
  const fetchQuestionDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await questionBankService.getQuestionById(id);
      if (response?.success || response?.data) {
        const questionData = response.data || response;
        setQuestion(questionData);
      } else {
        throw new Error('Không thể tải thông tin câu hỏi');
      }
    } catch (error) {
      console.error('Error fetching question detail:', error);
      toast.error('Lỗi khi tải thông tin câu hỏi: ' + error.message);
      navigate('/admin/questions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch chapters for edit form
  const fetchChapters = async () => {
    try {
      const response = await questionBankService.getChapters();
      if (response?.success && Array.isArray(response.data)) {
        setChapters(response.data);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  };

  useEffect(() => {
    fetchQuestionDetail();
    fetchChapters();
  }, [id]);

  // Generate question code
  const generateQuestionCode = (questionId, chapterId) => {
    const timestamp = new Date().getTime().toString().slice(-6);
    return `QS${chapterId || '00'}_${timestamp}_${questionId?.slice(-4) || '0000'}`;
  };

  // Handle copy question code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Đã sao chép mã câu hỏi!');
  };

  // Handle edit question
  const handleEdit = () => {
    if (question) {
      form.setFieldsValue({
        questionText: question.questionText,
        difficultyLevel: question.difficultyLevel,
        chapterId: question.chapterId,
        questionType: question.questionType,
        explanation: question.explanation
      });
      setEditModalVisible(true);
    }
  };

  // Handle update question
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const updateData = {
        questionText: values.questionText,
        difficultyLevel: values.difficultyLevel,
        explanation: values.explanation,
        answerChoices: question.answerChoices // Keep existing answer choices
      };

      const response = await questionBankService.updateQuestion(id, updateData);
      if (response?.success || response?.data?.success) {
        toast.success('Cập nhật câu hỏi thành công!');
        setEditModalVisible(false);
        fetchQuestionDetail();
      } else {
        throw new Error(response?.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Lỗi cập nhật: ' + error.message);
    }
  };

  // Handle delete question
  const handleDelete = async () => {
    try {
      const response = await questionBankService.deleteQuestion(id);
      if (response?.success || response?.data?.success) {
        toast.success('Xóa câu hỏi thành công!');
        navigate('/admin/questions');
      } else {
        throw new Error(response?.message || 'Xóa thất bại');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Lỗi xóa: ' + error.message);
    }
  };
  // Get difficulty color
  const getDifficultyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'default';
    }
  };

  // Get difficulty text
  const getDifficultyText = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <div>Đang tải thông tin câu hỏi...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="error-container">
        <Alert
          message="Không tìm thấy câu hỏi"
          description="Câu hỏi có thể đã bị xóa hoặc không tồn tại."
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/admin/questions')}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  const questionCode = generateQuestionCode(question.questionId, question.chapterId);

  return (
    <div className="question-detail-page">
      {/* Header */}
      <Card className="header-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/questions')}
              >
                Quay lại
              </Button>
              <Title level={3} style={{ margin: 0 }}>Chi tiết câu hỏi</Title>
            </Space>
          </Col>
          <Col>
            <Space>
              {/* <Button 
                type="primary" 
                icon={<BulbOutlined />}
                onClick={handleValidate}
              >
                Kiểm tra AI
              </Button> */}
              <Button 
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                Sửa
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => setDeleteModalVisible(true)}
              >
                Xóa
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Question Code */}
      <Card className="code-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text strong>Mã câu hỏi:</Text>
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                {questionCode}
              </Tag>
            </Space>
          </Col>
          <Col>
            <Button 
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyCode(questionCode)}
            >
              Sao chép
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Basic Information */}
      <Card title="Thông tin cơ bản" className="info-card">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="ID">{question.questionId}</Descriptions.Item>
          <Descriptions.Item label="Loại câu hỏi">{question.questionType}</Descriptions.Item>
          <Descriptions.Item label="Độ khó">
            <Tag color={getDifficultyColor(question.difficultyLevel)}>
              {getDifficultyText(question.difficultyLevel)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Chủ đề">{question.topic || 'Chưa phân loại'}</Descriptions.Item>
          <Descriptions.Item label="Người tạo">{question.createdBy || 'Hệ thống'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {question.createdAt ? toVNTime(question.createdAt) : 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Question Content */}
      <Card title="Nội dung câu hỏi" className="content-card">
        <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
          {question.questionText}
        </Paragraph>
        
        {question.imageUrl && (
          <div className="question-image">
            <img src={question.imageUrl} alt="Question" style={{ maxWidth: '100%' }} />
          </div>
        )}
      </Card>

      {/* Answer Choices */}
      {question.answerChoices && question.answerChoices.length > 0 && (
        <Card title="Các lựa chọn" className="choices-card">
          <div className="answer-choices">
            {question.answerChoices.map((choice, index) => (
              <Card
                key={choice.choiceId || index}
                size="small"
                className={`choice-card ${choice.isCorrect ? 'correct-choice' : ''}`}
                style={{ marginBottom: '8px' }}
              >
                <Row justify="space-between" align="middle">
                  <Col flex="auto">
                    <Space>
                      <Tag color={choice.isCorrect ? 'green' : 'default'}>
                        {choice.choiceLabel || String.fromCharCode(65 + index)}
                      </Tag>
                      <Text>{choice.choiceText}</Text>
                    </Space>
                  </Col>
                  <Col>
                    {choice.isCorrect ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    )}
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Explanation */}
      {question.explanation && (
        <Card title="Giải thích" className="explanation-card">
          <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {question.explanation}
          </Paragraph>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        title="Sửa câu hỏi"
        open={editModalVisible}
        onOk={handleUpdate}
        onCancel={() => setEditModalVisible(false)}
        width={800}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Nội dung câu hỏi"
            name="questionText"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
          >
            <TextArea rows={4} placeholder="Nhập nội dung câu hỏi..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Độ khó"
                name="difficultyLevel"
                rules={[{ required: true, message: 'Vui lòng chọn độ khó' }]}
              >
                <Select placeholder="Chọn độ khó">
                  <Option value="easy">Dễ</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="hard">Khó</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Loại câu hỏi"
                name="questionType"
              >
                <Select placeholder="Chọn loại câu hỏi">
                  <Option value="multiple_choice">Trắc nghiệm</Option>
                  <Option value="true_false">Đúng/Sai</Option>
                  <Option value="essay">Tự luận</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Giải thích"
            name="explanation"
          >
            <TextArea rows={3} placeholder="Nhập giải thích cho câu hỏi..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa câu hỏi này không?</p>
        <p><strong>Mã câu hỏi:</strong> {questionCode}</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Validation Modal */}
      <Modal
        title="Kết quả kiểm tra AI"
        open={validationModalVisible}
        onCancel={() => setValidationModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setValidationModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {validationResult && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Điểm chất lượng">
                <Tag color={validationResult.qualityScore > 0.7 ? 'green' : 'orange'}>
                  {(validationResult.qualityScore * 100).toFixed(1)}%
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Đánh giá tổng thể">
                {validationResult.overallAssessment || 'Chưa có đánh giá'}
              </Descriptions.Item>
            </Descriptions>
            
            {validationResult.suggestions && validationResult.suggestions.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <Title level={5}>Gợi ý cải thiện:</Title>
                <ul>
                  {validationResult.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
} 