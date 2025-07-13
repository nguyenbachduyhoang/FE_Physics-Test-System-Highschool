import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Button, Space, Modal, Form, Input, Select, InputNumber, Spin, Card, Divider, Row, Col, Collapse } from "antd";
import SafeTable from "../../../components/uiBasic/SafeTable";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined, RobotOutlined, SearchOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { examService, questionBankService } from "../../../services";
import toast from "react-hot-toast";
import notificationService from "../../../services/notificationService";
import systemNotificationService from "../../../services/systemNotificationService";
import "./index.scss";

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;
const { Panel } = Collapse;

export default function ExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mini Question Editor states
  const [questionCount, setQuestionCount] = useState(0);
  const [questions, setQuestions] = useState([]);
  
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

  // Delete confirmation state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch exams from API
  const fetchExams = async (params = {}) => {
    setLoading(true);
    try {
      const response = await examService.getAllExams({
        page: params.current || pagination.current,
        pageSize: params.pageSize || pagination.pageSize,
        search: params.search || searchTerm
      });

      if (response?.success) {
        setExams(response.data || []);
        setPagination({
          ...pagination,
          current: params.current || pagination.current,
          pageSize: params.pageSize || pagination.pageSize,
          total: response.pagination?.totalItems || 0
        });
      } else {
        throw new Error(response?.message || 'Lỗi tải danh sách đề thi');
      }
    } catch (err) {
      console.error('Fetch exams error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
      toast.error(`Lỗi tải danh sách đề thi: ${errorMessage}`);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchExams({
      current: 1,
      pageSize: pagination.pageSize,
      search: value
    });
  };

  // Fetch chapters for AI generation
  const fetchChapters = async () => {
    try {
      const response = await questionBankService.getChapters();
      
      if (response?.success) {
        setChapters(response.data || []);
      } else {
        console.warn('Failed to fetch chapters:', response?.message);
        setChapters([]);
      }
    } catch (err) {
      console.error('Fetch chapters error:', err);
      setChapters([]);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchChapters();
  }, []);

  // ✅ Debug chapters state changes
  useEffect(() => {
  }, [chapters]);

  // ✅ Force refresh chapters for testing
  const forceRefreshChapters = () => {
    setChapters([]); // Clear first
    setTimeout(() => {
      fetchChapters(); // Reload after 100ms
    }, 100);
  };

  // Handle create/update exam
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Validate questions nếu có
      let questionsData = [];
      if (questions.length > 0) {
        // Validate each question
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (!q.questionText.trim()) {
            throw new Error(`Câu hỏi ${i + 1}: Vui lòng nhập nội dung câu hỏi`);
          }
          
          if (q.questionType === 'multiple_choice') {
            const validChoices = q.answerChoices.filter(c => c.text.trim());
            if (validChoices.length < 2) {
              throw new Error(`Câu hỏi ${i + 1}: Cần ít nhất 2 lựa chọn`);
            }
            const hasCorrectAnswer = q.answerChoices.some(c => c.isCorrect);
            if (!hasCorrectAnswer) {
              throw new Error(`Câu hỏi ${i + 1}: Chưa chọn đáp án đúng`);
            }
          }
          
          questionsData.push({
            questionId: q.id,
            questionOrder: i + 1,
            pointsWeight: 1,
            // Thêm thông tin chi tiết của question
            questionData: {
              questionText: q.questionText,
              questionType: q.questionType,
              difficultyLevel: q.difficultyLevel,
              answerChoices: q.answerChoices.map(choice => ({
                choiceLabel: choice.label,
                choiceText: choice.text,
                isCorrect: choice.isCorrect
              }))
            }
          });
        }
      }

      const examData = {
        examName: values.examName,
        description: values.description,
        durationMinutes: values.durationMinutes,
        examType: values.examType,
        questions: questionsData
      };

      if (editingExam) {
        // Update exam
        const response = await examService.updateExam(editingExam.examId, {
          ...examData,
          isPublished: values.isPublished
        });
        console.log('Update response:', response);
        
        if (response.success) {
          notificationService.showSuccess(response.message || "Cập nhật đề thi thành công!");
          
          // Push notification for exam update
          systemNotificationService.notifyExamUpdated({
            examName: examData.examName
          });
        } else {
          throw new Error(response.message || 'Cập nhật thất bại');
        }
      } else {
        // Create exam
        const response = await examService.createExam(examData);
        console.log('Create response:', response);
        
        if (response.success) {
          notificationService.showSuccess(response.message || "Tạo đề thi thành công!");
          
          // Push notification for new exam creation
          systemNotificationService.notifyExamCreated({
            examName: examData.examName,
            questionCount: questionsData.length
          });

          // Nếu có questions thì không cần hỏi, nếu không có thì hỏi
          const examId = response.data?.examId;
          if (examId && questionsData.length === 0) {
            Modal.confirm({
              title: '🎉 Tạo đề thi thành công!',
              content: 'Bạn có muốn thêm câu hỏi cho đề thi này ngay bây giờ không?',
              okText: 'Có, thêm câu hỏi',
              cancelText: 'Để sau',
              onOk: () => {
                navigate(`/admin/exams/${examId}`);
              }
            });
          }
        } else {
          throw new Error(response.message || 'Tạo mới thất bại');
        }
      }

      setIsModalVisible(false);
      setEditingExam(null);
      form.resetFields();
      setQuestions([]);
      setQuestionCount(0);
      fetchExams();
    } catch (err) {
      console.error('Save exam error:', err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`Lỗi lưu đề thi: ${errorMessage}`);
    }
  };

  // Handle delete exam
  const handleDelete = (examId) => {
    setExamToDelete(examId);
    setDeleteModalVisible(true);
  };

    // Confirm delete exam
  const confirmDelete = async () => {
    if (!examToDelete) return;
    
    // Find exam info before deleting
    const examToDeleteInfo = exams.find(exam => exam.examId === examToDelete);
    
    setDeleting(true);
    try {
      const response = await examService.deleteExam(examToDelete);
      
      if (response?.success) {
        notificationService.showSuccess(response.message || "Xóa đề thi thành công!");
        
        // Send system notification to all users about exam deletion
        if (examToDeleteInfo) {
          systemNotificationService.notifyExamDeleted({
            examName: examToDeleteInfo.examName
          });
        }
        
        fetchExams();
      } else {
        throw new Error(response?.message || 'Xóa thất bại');
      }
    } catch (err) {
      console.error('Delete exam error:', err);
      const errorMessage = err.response?.data?.message || err.message;
      notificationService.showError(`Lỗi xóa đề thi: ${errorMessage}`);
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
      setExamToDelete(null);
    }
  };

  // Handle view exam details
  const handleView = (examId) => {
    navigate(`/admin/exams/${examId}`);
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
    setQuestionCount(0);
    setQuestions([]);
  };

  // Initialize questions when question count changes
  const initializeQuestions = (count) => {
    const newQuestions = [];
    for (let i = 0; i < count; i++) {
      newQuestions.push({
        id: `q_${Date.now()}_${i}`,
        questionText: '',
        questionType: 'multiple_choice',
        difficultyLevel: 'medium',
        answerChoices: [
          { label: 'A', text: '', isCorrect: false },
          { label: 'B', text: '', isCorrect: false },
          { label: 'C', text: '', isCorrect: false },
          { label: 'D', text: '', isCorrect: false }
        ]
      });
    }
    setQuestions(newQuestions);
  };

  // Handle question count change
  const handleQuestionCountChange = (count) => {
    setQuestionCount(count);
    initializeQuestions(count);
  };

  // Update question
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    if (field.includes('choice_')) {
      const [_, choiceIndex, choiceField] = field.split('_');
      newQuestions[index].answerChoices[choiceIndex][choiceField] = value;
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  // Set correct answer
  const setCorrectAnswer = (questionIndex, choiceIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].answerChoices.forEach((choice, i) => {
      choice.isCorrect = i === choiceIndex;
    });
    setQuestions(newQuestions);
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
        examName: values.examName, // ✅ Sửa field name
        description: values.description,
        durationMinutes: values.durationMinutes || 45, // ✅ Thêm thời gian làm bài
        examType: values.examType || 'ai_generated',
        questionCount: values.questionCount,
        difficultyLevel: values.difficultyLevel,
        chapterId: values.chapterId
      };

      const response = await examService.generateExam(smartExamData);
      
      if (response?.success) {
        toast.success(response.message || 'Tạo đề thi AI thành công!');
        
        // Push notification for AI-generated exam
        const examName = response.data?.examName || values.examName || 'Đề thi AI';
        const questionCount = response.data?.questions?.length || values.questionCount || 0;
        
        if (examName && examName.trim()) {
          systemNotificationService.notifyExamCreated({
            examName: examName.trim(),
            questionCount: questionCount
          });
        }
        
        setIsAIModalVisible(false);
        aiForm.resetFields();
        await fetchExams(); // Refresh exam list
      } else {
        throw new Error(response?.message || 'Tạo đề thi thất bại');
      }
    } catch (err) {
      console.error('AI generate exam error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
      toast.error(`Lỗi tạo đề thi AI: ${errorMessage}`);
    } finally {
      setGeneratingAI(false);
    }
  };

  // // Get status color and text
  // const getStatusDisplay = (isPublished) => {
  //   if (isPublished) {
  //     return <Tag color="green">Đã xuất bản</Tag>;
  //   } else {
  //     return <Tag color="orange">Nháp</Tag>;
  //   }
  // };

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

  const columns = [
    {
      title: "Mã đề thi",
      dataIndex: "examId",
      key: "examCode",
      render: (examId, record) => {
        const code = generateExamCode(examId, record.examType);
        return (
          <Tag color="cyan" style={{ fontFamily: 'monospace' }}>
            {code}
          </Tag>
        );
      },
      width: 140,
    },
    {
      title: "Tên đề thi",
      dataIndex: "examName",
      key: "examName",
      render: (text) => (
        <span style={{ fontWeight: 500 }} title={text}>
          {text}
        </span>
      ),
      ellipsis: {
        showTitle: false,
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <span title={text}>
          {text}
        </span>
      ),
      ellipsis: {
        showTitle: false,
      },
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
    // {
    //   title: "Trạng thái",
    //   dataIndex: "isPublished",
    //   key: "isPublished",
    //   render: (isPublished) => getStatusDisplay(isPublished),
    //   width: 100,
    // },
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
          <Search
            placeholder="Tìm kiếm đề thi..."
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={handleSearch}
            style={{ width: 300, marginRight: 16 }}
          />
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
            {/* <div className="stat-item">
              <span className="stat-label">Đã xuất bản:</span>
              <span className="stat-value">
                {Array.isArray(exams) ? exams.filter(exam => exam.isPublished).length : 0}
              </span>
            </div> */}
            {/* <div className="stat-item">
              <span className="stat-label">Nháp:</span>
              <span className="stat-value">
                {Array.isArray(exams) ? exams.filter(exam => !exam.isPublished).length : 0}
              </span>
            </div> */}
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
          pageSizeOptions: ['10', '20', '50', '100']
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
          setQuestions([]);
          setQuestionCount(0);
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

          {/* Mini Question Editor - chỉ hiện khi tạo mới */}
          {!editingExam && (
            <>
              <Divider>📝 Câu hỏi (Tùy chọn)</Divider>
              
              <Form.Item label="Số câu hỏi muốn tạo">
                <Row gutter={16} align="middle">
                  <Col span={12}>
                    <InputNumber
                      min={0}
                      max={20}
                      value={questionCount}
                      onChange={handleQuestionCountChange}
                      placeholder="Nhập số câu hỏi"
                      style={{ width: '100%' }}
                    />
                  </Col>
                </Row>
              </Form.Item>

              {questions.length > 0 && (
                <Form.Item label="Danh sách câu hỏi">
                  <Card size="small" style={{ maxHeight: '400px', overflow: 'auto' }}>
                    <Collapse size="small">
                      {questions.map((question, index) => (
                        <Panel 
                          header={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>Câu {index + 1}: {question.questionText || 'Chưa có nội dung'}</span>
                              <Tag color={question.questionType === 'multiple_choice' ? 'blue' : 'green'}>
                                {question.questionType === 'multiple_choice' ? 'Trắc nghiệm' : 'Tự luận'}
                              </Tag>
                            </div>
                          }
                          key={question.id}
                        >
                          <Space direction="vertical" style={{ width: '100%' }}>
                            {/* Question Text */}
                            <div>
                              <label style={{ fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>
                                Nội dung câu hỏi:
                              </label>
                              <TextArea
                                rows={2}
                                value={question.questionText}
                                onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                                placeholder="Nhập nội dung câu hỏi..."
                              />
                            </div>

                            {/* Question Type & Difficulty */}
                            <Row gutter={16}>
                              <Col span={12}>
                                <label style={{ fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>
                                  Loại câu hỏi:
                                </label>
                                <Select
                                  value={question.questionType}
                                  onChange={(value) => updateQuestion(index, 'questionType', value)}
                                  style={{ width: '100%' }}
                                >
                                  <Option value="multiple_choice">Trắc nghiệm</Option>
                                  <Option value="essay">Tự luận</Option>
                                </Select>
                              </Col>
                              <Col span={12}>
                                <label style={{ fontWeight: 'bold', marginBottom: '4px', display: 'block' }}>
                                  Độ khó:
                                </label>
                                <Select
                                  value={question.difficultyLevel}
                                  onChange={(value) => updateQuestion(index, 'difficultyLevel', value)}
                                  style={{ width: '100%' }}
                                >
                                  <Option value="easy">Dễ</Option>
                                  <Option value="medium">Trung bình</Option>
                                  <Option value="hard">Khó</Option>
                                </Select>
                              </Col>
                            </Row>

                            {/* Answer Choices for Multiple Choice */}
                            {question.questionType === 'multiple_choice' && (
                              <div>
                                <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                  Các lựa chọn:
                                </label>
                                {question.answerChoices.map((choice, choiceIndex) => (
                                  <Row key={choiceIndex} gutter={8} align="middle" style={{ marginBottom: '8px' }}>
                                    <Col span={2}>
                                      <Button
                                        size="small"
                                        type={choice.isCorrect ? "primary" : "default"}
                                        onClick={() => setCorrectAnswer(index, choiceIndex)}
                                        style={{ width: '100%' }}
                                      >
                                        {choice.label}
                                      </Button>
                                    </Col>
                                    <Col span={22}>
                                      <Input
                                        value={choice.text}
                                        onChange={(e) => updateQuestion(index, `choice_${choiceIndex}_text`, e.target.value)}
                                        placeholder={`Nhập nội dung đáp án ${choice.label}...`}
                                      />
                                    </Col>
                                  </Row>
                                ))}
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                  💡 Click vào nút A, B, C, D để chọn đáp án đúng
                                </div>
                              </div>
                            )}
                          </Space>
                        </Panel>
                      ))}
                    </Collapse>
                  </Card>
                </Form.Item>
              )}
            </>
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

            <Form.Item
              name="durationMinutes"
              label="Thời gian làm bài (phút)"
              rules={[
                { required: true, message: 'Vui lòng nhập thời gian!' },
                { type: 'number', min: 1, message: 'Thời gian phải lớn hơn 0!' }
              ]}
              initialValue={45}
            >
              <InputNumber 
                min={1} 
                max={300} 
                placeholder="45"
                style={{ width: '100%' }}
              />
            </Form.Item>

            {/* ✅ Debug section - temporary */}
            <div style={{ marginBottom: 16, padding: 8, background: '#f0f0f0', borderRadius: 4, fontSize: 12 }}>
              <strong>🔧 Debug:</strong> {chapters.length} chapters loaded 
              <Button size="small" onClick={forceRefreshChapters} style={{ marginLeft: 8 }}>
                🔄 Refresh Chapters
              </Button>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="chapterId"
                label={`Chương học (${chapters.length} chapters)`}
                rules={[{ required: true, message: 'Vui lòng chọn chương!' }]}
                style={{ flex: 1 }}
              >
                <Select 
                  placeholder={chapters.length > 0 ? "Chọn chương học" : "Đang tải chapters..."}
                  notFoundContent={chapters.length === 0 ? "Đang tải..." : "Không có dữ liệu"}
                  onDropdownVisibleChange={(visible) => {
                    if (visible) {
                      console.log('🎯 Dropdown opened, chapters available:', chapters.length);
                      console.log('🎯 All chapters:', chapters);
                    }
                  }}
                >
                  {chapters.map(chapter => {
                    console.log('🎯 Rendering chapter option:', chapter);
                    return (
                      <Option 
                        key={chapter.chapterId || chapter.ChapterId} 
                        value={chapter.chapterId || chapter.ChapterId}
                      >
                        {chapter.chapterName || chapter.ChapterName} - Lớp {chapter.grade || chapter.Grade}
                      </Option>
                    );
                  })}
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

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa đề thi"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setExamToDelete(null);
        }}
        okText="Xóa"
        okType="danger"
        cancelText="Hủy"
        confirmLoading={deleting}
      >
        <p>Bạn chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
}
