import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Button, Space, Modal, Form, Input, Select, InputNumber, Spin, Card, Divider } from "antd";
import SafeTable from "../../../components/uiBasic/SafeTable";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined, RobotOutlined, SearchOutlined } from "@ant-design/icons";
import { examService, questionBankService } from "../../../services";
import toast from "react-hot-toast";
import notificationService from "../../../services/notificationService";
import systemNotificationService from "../../../services/systemNotificationService";
import "./index.scss";

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

export default function ExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  
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
      console.log('🎯 Raw response:', response);
      console.log('🎯 Response type:', typeof response);
      console.log('🎯 Is array?', Array.isArray(response));
      console.log('🎯 Has data?', !!response?.data);
      console.log('🎯 Data success?', !!response?.data?.success);
      
      let chaptersData = [];
      
      // Try multiple response formats
      if (response?.data?.success && Array.isArray(response.data.data)) {
        // Home.jsx format: {data: {success: true, data: [...]}}
        chaptersData = response.data.data;
        console.log('🎯 Using Home.jsx format');
      } else if (Array.isArray(response)) {
        // Direct array format: [...]
        chaptersData = response;
        console.log('🎯 Using direct array format');
      } else {
        console.warn('🎯 Unknown format, setting empty');
      }
      
      console.log('🎯 Final chapters:', chaptersData.length, 'items');
      setChapters(chaptersData);
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
      
      const examData = {
        examName: values.examName,
        description: values.description,
        durationMinutes: values.durationMinutes,
        examType: values.examType,
        questions: [] // Empty for now, can be added later
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
            questionCount: examData.questions?.length || 0
          });
        } else {
          throw new Error(response.message || 'Tạo mới thất bại');
        }
      }

      setIsModalVisible(false);
      setEditingExam(null);
      form.resetFields();
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
      console.log('Delete response:', response);
      
      // Check for different response formats
      const success = response?.success || response?.data?.success || response?.status === 'success';
      const message = response?.message || response?.data?.message || "Xóa đề thi thành công!";
      
      if (success !== false) { // Consider success if not explicitly false
        notificationService.showSuccess(message);
        
        // Send system notification to all users about exam deletion
        if (examToDeleteInfo) {
          systemNotificationService.notifyExamDeleted({
            examName: examToDeleteInfo.examName
          });
        }
        
        fetchExams();
      } else {
        throw new Error(message || 'Xóa thất bại');
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

      const response = await examService.generateExam(smartExamData); // ✅ Gọi đúng API
      console.log('🎯 Full AI exam response:', response); // ✅ Debug response
      
              // ✅ Check multiple response formats
        if (response.success || response.data?.success) {
          const generatedExam = response.data || response;
          toast.success(`Tạo đề thi AI thành công! Exam ID: ${generatedExam.examId}`);
          
          // Push notification for AI-generated exam
          const examName = generatedExam.examName || values.examName || 'Đề thi AI';
          const questionCount = generatedExam.questionCount || values.questionCount || 0;
          
          if (examName && examName.trim()) {
            systemNotificationService.notifyExamCreated({
              examName: examName.trim(),
              questionCount: questionCount
            });
          } else {
            console.warn('⚠️ Skipping notification - examName is empty');
          }
          
          setIsAIModalVisible(false);
          aiForm.resetFields();
          await fetchExams(); // Refresh exam list
        } else {
          throw new Error(response.message || response.data?.message || 'Tạo đề thi thất bại');
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
