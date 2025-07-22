import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Button, Space, Modal, Form, Input, Select, Card, Empty, Alert, Spin, Dropdown, Menu } from "antd";
import SafeTable from "../../../components/uiBasic/SafeTable";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined, SearchOutlined, BulbOutlined } from "@ant-design/icons";
import { questionBankService } from "../../../services";
import systemNotificationService from "../../../services/systemNotificationService";
import toast from "react-hot-toast";
import "./index.scss";

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

export default function QuestionsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [form] = Form.useForm();
  const [aiForm] = Form.useForm();
  
  // Delete confirmation state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [latestFilter, setLatestFilter] = useState(true); // true: mới nhất, false: cũ nhất

  // Fetch questions from API with pagination
  const fetchQuestions = async (page = 1, pageSize = 10, search = '', sort = 'createdAt', direction = 'desc') => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        search,
        sortBy: sort,
        sortDirection: direction
      };
      const response = await questionBankService.getQuestions(params);
      
      if (response?.success && response.data) {
        // Backend returns: { success: true, data: { questions: [...], pagination: {...} } }
        const responseData = response.data;
        const questionsArray = responseData.questions || [];
        const paginationInfo = responseData.pagination || {};
        
        setQuestions(questionsArray);
        setPagination({
          current: paginationInfo.currentPage || page,
          pageSize: paginationInfo.pageSize || pageSize,
          total: paginationInfo.totalCount || questionsArray.length
        });
        
        if (questionsArray.length === 0) {
          // toast.info('Không có câu hỏi nào được tìm thấy');
        }
      } else {
        console.error('API response not successful:', response);
        toast.error(response?.message || 'Không thể tải danh sách câu hỏi');
        setQuestions([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (err) {
      console.error('Fetch questions error:', err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`Lỗi tải dữ liệu: ${errorMessage}`);
      setQuestions([]);
      setPagination(prev => ({ ...prev, total: 0 }));
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
      const response = await questionBankService.getChapters();
      
      if (response?.success && Array.isArray(response.data)) {
        // Backend returns: { success: true, data: [Chapter...] }
        setChapters(response.data);
        
        if (response.data.length === 0) {
          toast.warning('Không có dữ liệu chương học');
        }
      } else {
        console.error('Invalid chapters response format:', response);
        toast.error(response?.message || 'Không thể tải danh sách chương học');
        setChapters([]);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
      toast.error('Lỗi khi tải danh sách chương học');
      setChapters([]);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchQuestions(1, pagination.pageSize, value, sortBy, sortDirection);
  };

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (paginationInfo, filters, sorter) => {
    let newSortBy = sortBy;
    let newSortDirection = sortDirection;
    
    if (sorter && sorter.field) {
      newSortBy = sorter.field;
      newSortDirection = sorter.order === 'descend' ? 'desc' : 'asc';
      setSortBy(newSortBy);
      setSortDirection(newSortDirection);
    }
    
    fetchQuestions(
      paginationInfo.current, 
      paginationInfo.pageSize, 
      searchTerm,
      newSortBy,
      newSortDirection
    );
  };

  // Handle create/update question
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values); 
      
      const selectedChapter = chapters.find(c => c.chapterId === values.chapterId);
      
      const questionData = {
        questionText: values.questionText,
        difficultyLevel: values.difficultyLevel,
        chapterId: values.chapterId,
        topic: selectedChapter?.chapterName || '',
        questionType: values.questionType || "multiple_choice",
        explanation: values.explanation || "",
        isActive: true,
        saveToDatabase: true, 
        isMockQuestion: false 
      };
      
      // Add answer choices based on question type (MANUAL ONLY)
      if (values.questionType === 'multiple_choice') {
        questionData.answerChoices = [
          { choiceLabel: 'A', choiceText: values.choiceA, isCorrect: values.correctAnswer === 'A' },
          { choiceLabel: 'B', choiceText: values.choiceB, isCorrect: values.correctAnswer === 'B' },
          { choiceLabel: 'C', choiceText: values.choiceC, isCorrect: values.correctAnswer === 'C' },
          { choiceLabel: 'D', choiceText: values.choiceD, isCorrect: values.correctAnswer === 'D' }
        ];
      } else if (values.questionType === 'true_false') {
        questionData.answerChoices = [
          { choiceLabel: 'Đúng', choiceText: 'Đúng', isCorrect: values.correctAnswer === 'true' },
          { choiceLabel: 'Sai', choiceText: 'Sai', isCorrect: values.correctAnswer === 'false' }
        ];
      } else if (values.questionType === 'fill_blank') {
        questionData.correctAnswer = values.correctAnswer;
      }
      // Essay không cần answer choices cố định
      
      console.log('📝 Manual question data:', questionData);

      if (editingQuestion) {
        // Update question - backend trả về response.data trực tiếp từ service
        const response = await questionBankService.updateQuestion(editingQuestion.questionId, questionData);
        console.log('Update response:', response);
        if (response.success) {
          toast.success(response.message || "Cập nhật câu hỏi thành công!");
          setIsModalVisible(false);
          setEditingQuestion(null);
          form.resetFields();
          fetchQuestions(pagination.current, pagination.pageSize, searchTerm, sortBy, sortDirection);
        } else {
          throw new Error(response.message || 'Cập nhật thất bại');
        }
      } else {
        // Create question - backend trả về response.data trực tiếp từ service
        const response = await questionBankService.createQuestion(questionData);
        console.log('Create response:', response);
        if (response.success) {
          toast.success(response.message || "Thêm câu hỏi thành công!");
          
          // Send system notification for manual question creation
          systemNotificationService.sendSystemNotification({
            title: '📝 Câu hỏi mới đã có!',
            message: `Admin vừa tạo câu hỏi về "${selectedChapter?.chapterName || 'chủ đề'}" thủ công`,
            type: 'info',
            icon: '✍️',
            url: '/admin/questions'
          });
          
          setIsModalVisible(false);
          form.resetFields();
          fetchQuestions(pagination.current, pagination.pageSize, searchTerm, sortBy, sortDirection);
        } else {
          throw new Error(response.message || 'Thêm mới thất bại');
        }
      }
    } catch (err) {
      console.error('Save question error:', err);
      if (err.response?.data?.errors) {
        // Log validation errors from backend
        console.log('Validation errors:', err.response.data.errors);
        Object.entries(err.response.data.errors).forEach(([field, errors]) => {
          form.setFields([{
            name: field,
            errors: Array.isArray(errors) ? errors : [errors]
          }]);
        });
      }
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };

  // Handle delete question - show confirmation modal
  const handleDelete = (questionId) => {
    console.log('handleDelete called with questionId:', questionId);
    setQuestionToDelete(questionId);
    setDeleteModalVisible(true);
  };

  // Confirm delete question
  const confirmDelete = async () => {
    if (!questionToDelete) return;
    
    setDeleting(true);
    try {
      console.log('Calling deleteQuestion API with ID:', questionToDelete);
      const response = await questionBankService.deleteQuestion(questionToDelete);
      console.log('Delete response:', response);
      
      if (response && response.success) {
        toast.success(response.message || "Xóa câu hỏi thành công!");
        fetchQuestions(pagination.current, pagination.pageSize, searchTerm, sortBy, sortDirection);
        setDeleteModalVisible(false);
        setQuestionToDelete(null);
      } else {
        console.error('Response success is false:', response);
        throw new Error(response?.message || 'Xóa thất bại');
      }
    } catch (err) {
      console.error('Delete question error:', err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`Lỗi xóa câu hỏi: ${errorMessage}`);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    console.log('Delete cancelled');
    setDeleteModalVisible(false);
    setQuestionToDelete(null);
  };

  // Handle view question details
  const handleView = (question) => {
    navigate(`/admin/questions/${question.questionId}`);
  };

  // Handle edit question
  const handleEdit = (question) => {
    setEditingQuestion(question);
    setIsModalVisible(true);
    
    const formValues = {
      questionText: question.questionText,
      difficultyLevel: question.difficultyLevel,
      chapterId: question.chapterId,
      questionType: question.questionType,
      explanation: question.explanation
    };
    
    // Load answer choices if available
    if (question.answerChoices && Array.isArray(question.answerChoices)) {
      const choices = question.answerChoices;
      
      if (question.questionType === 'multiple_choice') {
        const choiceA = choices.find(c => c.choiceLabel === 'A');
        const choiceB = choices.find(c => c.choiceLabel === 'B');
        const choiceC = choices.find(c => c.choiceLabel === 'C');
        const choiceD = choices.find(c => c.choiceLabel === 'D');
        const correctChoice = choices.find(c => c.isCorrect);
        
        formValues.choiceA = choiceA?.choiceText || '';
        formValues.choiceB = choiceB?.choiceText || '';
        formValues.choiceC = choiceC?.choiceText || '';
        formValues.choiceD = choiceD?.choiceText || '';
        formValues.correctAnswer = correctChoice?.choiceLabel || '';
      } else if (question.questionType === 'true_false') {
        const correctChoice = choices.find(c => c.isCorrect);
        formValues.correctAnswer = correctChoice?.choiceLabel === 'Đúng' ? 'true' : 'false';
      }
    } else if (question.correctAnswer) {
      // For fill_blank type
      formValues.correctAnswer = question.correctAnswer;
    }
    
    console.log('📝 Edit form values:', formValues);
    form.setFieldsValue(formValues);
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
      console.log('🎯 AI form values:', values);
      console.log('🎯 Available chapters:', chapters);
      
      setAiGenerating(true);
      
      // Find selected chapter for additional data
      const selectedChapter = chapters.find(c => c.chapterId === values.chapterId);
      console.log('🎯 Selected chapter:', selectedChapter);
      
      const criteria = {
        chapterId: values.chapterId || selectedChapter?.chapterId,
        topicId: selectedChapter?.topicId || 1,
        difficultyLevel: values.difficultyLevel || 'medium',
        questionType: values.questionType || 'multiple_choice',
        topic: values.topic || selectedChapter?.chapterName || 'Vật lý',
        chapterName: selectedChapter?.chapterName || 'Chương học',
        saveToDatabase: true
      };
      
      console.log('🎯 AI generation criteria:', criteria);
      
      // Validate required fields
      if (!criteria.topic?.trim()) {
        throw new Error('Vui lòng nhập chủ đề câu hỏi');
      }
      
      if (!criteria.difficultyLevel) {
        throw new Error('Vui lòng chọn mức độ khó');
      }
      
      // Generate single question
      const response = await questionBankService.generateQuestion(criteria);
      console.log('🎯 AI generation response:', response);
      
      if (response?.success) {
        const successMessage = response.message || 'Đã tạo câu hỏi AI thành công!';
        
        // Show success toast
        toast.success(successMessage);
        
        // Send system notification
        systemNotificationService.sendSystemNotification({
          title: '✨ Câu hỏi AI mới đã có!',
          message: `Câu hỏi về "${criteria.topic}" vừa được tạo bằng AI`,
          type: 'success',
          icon: '🤖',
          url: '/admin/questions'
        });
        
        // Refresh questions list and close modal
        fetchQuestions(pagination.current, pagination.pageSize, searchTerm, sortBy, sortDirection);
        setShowAIModal(false);
        aiForm.resetFields();
      } else {
        throw new Error(response?.message || 'Tạo câu hỏi AI thất bại');
      }
    } catch (err) {
      console.error('AI Generation error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
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

  // Generate question code
  const generateQuestionCode = (questionId, chapterId) => {
    const timestamp = new Date().getTime().toString().slice(-6);
    return `QS${chapterId || '00'}_${timestamp}_${questionId?.slice(-4) || '0000'}`;
  };

  // Thay đổi filter mới nhất
  const handleLatestFilter = (isLatest) => {
    setLatestFilter(isLatest);
    setSortBy('createdAt');
    setSortDirection(isLatest ? 'desc' : 'asc');
    fetchQuestions(1, pagination.pageSize, searchTerm, 'createdAt', isLatest ? 'desc' : 'asc');
  };

  const getTotalByDifficulty = async (level) => {
    const response = await questionBankService.getQuestions({
      difficultyLevel: level,
      page: 1,
      pageSize: 1 // chỉ cần lấy totalCount
    });
    return response?.data?.pagination?.totalCount || 0;
  };

  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const easy = await getTotalByDifficulty('easy');
      const medium = await getTotalByDifficulty('medium');
      const hard = await getTotalByDifficulty('hard');
      setStats({ easy, medium, hard });
    };
    fetchStats();
  }, []);

const columns = [
  {
    title: "STT",
    key: "stt",
    width: 80,
    align: 'center',
    render: (text, record, idx) => ((pagination.current - 1) * pagination.pageSize + idx + 1),
  },
  {
    title: "Mã câu hỏi",
    dataIndex: "questionId",
    key: "questionCode",
    render: (questionId, record) => {
      const code = generateQuestionCode(questionId, record.chapterId);
      return (
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {code}
        </Tag>
      );
    },
    width: 150,
  },
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
      render: (_, record) => {
        const topicText = record.topic?.topicName || record.topic || 'Chưa phân loại';
        return (
          <Tag color="blue" title={topicText}>
            {topicText.length > 20 ? `${topicText.substring(0, 20)}` : topicText}
          </Tag>
        );
      },
      width: 150,
      ellipsis: true,
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
          <Select
            value={latestFilter ? 'desc' : 'asc'}
            style={{ width: 160, marginRight: 8 }}
            onChange={val => handleLatestFilter(val === 'desc')}
          >
            <Option value="desc">Mới nhất gần đây</Option>
            <Option value="asc">Cũ nhất trước</Option>
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => fetchQuestions(pagination.current, pagination.pageSize, searchTerm, sortBy, sortDirection)}
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
            🤖 Tạo câu hỏi AI
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
              <span className="stat-value">{pagination.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Câu hỏi dễ:</span>
              <span className="stat-value">{stats.easy}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Câu hỏi trung bình:</span>
              <span className="stat-value">{stats.medium}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Câu hỏi khó:</span>
              <span className="stat-value">{stats.hard}</span>
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
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} câu hỏi`,
          pageSizeOptions: ['10', '20', '50', '100','150','200']
        }}
        onChange={handleTableChange}
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
            name="chapterId"
            label="Chương"
            rules={[{ required: true, message: 'Vui lòng chọn chương!' }]}
          >
            <Select placeholder="Chọn chương">
              {Array.isArray(chapters) ? chapters.map(chapter => (
                <Option key={chapter.chapterId} value={chapter.chapterId}>
                  {chapter.chapterName}
                </Option>
              )) : []}
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

          {/* Đáp án cho câu trắc nghiệm */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.questionType !== currentValues.questionType}>
            {({ getFieldValue }) => {
              const questionType = getFieldValue('questionType');
              
              if (questionType === 'multiple_choice') {
                return (
                  <>
                    <Form.Item label="Đáp án trắc nghiệm" style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                        Nhập 4 đáp án A, B, C, D và chọn đáp án đúng:
                      </div>
                    </Form.Item>
                    
                    <Form.Item
                      name="choiceA"
                      label="Đáp án A"
                      rules={[{ required: true, message: 'Vui lòng nhập đáp án A!' }]}
                    >
                      <Input placeholder="Nhập nội dung đáp án A..." />
                    </Form.Item>
                    
                    <Form.Item
                      name="choiceB"
                      label="Đáp án B"
                      rules={[{ required: true, message: 'Vui lòng nhập đáp án B!' }]}
                    >
                      <Input placeholder="Nhập nội dung đáp án B..." />
                    </Form.Item>
                    
                    <Form.Item
                      name="choiceC"
                      label="Đáp án C"
                      rules={[{ required: true, message: 'Vui lòng nhập đáp án C!' }]}
                    >
                      <Input placeholder="Nhập nội dung đáp án C..." />
                    </Form.Item>
                    
                    <Form.Item
                      name="choiceD"
                      label="Đáp án D"
                      rules={[{ required: true, message: 'Vui lòng nhập đáp án D!' }]}
                    >
                      <Input placeholder="Nhập nội dung đáp án D..." />
                    </Form.Item>
                    
                    <Form.Item
                      name="correctAnswer"
                      label="Đáp án đúng"
                      rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng!' }]}
                    >
                      <Select placeholder="Chọn đáp án đúng">
                        <Option value="A">A</Option>
                        <Option value="B">B</Option>
                        <Option value="C">C</Option>
                        <Option value="D">D</Option>
                      </Select>
                    </Form.Item>
                  </>
                );
              }
              
              if (questionType === 'true_false') {
                return (
                  <Form.Item
                    name="correctAnswer"
                    label="Đáp án đúng"
                    rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng!' }]}
                  >
                    <Select placeholder="Chọn đáp án đúng">
                      <Option value="true">Đúng</Option>
                      <Option value="false">Sai</Option>
                    </Select>
                  </Form.Item>
                );
              }
              
              if (questionType === 'fill_blank') {
                return (
                  <Form.Item
                    name="correctAnswer"
                    label="Đáp án đúng"
                    rules={[{ required: true, message: 'Vui lòng nhập đáp án đúng!' }]}
                  >
                    <Input placeholder="Nhập đáp án đúng cho chỗ trống..." />
                  </Form.Item>
                );
              }
              
              // Essay không cần đáp án cố định
              return null;
            }}
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
        title="🤖 Tạo câu hỏi bằng AI"
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
            name="chapterId"
            label="Chương (bỏ chọn)"
            extra={`Debug: ${chapters.length} chapters loaded`}
          >
            <Select placeholder="Chọn chương học cụ thể..." allowClear>
              {Array.isArray(chapters) ? chapters.map(chapter => (
                <Option key={chapter.chapterId} value={chapter.chapterId}>
                  {chapter.chapterName}
                </Option>
              )) : []}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa câu hỏi"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText="Xóa"
        okType="danger"
        cancelText="Hủy"
        confirmLoading={deleting}
        destroyOnClose
      >
        <p>Bạn chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
}
