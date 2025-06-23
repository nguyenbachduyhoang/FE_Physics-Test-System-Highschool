import React, { useState, useEffect } from "react";
import "./Home.scss";
import {
  FaRocket,
  FaUsers,
  FaChartLine,
  FaMagic,
  FaLayerGroup,
  FaFileExport,
  FaPlus,
  FaFilter,
  FaChalkboardTeacher,
  FaBookOpen,
} from "react-icons/fa";
import { BsQuestionDiamond, BsClock } from "react-icons/bs";
import Cselect from "../../components/uiBasic/Cselect";
import { Divider, Modal, Switch, Spin, Form, InputNumber, Select, Button } from "antd";
import { useNavigate } from "react-router-dom";
import LayoutContent from "../../components/layoutContent";
import { analyticsService, questionBankService, examService } from "../../services";
import toast from "react-hot-toast";

const mockData = {
  filters: {
    classes: [
      { label: "Lớp 10", value: "10" },
      { label: "Lớp 11", value: "11" },
      { label: "Lớp 12", value: "12" },
    ],
    topics: [
      { label: "Cơ học", value: "cohoc" },
      { label: "Điện học", value: "dienhoc" },
      { label: "Quang học", value: "quanghoc" },
    ],
    levels: [
      { label: "Dễ", value: "easy" },
      { label: "Trung bình", value: "medium" },
      { label: "Khó", value: "hard" },
    ],
  },
  stats: [
    { icon: <FaRocket />, value: "14,700+", label: "Đề thi đã tạo" },
    { icon: <FaUsers />, value: "2,450+", label: "Giáo viên tin dùng" },
    { icon: <FaChartLine />, value: "97%", label: "Độ chính xác AI" },
  ],
  features: [
    {
      icon: <FaMagic />,
      title: "🤖 AI Generation",
      desc: "Tạo đề thi tự động bằng trí tuệ nhân tạo với độ chính xác cao",
    },
    {
      icon: <FaLayerGroup />,
      title: "🧠 Smart Exam",
      desc: "Đề thi thích ứng - AI tự động điều chỉnh độ khó theo năng lực",
    },
    {
      icon: <FaChartLine />,
      title: "📊 Analytics AI",
      desc: "Phân tích chi tiết kết quả học tập bằng machine learning",
    },
    {
      icon: <FaFileExport />,
      title: "⚡ Real-time",
      desc: "Tạo đề thi ngay lập tức, không cần chờ đợi",
    },
  ],
  recent: [
    {
      icon: <FaRocket />,
      text: "Đã tạo đề thi Cơ học - Lớp 10 (5 phút trước)",
    },
    {
      icon: <FaFileExport />,
      text: "Đã xuất đề thi Điện học - Lớp 11 (15 phút trước)",
    },
    {
      icon: <FaMagic />,
      text: "Đã lưu đề thi Quang học - Lớp 12 (1 giờ trước)",
    },
    {
      icon: <FaUsers />,
      text: "Đã chia sẻ đề thi với đồng nghiệp (2 giờ trước)",
    },
  ],
};

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [creatingExam, setCreatingExam] = useState(false);
  const [aiConnectionStatus, setAiConnectionStatus] = useState(null);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Load real data from APIs
  useEffect(() => {
    loadDashboardData();
    loadChapters();
    testAIConnection();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await analyticsService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async () => {
    try {
      console.log('🔄 Loading chapters from API...');
      const chaptersData = await questionBankService.getChapters();
      
      console.log('📦 Raw chapters response:', chaptersData);
      
      // Debug response structure
      if (chaptersData && chaptersData.length > 0) {
        setChapters(chaptersData);
        console.log('✅ Loaded', chaptersData.length, 'chapters from API');
        toast.success(`📚 Đã tải ${chaptersData.length} chương học`);
      } else {
        console.warn('⚠️ Empty chapters response:', chaptersData);
        setChapters([]);
        toast.warning('Chưa có dữ liệu chương học. Vui lòng kiểm tra backend API.');
      }
    } catch (error) {
      console.error('❌ Chapters API error:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setChapters([]);
      toast.error(`Không thể tải danh sách chương học: ${error.message}`);
    }
  };

  const testAIConnection = async () => {
    try {
      const connectionTest = await questionBankService.testAIConnection();
      setAiConnectionStatus(connectionTest);
      
      if (connectionTest.success) {
        toast.success('🤖 AI đã sẵn sàng!', { duration: 2000 });
      } else {
        toast.error('⚠️ AI chưa sẵn sàng, chỉ sử dụng đề mẫu', { duration: 3000 });
      }
    } catch (error) {
      console.error('AI connection test error:', error);
      setAiConnectionStatus({ success: false, connected: false });
      toast.error('⚠️ Không thể kết nối AI', { duration: 3000 });
    }
  };

  // Handle AI Exam Generation
  const handleCreateAIExam = async () => {
    try {
      const values = await form.validateFields();
      setCreatingExam(true);

      // Check if user wants Smart Exam (adaptive) or Regular AI Exam
      if (values.useSmartExam) {
        // Smart Exam Generation - Uses AI to create adaptive exam
        toast.loading('🧠 AI đang tạo đề thi thông minh...', { id: 'smart-generating' });

        // Find selected chapter for naming
        const selectedChapter = chapters.find(c => c.chapterId === values.chapterId);
        const chapterName = selectedChapter ? selectedChapter.chapterName : 'Chương học';

        const smartExamCriteria = {
          name: `Smart Exam - ${chapterName} (${new Date().toLocaleDateString('vi-VN')})`,
          description: `Đề thi thông minh được tạo bằng AI cho ${chapterName}`,
          subjectArea: chapterName,
          difficultyLevel: values.difficulty,
          estimatedDuration: values.duration,
          questionCount: values.questionCount,
          includeMultipleChoice: values.includeMultipleChoice,
          includeEssay: values.includeEssay,
          adaptiveLearning: true
        };

        const smartExam = await examService.generateSmartExam(smartExamCriteria);
        
        toast.dismiss('smart-generating');
        toast.success(`🎯 Đã tạo đề thi thông minh với ${smartExam.totalQuestions} câu hỏi!`, {
          duration: 4000
        });

        // Navigate to smart exam
        setIsModalOpen(false);
        form.resetFields();
        navigate(`/quiz/${smartExam.examId}`);

      } else {
        // Regular AI Question Generation
        const selectedChapter = chapters.find(c => c.chapterId === values.chapterId);
        const questionCriteria = {
          chapterId: values.chapterId,
          difficultyLevel: values.difficulty || "medium",
          questionType: values.includeMultipleChoice ? "multiple_choice" : "essay",
          specificTopic: selectedChapter?.chapterName || "Vật lý",
          saveToDatabase: true  // ✅ PHẢI TRUE để lưu questions vào database
        };

        // Generate questions using AI with rate limit protection
        const generatedQuestions = [];
        const questionCount = values.questionCount || 5; // Reduced default to avoid rate limits
        
        // Add progress toast
        toast.loading(`🤖 Đang tạo câu hỏi 1/${questionCount}...`, { id: 'ai-progress' });
        
        for (let i = 0; i < questionCount; i++) {
          try {
            // Update progress
            toast.loading(`🤖 Đang tạo câu hỏi ${i + 1}/${questionCount}...`, { id: 'ai-progress' });
            
            const question = await questionBankService.generateQuestion(questionCriteria);
            if (question && question.questionId) {
              generatedQuestions.push(question);
              console.log(`✅ Generated question ${i + 1}/${questionCount}: ${question.questionId}`);
            } else {
              console.warn(`⚠️ Invalid question generated at index ${i + 1}`);
            }
            
            // Add delay to avoid rate limiting (4 seconds = 15 requests per minute max)
            if (i < questionCount - 1) {
              toast.loading(`⏳ Chờ ${4} giây để tránh rate limit...`, { id: 'ai-progress' });
              await new Promise(resolve => setTimeout(resolve, 4000));
            }
            
          } catch (err) {
            console.error(`❌ Error generating question ${i + 1}:`, err);
            
            // Check if it's rate limit error
            if (err.message.includes('429') || err.message.includes('Too Many Requests')) {
              toast.error(`⚠️ API rate limited. Đợi 60 giây rồi thử lại...`, { duration: 5000 });
              await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
              i--; // Retry this question
            }
            // Tiếp tục tạo các câu hỏi khác thay vì dừng lại
          }
        }
        
        toast.dismiss('ai-progress');

        if (generatedQuestions.length === 0) {
          throw new Error('Không thể tạo câu hỏi nào bằng AI. Vui lòng thử lại hoặc kiểm tra kết nối AI.');
        }

        console.log(`🎯 Successfully generated ${generatedQuestions.length}/${questionCount} questions`);

        toast.dismiss('ai-generating');
        toast.loading('📝 Đang tạo đề thi...', { id: 'exam-creating' });

        // Step 2: Create Exam with Generated Questions
        const chapterName = selectedChapter?.chapterName || 'Vật lý';
        const examData = {
          examName: `Đề thi AI - ${chapterName} (${new Date().toLocaleDateString('vi-VN')})`,
          description: `Đề thi được tạo tự động bằng AI với ${generatedQuestions.length} câu hỏi`,
          durationMinutes: values.duration || 45,
          examType: "ai_generated",
          createdBy: "ai_system",  // ✅ Sử dụng ai_system user đã tạo trong database
          questions: generatedQuestions.map((q, index) => ({
            questionId: q.questionId,
            questionOrder: index + 1,
            pointsWeight: 1.0
          }))
        };

        const createdExam = await examService.createExam(examData);

        toast.dismiss('exam-creating');
        toast.success(`🎉 Đã tạo đề thi AI thành công với ${generatedQuestions.length} câu hỏi!`, {
          duration: 4000
        });

        // Close modal and navigate to the created exam
        setIsModalOpen(false);
        form.resetFields();
        navigate(`/quiz/${createdExam.examId}`);
      }

    } catch (error) {
      console.error('AI Exam Generation error:', error);
      toast.dismiss();
      const errorMessage = examService.formatError(error);
      toast.error(`❌ Lỗi tạo đề thi AI: ${errorMessage}`, { duration: 5000 });
    } finally {
      setCreatingExam(false);
    }
  };
  return (
    <div className="layout-home">
      <LayoutContent
        layoutType={5}
        content1={
          <>
            <h3 className="home-sidebar-title">
              <FaFilter className="home-sidebar-icon" />
              Lọc đề thi
            </h3>
            <div className="home-sidebar-input">
              <Cselect
                label="Chọn lớp"
                options={mockData.filters.classes}
                prefix={<FaChalkboardTeacher />}
              />
            </div>
            <div className="home-sidebar-input">
              <Cselect
                label="Chủ đề"
                options={mockData.filters.topics}
                prefix={<FaBookOpen style={{ color: "#2DD4BF" }} />}
              />
            </div>
            <div className="home-sidebar-input">
              <Cselect
                label="Độ khó"
                options={mockData.filters.levels}
                prefix={<BsQuestionDiamond />}
              />
            </div>
            <button
              className="home-sidebar-btn"
              onClick={() => navigate("/thiMau")}
            >
              Xem đề thi mẫu
            </button>
            <div className="home-sidebar-recent">
              <h3 className="home-sidebar-recent-title">
                <BsClock />
                Hoạt động gần đây
              </h3>
              <ul className="home-sidebar-recent-list">
                {mockData.recent.map((item, idx) => (
                  <li className="home-sidebar-recent-item" key={idx}>
                    <span className="home-sidebar-recent-icon">
                      {item.icon}
                    </span>
                    <span className="home-sidebar-recent-text">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        }
        content2={
          <>
            <div className="home-main-welcome">
              <h1 className="home-main-welcome-title">
                <FaLayerGroup className="home-main-welcome-icon" />
                Chào mừng đến với{" "}
                <span className="home-main-welcome-brand">Phygens</span>
              </h1>
              <p className="home-main-welcome-desc">
                🤖 Tạo đề thi bằng AI thông minh, nhanh chóng và chính xác. 
                PhyGen sử dụng trí tuệ nhân tạo để tạo ra đề thi phù hợp với mọi mức độ học sinh.
              </p>
              
              {/* AI Status Badge */}
              {aiConnectionStatus && (
                <div className="home-ai-status-badge">
                  <span className="ai-status-indicator">
                    {aiConnectionStatus.connected ? '🟢' : '🔴'}
                  </span>
                  <span className="ai-status-text">
                    {aiConnectionStatus.connected ? 
                      `${aiConnectionStatus.provider || 'AI'} đã sẵn sàng` : 
                      'AI chưa sẵn sàng'
                    }
                  </span>
                  {aiConnectionStatus.model && (
                    <span className="ai-status-model">Model: {aiConnectionStatus.model}</span>
                  )}
                </div>
              )}
              
                             {/* AI Achievements */}
               <div className="home-ai-achievements">
                 <div className="achievement-item">
                   <span className="achievement-icon">⚡</span>
                   <span className="achievement-text">Tạo câu hỏi trong 2-3 giây</span>
                 </div>
                 <div className="achievement-item">
                   <span className="achievement-icon">🎯</span>
                   <span className="achievement-text">Độ chính xác 97%</span>
                 </div>
                 <div className="achievement-item">
                   <span className="achievement-icon">🚀</span>
                   <span className="achievement-text">{chapters.length}+ chương học được hỗ trợ</span>
                 </div>
               </div>
              <button
                className="home-main-welcome-btn"
                onClick={() => setIsModalOpen(true)}
              >
                <FaPlus className="home-main-welcome-btn-icon" />
                Tạo đề mới
              </button>
            </div>
            <div className="home-main-stats">
              {loading ? (
                <Spin size="large" />
              ) : (
                <>
                  <div className="home-main-stat-box">
                    <div className="home-main-stat-icon"><FaRocket /></div>
                    <h3 className="home-main-stat-value">{dashboardData?.totalExams || "0"}+</h3>
                    <p className="home-main-stat-label">Đề thi đã tạo</p>
                  </div>
                  <div className="home-main-stat-box">
                    <div className="home-main-stat-icon"><FaUsers /></div>
                    <h3 className="home-main-stat-value">{dashboardData?.totalUsers || "0"}+</h3>
                    <p className="home-main-stat-label">Người dùng đăng ký</p>
                  </div>
                  <div className="home-main-stat-box">
                    <div className="home-main-stat-icon"><FaChartLine /></div>
                    <h3 className="home-main-stat-value">{chapters.length || "0"}</h3>
                    <p className="home-main-stat-label">Chương học</p>
                  </div>
                </>
              )}
            </div>
            <h3 className="home-main-feature-title">
              <FaMagic className="home-main-feature-icon" />
              Tính năng nổi bật
            </h3>
            <div className="home-main-features">
              {mockData.features.map((feature, idx) => (
                <div className="home-main-feature-box" key={idx}>
                  <div className="home-main-feature-box-icon">
                    {feature.icon}
                  </div>
                  <h4 className="home-main-feature-box-title">
                    {feature.title}
                  </h4>
                  <p className="home-main-feature-box-desc">{feature.desc}</p>
                </div>
              ))}
            </div>
          </>
        }
      />

      {/* AI Test Connection Status */}
      {loading && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          background: '#1890ff', 
          color: '#fff', 
          padding: '12px 20px', 
          borderRadius: '6px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          🤖 Đang kiểm tra kết nối AI...
        </div>
      )}

      <Modal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        centered
        className="custom-create-exam-modal"
        closeIcon={<span style={{ color: "#fff", fontSize: 30 }}>&times;</span>}
        width={600}
      >
        <div>
          <h2 className="modal-title">🤖 Tạo đề thi bằng AI</h2>
          <p style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
            PhyGen sử dụng AI để tạo đề thi phù hợp với yêu cầu của bạn
          </p>
          
          <Form form={form} layout="vertical">
            <Form.Item
              name="chapterId"
              label={<span style={{ color: '#fff' }}>Chương học</span>}
              // rules={[{ required: true, message: 'Vui lòng chọn chương học!' }]}
            >
              <Select placeholder="Chọn chương học" loading={chapters.length === 0}>
                {Array.isArray(chapters) ? chapters.map(chapter => (
                  <Select.Option key={chapter.chapterId} value={chapter.chapterId}>
                    Lớp {chapter.grade} - {chapter.chapterName}
                  </Select.Option>
                )) : []}
              </Select>
            </Form.Item>

            <Form.Item
              name="questionCount"
              label={<span style={{ color: '#fff' }}>Câu hỏi (tối đa 15)</span>}
              initialValue={5}
              rules={[
                { required: true, message: 'Vui lòng nhập số câu hỏi!' },
                { type: 'number', min: 1, max: 15, message: 'Số câu hỏi từ 1-15 (giới hạn API)!' }
              ]}
              extra={<span style={{ color: '#ffeb3b', fontSize: '12px' }}>
                ⚠️ Giới hạn 15 câu/phút do API rate limit. Nhiều hơn sẽ mất thời gian chờ.
              </span>}
            >
              <InputNumber min={1} max={15} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="difficulty"
              label={<span style={{ color: '#fff' }}>Độ khó</span>}
              initialValue="medium"
              rules={[{ required: true, message: 'Vui lòng chọn độ khó!' }]}
            >
              <Select placeholder="Chọn độ khó">
                <Select.Option value="easy">Dễ</Select.Option>
                <Select.Option value="medium">Trung bình</Select.Option>
                <Select.Option value="hard">Khó</Select.Option>
              </Select>
            </Form.Item>

                         <Form.Item
               name="duration"
               label={<span style={{ color: '#fff' }}>Thời gian (phút)</span>}
               initialValue={45}
             >
               <InputNumber min={15} max={180} style={{ width: '100%' }} />
             </Form.Item>

             <Divider style={{ background: "white", margin: "16px 0" }} />
             
             <Form.Item name="useSmartExam" valuePropName="checked" initialValue={false}>
               <div className="modal-switch-row">
                 <span className="modal-label">
                   🧠 Smart Exam (AI thích ứng)
                   <br />
                   <small style={{ opacity: 0.8 }}>Tự động điều chỉnh độ khó theo năng lực</small>
                 </span>
                 <Switch />
               </div>
             </Form.Item>
            
            <Form.Item name="includeEssay" valuePropName="checked" initialValue={true}>
              <div className="modal-switch-row">
                <span className="modal-label">Tự luận</span>
                <Switch defaultChecked />
              </div>
            </Form.Item>

            <Form.Item name="includeMultipleChoice" valuePropName="checked" initialValue={true}>
              <div className="modal-switch-row">
                <span className="modal-label">Trắc nghiệm</span>
                <Switch defaultChecked />
              </div>
            </Form.Item>
          </Form>

          <div className="modal-btn-row">
            <Button 
              className="modal-btn"
              type="primary"
              size="large"
              loading={creatingExam}
              onClick={handleCreateAIExam}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                height: '50px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {creatingExam ? (
                <>🤖 AI đang tạo đề thi...</>
              ) : (
                <>🚀 Tạo đề thi bằng AI</>
              )}
            </Button>
            
            <Button 
              className="modal-btn"
              size="large"
              onClick={() => navigate("/thiMau")}
              style={{
                marginTop: '10px',
                background: 'transparent',
                border: '2px solid #fff',
                color: '#fff',
                height: '45px'
              }}
            >
              📋 Hoặc chọn đề có sẵn
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
