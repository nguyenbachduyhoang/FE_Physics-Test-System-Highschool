/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "./Home.scss";
import { motion, AnimatePresence } from "framer-motion";
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
import { Divider, Modal, Switch, Form, InputNumber, Select, Button } from "antd";
import { useNavigate } from "react-router-dom";
import LayoutContent from "../../components/layoutContent";
import { analyticsService, questionBankService, examService } from "../../services";
import toast from "react-hot-toast";
import ParticlesBackground from "../../components/ParticlesBackground";

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

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [filteredChapters, setFilteredChapters] = useState([]);
  const [creatingExam, setCreatingExam] = useState(false);
  const [aiConnectionStatus] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [recentExams, setRecentExams] = useState([]);
  
  // Filter states for sidebar (will be passed to thiMau page)
  const [filterGrade, setFilterGrade] = useState(null);
  const [filterTopic, setFilterTopic] = useState(null);
  const [filterDifficulty, setFilterDifficulty] = useState(null);
  
  // Dynamic options loaded from API
  const [gradeOptions, setGradeOptions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);
  const [difficultyOptions] = useState([
    { value: "easy", label: "Dễ" },
    { value: "medium", label: "Trung bình" },
    { value: "hard", label: "Khó" }
  ]);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [hoveredStat, setHoveredStat] = useState(null);

  // Thời gian thi options
  const durationOptions = [
    { label: "15 phút (Kiểm tra nhanh)", value: 15 },
    { label: "30 phút (Kiểm tra ngắn)", value: 30 },
    { label: "45 phút (Kiểm tra 1 tiết)", value: 45 },
    { label: "60 phút (Kiểm tra học kỳ)", value: 60 },
    { label: "90 phút (Thi học kỳ)", value: 90 },
    { label: "120 phút (Thi tốt nghiệp)", value: 120 },
  ];

  // Load real data from APIs
  useEffect(() => {
    loadDashboardData();
    loadChapters();
    loadFilterOptions();
  }, []);

  // Load filter options from chapters API
  const loadFilterOptions = async () => {
    try {
      const chaptersData = await questionBankService.getChapters();
      
      if (chaptersData && chaptersData.length > 0) {
        // Extract unique grades
        const uniqueGrades = [...new Set(chaptersData.map(chapter => chapter.grade))].sort();
        const gradeOpts = uniqueGrades.map(grade => ({
          value: grade,
          label: `Lớp ${grade}`
        }));
        setGradeOptions(gradeOpts);

        // Extract unique chapter names as topics
        const uniqueChapters = [...new Set(chaptersData.map(chapter => chapter.chapterName))].sort();
        const topicOpts = uniqueChapters.map(chapterName => ({
          value: chapterName,
          label: chapterName
        }));
        setTopicOptions(topicOpts);

        console.log('📋 Filter options loaded:', { grades: gradeOpts.length, topics: topicOpts.length });
      }
    } catch (error) {
      console.error('❌ Error loading filter options:', error);
      // Fallback to default options
      setGradeOptions([
        { value: 10, label: "Lớp 10" },
        { value: 11, label: "Lớp 11" },
        { value: 12, label: "Lớp 12" }
      ]);
      setTopicOptions([
        { value: "Cơ học", label: "Cơ học" },
        { value: "Điện học", label: "Điện học" },
        { value: "Quang học", label: "Quang học" }
      ]);
    }
  };

  const loadDashboardData = async () => {
    try {
      const data = await analyticsService.getDashboard();
      setDashboardData(data);

      // Load recent activities if they exist in dashboard data
      if (data && data.recentActivities && Array.isArray(data.recentActivities)) {
        const formattedActivities = data.recentActivities.map(activity => {
          let icon = <FaRocket />;

          switch (activity.type) {
            case 'exam_created':
              icon = <FaRocket />;
              break;
            case 'question_created':
              icon = <FaMagic />;
              break;
            case 'exam_shared':
              icon = <FaUsers />;
              break;
            case 'exam_exported':
              icon = <FaFileExport />;
              break;
            default:
              icon = <FaChartLine />;
          }

          return {
            id: activity.id,
            icon: icon,
            text: activity.description,
            time: new Date(activity.createdAt).toLocaleString('vi-VN'),
            type: activity.type
          };
        });
        setRecentExams(formattedActivities);
      } else {
        // Load recent activities separately if not in dashboard
        await loadRecentActivities();
      }

      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Load recent activities separately
  const loadRecentActivities = async () => {
    try {
      const recentActivities = await analyticsService.getRecentActivities(10);

      if (Array.isArray(recentActivities) && recentActivities.length > 0) {
        const formattedActivities = recentActivities.map(activity => {
          let icon = <FaRocket />;

          switch (activity.type) {
            case 'exam_created':
              icon = <FaRocket />;
              break;
            case 'question_created':
              icon = <FaMagic />;
              break;
            case 'exam_shared':
              icon = <FaUsers />;
              break;
            case 'exam_exported':
              icon = <FaFileExport />;
              break;
            default:
              icon = <FaChartLine />;
          }

          return {
            id: activity.id,
            icon: icon,
            text: activity.description,
            time: new Date(activity.createdAt).toLocaleString('vi-VN'),
            type: activity.type
          };
        });

        setRecentExams(formattedActivities);
      } else {
        setRecentExams([]);
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
      setRecentExams([]);
    }
  };

  // Load chapters from API
  const loadChapters = async () => {
    try {
      const response = await questionBankService.getChapters();
      console.log('API Response:', response);

      if (response?.data?.success) {
        const chaptersData = response.data.data;
        console.log('Chapters data:', chaptersData);
        
        if (Array.isArray(chaptersData) && chaptersData.length > 0) {
          // Lưu toàn bộ chapters
          setChapters(chaptersData);
          setFilteredChapters(chaptersData);
          
          // Tạo options cho dropdown grade
          const uniqueGrades = [...new Set(chaptersData.map(chapter => chapter.grade))].sort();
          const gradeOpts = uniqueGrades.map(grade => ({
            value: grade,
            label: `Lớp ${grade}`
          }));
          setGradeOptions(gradeOpts);
          
          console.log('Grade options:', gradeOpts);
        } else {
          console.warn('No chapters data found');
          toast.error('Không có dữ liệu chương học');
          setChapters([]);
          setFilteredChapters([]);
          setGradeOptions([]);
        }
      } else {
        console.error('API response not successful:', response);
        toast.error('Không thể tải danh sách chương học');
        setChapters([]);
        setFilteredChapters([]);
        setGradeOptions([]);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
      toast.error('Lỗi khi tải danh sách chương học');
      setChapters([]);
      setFilteredChapters([]);
      setGradeOptions([]);
    }
  };

  const handleGradeChange = (value) => {
    console.log('Selected grade:', value);
    console.log('Current chapters:', chapters);
    
    setSelectedGrade(value);
    
    // Reset chapter selection
    form.setFieldsValue({ chapterId: undefined });

    if (value) {
      // Filter chapters by selected grade
      const filtered = chapters.filter(chapter => chapter.grade === value);
      console.log('Filtered chapters:', filtered);
      
      if (filtered && filtered.length > 0) {
        setFilteredChapters(filtered);
        console.log(`🎓 Found ${filtered.length} chapters for grade ${value}`);
      } else {
        console.warn(`No chapters found for grade ${value}`);
        setFilteredChapters([]);
        toast.error('Không có chương học nào cho lớp này');
      }
    } else {
      // If no grade selected, show all chapters
      setFilteredChapters(chapters);
      setSelectedGrade(null);
    }
  };

  // Filter handlers for sidebar (just update state, no API calls)
  const handleFilterGradeChange = (value) => {
    setFilterGrade(value);
    console.log('🔍 Filter by grade:', value);
  };

  const handleFilterTopicChange = (value) => {
    setFilterTopic(value);
    console.log('🔍 Filter by topic:', value);
  };

  const handleFilterDifficultyChange = (value) => {
    setFilterDifficulty(value);
    console.log('🔍 Filter by difficulty:', value);
  };

  // Navigate to thiMau page with filter params
  const handleViewSampleExams = () => {
    const filterParams = new URLSearchParams();
    
    if (filterGrade) filterParams.append('grade', filterGrade);
    if (filterTopic) filterParams.append('topic', filterTopic);
    if (filterDifficulty) filterParams.append('difficulty', filterDifficulty);
    
    const queryString = filterParams.toString();
    const targetUrl = queryString ? `/thiMau?${queryString}` : '/thiMau';
    
    console.log('🔍 Navigating to thiMau with filters:', targetUrl);
    navigate(targetUrl);
  };

  const handleCreateAIExam = async () => {
    try {
      const values = await form.validateFields();

      if (!values.chapterId) {
        toast.error('Vui lòng chọn chương học!');
        return;
      }

      if (!values.questionCount || values.questionCount < 5 || values.questionCount > 50) {
        toast.error('Số câu hỏi phải từ 5 đến 50!');
        return;
      }

      if (!values.duration) {
        toast.error('Vui lòng chọn thời gian thi!');
        return;
      }

      // Validation cho loại câu hỏi
      if (!values.includeMultipleChoice && !values.includeEssay) {
        toast.error('Vui lòng chọn ít nhất một loại câu hỏi (Trắc nghiệm hoặc Tự luận)!');
        return;
      }

      setCreatingExam(true);
      console.log('🚀 Starting AI exam creation with values:', values);

      if (values.useSmartExam) {
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
          chapterId: values.chapterId, 
          includeMultipleChoice: values.includeMultipleChoice,
          includeEssay: values.includeEssay,
          adaptiveLearning: true
        };

        console.log('🤖 Creating smart exam with criteria:', smartExamCriteria);
        const smartExam = await examService.generateSmartExam(smartExamCriteria);

        toast.dismiss('smart-generating');

        if (!smartExam || !smartExam.examId) {
          throw new Error('Smart exam generation failed - no exam ID returned');
        }

        toast.success(`🎯 Đã tạo đề thi thông minh với ${smartExam.totalQuestions || values.questionCount} câu hỏi!`, {
          duration: 4000
        });

        // Navigate to smart exam
        setIsModalOpen(false);
        form.resetFields();
        setSelectedGrade(null);
        setFilteredChapters(chapters);
        navigate(`/quiz/${smartExam.examId}`);

      } else {
        toast.loading('📝 Đang tạo đề thi thông thường...', { id: 'regular-generating' });

        const selectedChapter = chapters.find(c => c.chapterId === values.chapterId);
        const chapterName = selectedChapter?.chapterName || 'Vật lý';

        // Sử dụng Exams/generate endpoint thay vì tạo questions riêng lẻ
        const examGenerateData = {
          examName: `Đề thi - ${chapterName} (${new Date().toLocaleDateString('vi-VN')})`,
          description: `Đề thi được tạo cho ${chapterName}`,
          durationMinutes: values.duration,
          examType: "ai_generated",
          grade: selectedChapter?.grade || 12,
          chapterId: values.chapterId,
          questionCount: values.questionCount || 10,
          difficultyLevel: values.difficulty || "medium",
          includeMultipleChoice: values.includeMultipleChoice !== false,
          includeEssay: values.includeEssay !== false
        };

        console.log('📝 Creating regular exam with data:', examGenerateData);
        const createdExam = await examService.generateExam(examGenerateData);

        toast.dismiss('regular-generating');
        if (!createdExam || !createdExam.examId) {
          throw new Error('Exam generation failed - no exam ID returned');
        }
        toast.success(`🎉 Đã tạo đề thi thành công với ${createdExam.totalQuestions || values.questionCount} câu hỏi!`, {
          duration: 4000
        });

        setIsModalOpen(false);
        form.resetFields();
        setSelectedGrade(null);
        setFilteredChapters(chapters);
        navigate(`/quiz/${createdExam.examId}`);
      }

    } catch (error) {
      console.error('AI Exam Generation error:', error);
      toast.dismiss();
      toast.error('Có lỗi xảy ra khi tạo đề thi. Vui lòng thử lại!');
    } finally {
      setCreatingExam(false);
    }
  };
  return (
    <div className="layout-home">
      <ParticlesBackground />
      <LayoutContent
        layoutType={5}
        content1={
          <>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="home-sidebar-title">
                <FaFilter className="home-sidebar-icon" />
                Lọc đề thi
              </h3>
              <div className="home-sidebar-input">
                <Cselect
                  label="Chọn lớp"
                  options={gradeOptions}
                  prefix={<FaChalkboardTeacher />}
                  onChange={handleFilterGradeChange}
                  value={filterGrade}
                />
              </div>
              <div className="home-sidebar-input">
                <Cselect
                  label="Chương học"
                  options={topicOptions}
                  prefix={<FaBookOpen style={{ color: "#2DD4BF" }} />}
                  onChange={handleFilterTopicChange}
                  value={filterTopic}
                />
              </div>
              <div className="home-sidebar-input">
                <Cselect
                  label="Độ khó"
                  options={difficultyOptions}
                  prefix={<BsQuestionDiamond />}
                  onChange={handleFilterDifficultyChange}
                  value={filterDifficulty}
                />
              </div>
              <motion.button
                className="home-sidebar-btn"
                onClick={handleViewSampleExams}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Xem đề thi mẫu
              </motion.button>
              <motion.div 
                className="home-sidebar-recent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="home-sidebar-recent-title">
                  <BsClock />
                  Hoạt động gần đây
                </h3>
                <ul className="home-sidebar-recent-list">
                  {recentExams.map((item, idx) => (
                    <motion.li
                      className="home-sidebar-recent-item"
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <span className="home-sidebar-recent-icon">
                        {item.icon}
                      </span>
                      <span className="home-sidebar-recent-text">
                        {item.text}
                      </span>
                    </motion.li>
                  ))}
                </ul>
                {(filterGrade || filterTopic || filterDifficulty) && (
                  <motion.button 
                    className="home-sidebar-clear-filter"
                    onClick={() => {
                      setFilterGrade(null);
                      setFilterTopic(null);
                      setFilterDifficulty(null);
                      toast('🔄 Đã xóa bộ lọc', { icon: 'ℹ️' });
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    🗑️ Xóa bộ lọc
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          </>
        }
        content2={
          <>
            <motion.div 
              className="home-main-welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.01 }}
            >
              <motion.h1 
                className="home-main-welcome-title"
                whileHover={{ scale: 1.02 }}
              >
                <motion.span
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <FaLayerGroup className="home-main-welcome-icon" />
                </motion.span>
                Chào mừng đến với{" "}
                <motion.span 
                  className="home-main-welcome-brand"
                  whileHover={{ 
                    scale: 1.1,
                    textShadow: "0 0 8px rgb(102, 126, 234)"
                  }}
                >
                  Phygens
                </motion.span>
              </motion.h1>
              <p className="home-main-welcome-desc">
                🤖 Tạo đề thi bằng AI thông minh, nhanh chóng và chính xác.
                PhyGen sử dụng trí tuệ nhân tạo để tạo ra đề thi phù hợp với mọi mức độ học sinh.
              </p>

              {aiConnectionStatus && (
                <motion.div 
                  className="home-ai-status-badge"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
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
                </motion.div>
              )}

              <motion.button
                className="home-main-welcome-btn"
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus className="home-main-welcome-btn-icon" />
                Tạo đề mới
              </motion.button>
            </motion.div>

            <motion.div 
              className="home-main-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {[
                {
                  icon: <FaRocket />,
                  value: dashboardData?.totalExams || "0",
                  label: "Đề thi đã tạo"
                },
                {
                  icon: <FaUsers />,
                  value: dashboardData?.totalUsers || "0",
                  label: "Người dùng đăng ký"
                },
                {
                  icon: <FaChartLine />,
                  value: dashboardData?.totalQuestions || "0",
                  label: "Câu hỏi"
                },
                {
                  icon: <FaMagic />,
                  value: dashboardData?.totalChapters || chapters.length || "0",
                  label: "Chương học"
                }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="home-main-stat-box"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 * idx }}
                  whileHover={{ 
                    y: -5,
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  onHoverStart={() => setHoveredStat(idx)}
                  onHoverEnd={() => setHoveredStat(null)}
                >
                  <motion.div 
                    className="home-main-stat-icon"
                    animate={hoveredStat === idx ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    } : {}}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut"
                    }}
                  >
                    {stat.icon}
                  </motion.div>
                  <motion.h3 
                    className="home-main-stat-value"
                    animate={hoveredStat === idx ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {stat.value}+
                  </motion.h3>
                  <p className="home-main-stat-label">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.h3 
              className="home-main-feature-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <FaMagic className="home-main-feature-icon" />
              Tính năng nổi bật
            </motion.h3>

            <motion.div 
              className="home-main-features"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {mockData.features.map((feature, idx) => (
                <motion.div
                  className="home-main-feature-box"
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.div 
                    className="home-main-feature-box-icon"
                    whileHover={{
                      rotate: [0, 10, -10, 0],
                      transition: {
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h4 className="home-main-feature-box-title">
                    {feature.title}
                  </h4>
                  <p className="home-main-feature-box-desc">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </>
        }
      />
      <AnimatePresence>
        {isModalOpen && (
          <Modal
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              form.resetFields();
              setSelectedGrade(null);
              setFilteredChapters(chapters);
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
                {/* Chọn lớp trước */}
                <Form.Item
                  name="grade"
                  label={<span style={{ color: '#fff' }}>Chọn lớp</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn lớp!' }]}
                >
                  <Select
                    placeholder="Chọn lớp học"
                    onChange={handleGradeChange}
                    allowClear
                  >
                    {gradeOptions.map(grade => (
                      <Select.Option key={grade.value} value={grade.value}>
                        {grade.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="chapterId"
                  label={<span style={{ color: '#fff' }}>Chương học</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn chương học!' }]}
                >
                  <Select
                    placeholder={selectedGrade ? "Chọn chương học" : "Vui lòng chọn lớp trước"}
                    disabled={!selectedGrade}
                    loading={chapters.length === 0}
                    allowClear
                  >
                    {Array.isArray(filteredChapters) ? filteredChapters.map(chapter => (
                      <Select.Option key={chapter.chapterId} value={chapter.chapterId}>
                        {chapter.chapterName}
                      </Select.Option>
                    )) : []}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="difficulty"
                  label={<span style={{ color: '#fff' }}>Độ khó</span>}
                  initialValue="medium"
                  rules={[{ required: true, message: 'Vui lòng chọn độ khó!' }]}
                >
                  <Select placeholder="Chọn độ khó">
                    <Select.Option value="easy">🟢 Dễ</Select.Option>
                    <Select.Option value="medium">🟡 Trung bình</Select.Option>
                    <Select.Option value="hard">🔴 Khó</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="questionCount"
                  label={<span style={{ color: '#fff' }}>Số lượng câu hỏi</span>}
                  initialValue={10}
                  rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi!' }]}
                >
                  <InputNumber min={5} max={50} style={{ width: '100%' }} placeholder="Nhập số câu hỏi (5-50)" />
                </Form.Item>

                {/* Thời gian thi dạng dropdown */}
                <Form.Item
                  name="duration"
                  label={<span style={{ color: '#fff' }}>Thời gian thi</span>}
                  initialValue={45}
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                >
                  <Select placeholder="Chọn thời gian thi">
                    {durationOptions.map(option => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Divider style={{ background: "white", margin: "16px 0" }} />

                <div style={{ marginBottom: "16px" }}>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>📝 Loại câu hỏi:</span>
                </div>

                <Form.Item name="includeMultipleChoice" valuePropName="checked" initialValue={true}>
                  <div className="modal-switch-row">
                    <span className="modal-label">
                      🔘 Trắc nghiệm
                      <br />
                      <small style={{ opacity: 0.8 }}>Câu hỏi 4 lựa chọn A, B, C, D</small>
                    </span>
                    <Switch defaultChecked />
                  </div>
                </Form.Item>

                <Form.Item name="includeEssay" valuePropName="checked" initialValue={false}>
                  <div className="modal-switch-row">
                    <span className="modal-label">
                      ✍️ Tự luận
                      <br />
                      <small style={{ opacity: 0.8 }}>Câu hỏi yêu cầu trình bày, giải thích chi tiết</small>
                    </span>
                    <Switch />
                  </div>
                </Form.Item>

                <Divider style={{ background: "white", margin: "16px 0" }} />


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
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
