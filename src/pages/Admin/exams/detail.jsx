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
  InputNumber,
  Typography,
  Row,
  Col,
  Table,
  Progress,
  Statistic
} from "antd";
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined
} from "@ant-design/icons";
import { examService } from "../../../services";
import toast from "react-hot-toast";
import "./detail.scss";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function ExamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [questionsModalVisible, setQuestionsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch exam details
  const fetchExamDetail = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await examService.getExamById(id);
      if (response?.success) {
        setExam(response.data);
      } else {
        throw new Error(response?.message || 'Không thể tải thông tin đề thi');
      }
    } catch (error) {
      console.error('Error fetching exam detail:', error);
      toast.error('Lỗi khi tải thông tin đề thi: ' + error.message);
      navigate('/admin/exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamDetail();
  }, [id]);

  // Generate exam code
  const generateExamCode = (examId, examType) => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const typePrefix = getExamTypePrefix(examType);
    return `${typePrefix}${timestamp}_${examId?.slice(-4) || '0000'}`;
  };

  // Get exam type prefix
  const getExamTypePrefix = (examType) => {
    switch (examType?.toLowerCase()) {
      case '15p': return 'EX15_';
      case '1tiet': return 'EX45_';
      case 'cuoiky': return 'EXFN_';
      case 'giua_ki': return 'EXMD_';
      case 'smart_exam': return 'EXAI_';
      default: return 'EXAM_';
    }
  };

  // Handle copy exam code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Đã sao chép mã đề thi!');
  };

  // Handle edit exam
  const handleEdit = () => {
    if (exam) {
      form.setFieldsValue({
        examName: exam.examName,
        description: exam.description,
        durationMinutes: exam.durationMinutes,
        examType: exam.examType,
        isPublished: exam.isPublished
      });
      setEditModalVisible(true);
    }
  };

  // Handle update exam
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const updateData = {
        examName: values.examName,
        description: values.description,
        durationMinutes: values.durationMinutes,
        examType: values.examType,
        isPublished: values.isPublished
      };

      const response = await examService.updateExam(id, updateData);
      if (response?.success) {
        toast.success(response.message || 'Cập nhật đề thi thành công!');
        setEditModalVisible(false);
        fetchExamDetail();
      } else {
        throw new Error(response?.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Lỗi cập nhật: ' + error.message);
    }
  };

  // Handle delete exam
  const handleDelete = async () => {
    try {
      const response = await examService.deleteExam(id);
      if (response?.success) {
        toast.success(response.message || 'Xóa đề thi thành công!');
        navigate('/admin/exams');
      } else {
        throw new Error(response?.message || 'Xóa thất bại');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Lỗi xóa: ' + error.message);
    }
  };

  // Get status color
//   const getStatusColor = (isPublished) => {
//     return isPublished ? 'green' : 'orange';
//   };

//   // Get status text
//   const getStatusText = (isPublished) => {
//     return isPublished ? 'Đã xuất bản' : 'Nháp';
//   };

  // Get exam type display
  const getExamTypeDisplay = (examType) => {
    switch (examType?.toLowerCase()) {
      case '15p': return 'Kiểm tra 15 phút';
      case '1tiet': return 'Kiểm tra 1 tiết';
      case 'cuoiky': return 'Thi cuối kỳ';
      case 'giua_ki': return 'Thi giữa kỳ';
      case 'smart_exam': return 'Đề thi thông minh';
      default: return examType || 'Không xác định';
    }
  };

  // Questions table columns
  const questionColumns = [
    {
      title: 'STT',
      key: 'order',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Nội dung câu hỏi',
      key: 'questionText',
      render: (_, record) => {
        const text = record.question?.questionText || 'Chưa có nội dung';
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
      }
    },
    {
      title: 'Loại',
      key: 'questionType',
      width: 120,
      render: (_, record) => {
        const type = record.question?.questionType || 'unknown';
        const displayType = type === 'multiple_choice' ? 'Trắc nghiệm' : 
                           type === 'essay' ? 'Tự luận' : 
                           type === 'true_false' ? 'Đúng/Sai' : type;
        return <Tag>{displayType}</Tag>;
      }
    },
    {
      title: 'Độ khó',
      key: 'difficultyLevel',
      width: 100,
      render: (_, record) => {
        const level = record.question?.difficulty || 'medium';
        return (
          <Tag color={level === 'easy' ? 'green' : level === 'medium' ? 'orange' : 'red'}>
            {level === 'easy' ? 'Dễ' : level === 'medium' ? 'TB' : 'Khó'}
          </Tag>
        );
      }
    },
    {
      title: 'Điểm',
      key: 'points',
      width: 80,
      render: (_, record) => record.pointsWeight || '1'
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <div>Đang tải thông tin đề thi...</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="error-container">
        <Alert
          message="Không tìm thấy đề thi"
          description="Đề thi có thể đã bị xóa hoặc không tồn tại."
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/admin/exams')}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  const examCode = generateExamCode(exam.examId, exam.examType);
  const questionCount = exam.questions?.length || 0;
  const totalPoints = exam.questions?.reduce((sum, q) => sum + (q.pointsWeight || 1), 0) || 0;

  return (
    <div className="exam-detail-page">
      {/* Header */}
      <Card className="header-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/admin/exams')}
              >
                Quay lại
              </Button>
              <Title level={3} style={{ margin: 0 }}>Chi tiết đề thi</Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<EyeOutlined />}
                onClick={() => setQuestionsModalVisible(true)}
                disabled={questionCount === 0}
              >
                Xem câu hỏi ({questionCount})
              </Button>
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

      {/* Exam Code */}
      <Card className="code-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Text strong>Mã đề thi:</Text>
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                {examCode}
              </Tag>
            </Space>
          </Col>
          <Col>
            <Button 
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyCode(examCode)}
            >
              Sao chép
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Số câu hỏi"
              value={questionCount}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Thời gian"
              value={exam.durationMinutes}
              suffix="phút"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng điểm"
              value={totalPoints}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Người thi"
              value={exam.attempts?.length || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Basic Information */}
      <Card title="Thông tin cơ bản" className="info-card">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="ID">{exam.examId}</Descriptions.Item>
          <Descriptions.Item label="Tên đề thi">{exam.examName}</Descriptions.Item>
          <Descriptions.Item label="Loại đề thi">
            <Tag color="cyan">{getExamTypeDisplay(exam.examType)}</Tag>
          </Descriptions.Item>
          {/* <Descriptions.Item label="Trạng thái">
            <Tag color={getStatusColor(exam.isPublished)}>
              {getStatusText(exam.isPublished)}
            </Tag>
          </Descriptions.Item> */}
          <Descriptions.Item label="Người tạo">{exam.createdBy || 'Hệ thống'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {exam.createdAt ? new Date(exam.createdAt).toLocaleString('vi-VN') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {exam.updatedAt ? new Date(exam.updatedAt).toLocaleString('vi-VN') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian làm bài">
            {exam.durationMinutes} phút
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Description */}
      {exam.description && (
        <Card title="Mô tả" className="description-card">
          <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {exam.description}
          </Paragraph>
        </Card>
      )}

      {/* Questions Summary */}
      <Card title="Tổng quan câu hỏi" className="questions-summary-card">
        {questionCount > 0 ? (
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" title="Phân bố độ khó">
                <div className="difficulty-distribution">
                  {['easy', 'medium', 'hard'].map(level => {
                    const count = exam.questions?.filter(q => q.question?.difficulty === level).length || 0;
                    const percentage = questionCount > 0 ? (count / questionCount * 100).toFixed(1) : 0;
                    return (
                      <div key={level} style={{ marginBottom: '8px' }}>
                        <Row justify="space-between">
                          <Col>
                            <Tag color={level === 'easy' ? 'green' : level === 'medium' ? 'orange' : 'red'}>
                              {level === 'easy' ? 'Dễ' : level === 'medium' ? 'Trung bình' : 'Khó'}
                            </Tag>
                          </Col>
                          <Col>{count} câu ({percentage}%)</Col>
                        </Row>
                        <Progress percent={percentage} size="small" showInfo={false} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" title="Phân bố loại câu hỏi">
                <div className="type-distribution">
                  {['multiple_choice', 'true_false', 'essay'].map(type => {
                    const count = exam.questions?.filter(q => q.question?.questionType === type).length || 0;
                    const percentage = questionCount > 0 ? (count / questionCount * 100).toFixed(1) : 0;
                    return (
                      <div key={type} style={{ marginBottom: '8px' }}>
                        <Row justify="space-between">
                          <Col>
                            <Tag>{type === 'multiple_choice' ? 'Trắc nghiệm' : type === 'true_false' ? 'Đúng/Sai' : 'Tự luận'}</Tag>
                          </Col>
                          <Col>{count} câu ({percentage}%)</Col>
                        </Row>
                        <Progress percent={percentage} size="small" showInfo={false} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </Col>
          </Row>
        ) : (
          <Alert
            message="Chưa có câu hỏi"
            description="Đề thi này chưa có câu hỏi nào. Hãy thêm câu hỏi để hoàn thiện đề thi."
            type="info"
            showIcon
          />
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Sửa đề thi"
        open={editModalVisible}
        onOk={handleUpdate}
        onCancel={() => setEditModalVisible(false)}
        width={800}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên đề thi"
            name="examName"
            rules={[{ required: true, message: 'Vui lòng nhập tên đề thi' }]}
          >
            <Input placeholder="Nhập tên đề thi..." />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <TextArea rows={3} placeholder="Nhập mô tả đề thi..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Thời gian (phút)"
                name="durationMinutes"
                rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
              >
                <InputNumber min={1} max={300} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Loại đề thi"
                name="examType"
                rules={[{ required: true, message: 'Vui lòng chọn loại đề thi' }]}
              >
                <Select placeholder="Chọn loại đề thi">
                  <Option value="15p">Kiểm tra 15 phút</Option>
                  <Option value="1tiet">Kiểm tra 1 tiết</Option>
                  <Option value="giua_ki">Thi giữa kỳ</Option>
                  <Option value="cuoiky">Thi cuối kỳ</Option>
                  <Option value="smart_exam">Đề thi thông minh</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Trạng thái"
                name="isPublished"
                valuePropName="checked"
              >
                <Select>
                  <Option value={false}>Nháp</Option>
                  <Option value={true}>Đã xuất bản</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
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
        <p>Bạn có chắc chắn muốn xóa đề thi này không?</p>
        <p><strong>Mã đề thi:</strong> {examCode}</p>
        <p><strong>Tên đề thi:</strong> {exam.examName}</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Questions Modal */}
      <Modal
        title="Danh sách câu hỏi"
        open={questionsModalVisible}
        onCancel={() => setQuestionsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setQuestionsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={1000}
      >
        <Table
          columns={questionColumns}
          dataSource={exam.questions || []}
          rowKey={(record, index) => record.questionId || index}
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
} 