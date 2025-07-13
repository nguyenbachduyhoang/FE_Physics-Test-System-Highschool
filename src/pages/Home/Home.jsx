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
import { Divider, Modal, Switch, Form, InputNumber, Select, Button, Checkbox, Typography } from "antd";
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
      title: "AI Generation",
      desc: "Tạo đề thi tự động bằng trí tuệ nhân tạo với độ chính xác cao",
    },
    {
      icon: <FaLayerGroup />,
      title: "Smart Exam",
      desc: "Đề thi thích ứng - AI tự động điều chỉnh độ khó theo năng lực",
    },
    {
      icon: <FaChartLine />,
      title: "Analytics AI",
      desc: "Phân tích chi tiết kết quả học tập bằng machine learning",
    },
    {
      icon: <FaFileExport />,
      title: "Real-time",
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
  const [filteredChaptersForFilter, setFilteredChaptersForFilter] = useState([]);
  // Dynamic options loaded from API
  const [gradeOptions, setGradeOptions] = useState([]);
  const [difficultyOptions] = useState([
    { value: "easy", label: "Dễ" },
    { value: "medium", label: "Trung bình" },
    { value: "hard", label: "Khó" }
  ]);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [hoveredStat, setHoveredStat] = useState(null);

  // NEW: Multi-chapter exam states
  const [isMultiChapter, setIsMultiChapter] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [chapterAllocations, setChapterAllocations] = useState({});

  // Thời gian thi options - sẽ được filter dựa trên số câu hỏi
  const baseDurationOptions = [
    { label: "15 phút (Kiểm tra nhanh)", value: 15, minQuestions: 3, maxQuestions: 8 },
    { label: "30 phút (Kiểm tra ngắn)", value: 30, minQuestions: 5, maxQuestions: 15 },
    { label: "45 phút (Kiểm tra 1 tiết)", value: 45, minQuestions: 10, maxQuestions: 25 },
    { label: "60 phút (Kiểm tra học kỳ)", value: 60, minQuestions: 15, maxQuestions: 35 },
    { label: "90 phút (Thi học kỳ)", value: 90, minQuestions: 25, maxQuestions: 45 },
    { label: "120 phút (Thi tốt nghiệp)", value: 120, minQuestions: 35, maxQuestions: 50 },
  ];

  // Helper function để lấy duration options phù hợp
  const getDurationOptions = (questionCount) => {
    if (!questionCount) return baseDurationOptions;
    
    return baseDurationOptions.filter(option => 
      questionCount >= option.minQuestions && questionCount <= option.maxQuestions
    );
  };

  // Helper function để suggest duration dựa trên số câu hỏi
  const getSuggestedDuration = (questionCount) => {
    if (!questionCount) return null;
    
    // Tính thời gian gợi ý: 2-4 phút/câu trắc nghiệm, 5-8 phút/câu tự luận
    const avgTimePerQuestion = 3; // phút
    const suggestedMinutes = questionCount * avgTimePerQuestion;
    
    // Tìm duration option gần nhất
    const availableOptions = getDurationOptions(questionCount);
    if (availableOptions.length === 0) return null;
    
    const closest = availableOptions.reduce((prev, curr) => 
      Math.abs(curr.value - suggestedMinutes) < Math.abs(prev.value - suggestedMinutes) ? curr : prev
    );
    
    return closest.value;
  };

  // Load real data from APIs
  useEffect(() => {
    loadDashboardData();
    loadChapters();
    loadFilterOptions();
  }, []);

  // Load filter options from chapters API
  const loadFilterOptions = async () => {
    try {
      const response = await questionBankService.getChapters();
      
      if (response?.success && response.data && response.data.length > 0) {
        const chaptersData = response.data;
        // Extract unique grades
        const uniqueGrades = [...new Set(chaptersData.map(chapter => chapter.grade))].sort();
        const gradeOpts = uniqueGrades.map(grade => ({
          value: grade,
          label: `Lớp ${grade}`
        }));
        setGradeOptions(gradeOpts);
      } else {
        // Fallback if API doesn't return success or no data
        setGradeOptions([
          { value: 10, label: "Lớp 10" },
          { value: 11, label: "Lớp 11" },
          { value: 12, label: "Lớp 12" }
        ]);
      }
    } catch (error) {
      console.error('❌ Error loading filter options:', error);
      // Fallback to default options
      setGradeOptions([
        { value: 10, label: "Lớp 10" },
        { value: 11, label: "Lớp 11" },
        { value: 12, label: "Lớp 12" }
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

      if (response?.success) {
        const chaptersData = response.data;
        
        if (Array.isArray(chaptersData) && chaptersData.length > 0) {
          // Lưu toàn bộ chapters
          setChapters(chaptersData);
          setFilteredChapters(chaptersData);
          setFilteredChaptersForFilter(chaptersData);
          
          // Tạo options cho dropdown grade
          const uniqueGrades = [...new Set(chaptersData.map(chapter => chapter.grade))].sort();
          const gradeOpts = uniqueGrades.map(grade => ({
            value: grade,
            label: `Lớp ${grade}`
          }));
          setGradeOptions(gradeOpts);
          
        } else {
          console.warn('No chapters data found');
          toast.error('Không có dữ liệu chương học');
          setChapters([]);
          setFilteredChapters([]);
          setFilteredChaptersForFilter([]);
          setGradeOptions([]);
        }
      } else {
        console.error('API response not successful:', response);
        toast.error('Không thể tải danh sách chương học');
        setChapters([]);
        setFilteredChapters([]);
        setFilteredChaptersForFilter([]);
        setGradeOptions([]);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
      toast.error('Lỗi khi tải danh sách chương học');
      setChapters([]);
      setFilteredChapters([]);
      setFilteredChaptersForFilter([]);
      setGradeOptions([]);
    }
  };

  const handleGradeChange = (value) => {
    
    setSelectedGrade(value);
    
    // Reset chapter selection
    form.setFieldsValue({ chapterId: undefined });

    if (value) {
      // Filter chapters by selected grade
      const filtered = chapters.filter(chapter => chapter.grade === value);
      
      if (filtered && filtered.length > 0) {
        setFilteredChapters(filtered);
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
    
    // Reset multi-chapter selections
    setSelectedChapters([]);
    setChapterAllocations({});
  };

  // NEW: Handle multi-chapter mode toggle
  const handleMultiChapterToggle = (checked) => {
    setIsMultiChapter(checked);
    if (checked) {
      // Clear single chapter selection
      form.setFieldsValue({ chapterId: null });
      setSelectedChapters([]);
      setChapterAllocations({});
    } else {
      // Clear multi-chapter selections
      setSelectedChapters([]);
      setChapterAllocations({});
    }
  };

  // NEW: Handle chapter selection for multi-chapter mode
  const handleChapterSelection = (chapterId, checked) => {
    if (checked) {
      setSelectedChapters(prev => [...prev, chapterId]);
      setChapterAllocations(prev => ({
        ...prev,
        [chapterId]: 2 // Default 2 questions per chapter
      }));
    } else {
      setSelectedChapters(prev => prev.filter(id => id !== chapterId));
      setChapterAllocations(prev => {
        const updated = { ...prev };
        delete updated[chapterId];
        return updated;
      });
    }
  };

  // NEW: Handle question allocation change
  const handleAllocationChange = (chapterId, count) => {
    setChapterAllocations(prev => ({
      ...prev,
      [chapterId]: count
    }));
  };

  // Filter handlers for sidebar (just update state, no API calls)
  const handleFilterGradeChange = (value) => {
    setFilterGrade(value);
    setFilterTopic(null); // Reset topic selection when grade changes
    
    if (value) {
      // Filter chapters by selected grade
      const filtered = chapters.filter(chapter => chapter.grade === value);
      
      if (filtered && filtered.length > 0) {
        setFilteredChaptersForFilter(filtered);
      } else {
        console.warn(`No chapters found for filter grade ${value}`);
        setFilteredChaptersForFilter([]);
        toast.error('Không có chương học nào cho lớp này');
      }
    } else {
      // If no grade selected, show all chapters
      setFilteredChaptersForFilter(chapters);
    }
  };

  const handleFilterTopicChange = (value) => {
    setFilterTopic(value);
  };

  const handleFilterDifficultyChange = (value) => {
    setFilterDifficulty(value);
  };

  // Navigate to thiMau page with filter params
  const handleViewSampleExams = () => {
    const filterParams = new URLSearchParams();
    
    if (filterGrade) filterParams.append('grade', filterGrade);
    if (filterTopic) {
      // Find chapter name by chapterId for display
      const selectedChapter = filteredChaptersForFilter.find(chapter => chapter.chapterId === filterTopic);
      const chapterName = selectedChapter ? selectedChapter.chapterName : filterTopic;
      filterParams.append('topic', chapterName);
      filterParams.append('chapterId', filterTopic);
    }
    if (filterDifficulty) filterParams.append('difficulty', filterDifficulty);
    
    const queryString = filterParams.toString();
    const targetUrl = queryString ? `/thiMau?${queryString}` : '/thiMau';
    
    navigate(targetUrl);
  };

  const handleCreateAIExam = async () => {
    try {
      const values = await form.validateFields();

      // Validation cho chapter selection
      if (!isMultiChapter && !values.chapterId) {
        toast.error('Vui lòng chọn chương học!');
        return;
      }

      if (isMultiChapter && selectedChapters.length === 0) {
        toast.error('Vui lòng chọn ít nhất một chương học cho đề thi tổng hợp!');
        return;
      }

      // Validation cho số câu hỏi
      if (!isMultiChapter) {
        if (!values.questionCount || values.questionCount < 5 || values.questionCount > 50) {
          toast.error('Số câu hỏi phải từ 5 đến 50!');
          return;
        }
      } else {
        const totalQuestions = Object.values(chapterAllocations).reduce((sum, count) => sum + count, 0);
        if (totalQuestions < 5 || totalQuestions > 50) {
          toast.error('Tổng số câu hỏi phải từ 5 đến 50!');
          return;
        }
        
        // Đảm bảo có câu hỏi từ ít nhất 1 chương
        if (totalQuestions === 0) {
          toast.error('Vui lòng phân bổ ít nhất 1 câu hỏi cho các chương đã chọn!');
          return;
        }
      }

      // Validation cho thời gian thi
      const currentQuestionCount = isMultiChapter 
        ? Object.values(chapterAllocations).reduce((sum, count) => sum + count, 0)
        : values.questionCount || 10;
      
      let finalDuration = values.duration;
      
      // Kiểm tra nếu chưa chọn thời gian hoặc thời gian không hợp lệ
      if (!finalDuration || finalDuration === '' || finalDuration === undefined) {
        const suggestedDuration = getSuggestedDuration(currentQuestionCount);
        if (suggestedDuration) {
          // Auto-fill suggested duration
          form.setFieldsValue({ duration: suggestedDuration });
          finalDuration = suggestedDuration;
          toast.warning(`Đã tự động chọn thời gian đề xuất: ${suggestedDuration} phút cho ${currentQuestionCount} câu hỏi`, { duration: 3000 });
        } else {
          toast.error('Vui lòng chọn thời gian thi!');
          return;
        }
      }
      
      // Kiểm tra xem thời gian đã chọn có phù hợp không (chỉ warning, không block)
      const availableOptions = getDurationOptions(currentQuestionCount);
      const selectedDurationValid = availableOptions.some(option => option.value === finalDuration);
      
      if (!selectedDurationValid && finalDuration) {
        const suggestedDuration = getSuggestedDuration(currentQuestionCount);
        toast.warning(
          `Thời gian ${finalDuration} phút có thể không phù hợp với ${currentQuestionCount} câu hỏi. ` +
          `Đề xuất: ${suggestedDuration} phút (${Math.round(suggestedDuration/currentQuestionCount)} phút/câu)`,
          { duration: 5000 }
        );
      }

      // Kiểm tra loại câu hỏi - mặc định là true nếu không có giá trị
      const includeMultipleChoice = values.includeMultipleChoice !== false;
      const includeEssay = values.includeEssay === true;

      // Validation cho loại câu hỏi
      if (!includeMultipleChoice && !includeEssay) {
        toast.error('Vui lòng chọn ít nhất một loại câu hỏi (Trắc nghiệm hoặc Tự luận)!');
        return;
      }

      // Validation đặc biệt cho mix questions
      if (includeMultipleChoice && includeEssay && values.questionCount < 5) {
        toast.error('Khi kết hợp cả 2 loại câu hỏi, cần ít nhất 5 câu để phân chia hợp lý!');
        return;
      }

      // Thông báo phân chia khi có cả 2 loại
      if (includeMultipleChoice && includeEssay) {
        // Sử dụng custom ratio nếu được chọn, default 70%
        const mcPercentage = values.customRatio && values.multipleChoicePercentage ? 
          values.multipleChoicePercentage / 100 : 0.7;
        const multipleChoiceCount = Math.floor(currentQuestionCount * mcPercentage);
        const essayCount = currentQuestionCount - multipleChoiceCount;
        
        toast.loading(`📊 Đang tạo ${multipleChoiceCount} câu trắc nghiệm + ${essayCount} câu tự luận...`, { id: 'mixed-exam' });
      } else if (includeEssay && !includeMultipleChoice) {
        toast.loading(`✍️ Đang tạo ${currentQuestionCount} câu tự luận...`, { id: 'essay-only' });
      } else {
        toast.loading(`🔘 Đang tạo ${currentQuestionCount} câu trắc nghiệm...`, { id: 'mc-only' });
      }

      setCreatingExam(true);

      if (values.useSmartExam) {
        // Smart exam logic...
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
          includeMultipleChoice: includeMultipleChoice,
          includeEssay: includeEssay,
          adaptiveLearning: true
        };

        const smartExam = await examService.generateSmartExam(smartExamCriteria);

        toast.dismiss();

        if (!smartExam || !smartExam.success || !smartExam.data || !smartExam.data.examId) {
          throw new Error('Smart exam generation failed - no exam ID returned');
        }

        // Dynamic success message
        let successMessage = '🎯 Đã tạo đề thi thông minh ';
        if (includeMultipleChoice && includeEssay) {
          const mcPercentage = values.customRatio && values.multipleChoicePercentage ? 
            values.multipleChoicePercentage / 100 : 0.7;
          const mcCount = Math.floor(values.questionCount * mcPercentage);
          const essayCount = values.questionCount - mcCount;
          successMessage += `với ${mcCount} câu trắc nghiệm + ${essayCount} câu tự luận!`;
        } else if (includeEssay) {
          successMessage += `với ${values.questionCount} câu tự luận!`;
        } else {
          successMessage += `với ${values.questionCount} câu trắc nghiệm!`;
        }

        toast.success(successMessage, { duration: 4000 });

        setIsModalOpen(false);
        form.resetFields();
        setSelectedGrade(null);
        setFilteredChapters(chapters);
        navigate(`/quiz/${smartExam.data.examId}`);

      } else {
        // Regular exam logic...
        let examGenerateData;
        
        if (isMultiChapter) {
          // Multi-chapter exam
          const selectedChapterNames = selectedChapters.map(chapterId => {
            const chapter = chapters.find(c => c.chapterId === chapterId);
            return chapter ? chapter.chapterName : `Chương ${chapterId}`;
          });
          
          const totalQuestions = Object.values(chapterAllocations).reduce((sum, count) => sum + count, 0);
          
          // Create chapter allocations data
          const allocations = selectedChapters.map(chapterId => ({
            chapterId: chapterId,
            questionCount: chapterAllocations[chapterId] || 2,
            difficultyLevel: values.difficulty || "medium"
          }));

          examGenerateData = {
            examName: `Đề thi tổng hợp - Lớp ${selectedGrade} (${new Date().toLocaleDateString('vi-VN')})`,
            description: `Đề thi tổng hợp từ ${selectedChapters.length} chương: ${selectedChapterNames.join(', ')}`,
            durationMinutes: finalDuration,
            examType: "ai_generated",
            grade: selectedGrade,
            
            // Multi-chapter specific fields
            isMultiChapter: true,
            chapterIds: selectedChapters,
            chapterAllocations: allocations,
            questionCount: totalQuestions,
            examScope: "comprehensive",
            
            difficultyLevel: values.difficulty || "medium",
            includeMultipleChoice: includeMultipleChoice,
            includeEssay: includeEssay,
            customRatio: values.customRatio || false,
            multipleChoicePercentage: values.customRatio ? (values.multipleChoicePercentage || 70) : 70
          };
        } else {
          // Single chapter exam
          const selectedChapter = chapters.find(c => c.chapterId === values.chapterId);
          const chapterName = selectedChapter?.chapterName || 'Vật lý';

          examGenerateData = {
            examName: `Đề thi - ${chapterName} (${new Date().toLocaleDateString('vi-VN')})`,
            description: `Đề thi được tạo cho ${chapterName}`,
            durationMinutes: finalDuration,
            examType: "ai_generated",
            grade: selectedChapter?.grade || 12,
            chapterId: values.chapterId,
            questionCount: values.questionCount || 10,
            difficultyLevel: values.difficulty || "medium",
            includeMultipleChoice: includeMultipleChoice,
            includeEssay: includeEssay,
            customRatio: values.customRatio || false,
            multipleChoicePercentage: values.customRatio ? (values.multipleChoicePercentage || 70) : 70
          };
        }

        const createdExam = await examService.generateExam(examGenerateData);

        toast.dismiss();
        if (!createdExam || !createdExam.success || !createdExam.data || !createdExam.data.examId) {
          throw new Error('Exam generation failed - no exam ID returned');
        }

        // Dynamic success message
        let successMessage = isMultiChapter ? '🎉 Đã tạo đề thi tổng hợp thành công ' : '🎉 Đã tạo đề thi thành công ';
        
        if (isMultiChapter) {
          const totalQuestions = Object.values(chapterAllocations).reduce((sum, count) => sum + count, 0);
          successMessage += `với ${totalQuestions} câu từ ${selectedChapters.length} chương!`;
        } else {
          if (includeMultipleChoice && includeEssay) {
            const mcPercentage = values.customRatio && values.multipleChoicePercentage ? 
              values.multipleChoicePercentage / 100 : 0.7;
            const mcCount = Math.floor(values.questionCount * mcPercentage);
            const essayCount = values.questionCount - mcCount;
            successMessage += `với ${mcCount} câu trắc nghiệm + ${essayCount} câu tự luận!`;
          } else if (includeEssay) {
            successMessage += `với ${values.questionCount} câu tự luận!`;
          } else {
            successMessage += `với ${values.questionCount} câu trắc nghiệm!`;
          }
        }

        toast.success(successMessage, { duration: 4000 });

        setIsModalOpen(false);
        form.resetFields();
        setSelectedGrade(null);
        setFilteredChapters(chapters);
        // Reset multi-chapter states
        setIsMultiChapter(false);
        setSelectedChapters([]);
        setChapterAllocations({});
        navigate(`/quiz/${createdExam.data.examId}`);
      }

    } catch (error) {
      console.error('AI Exam Generation error:', error);
      toast.dismiss();
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
                  options={filteredChaptersForFilter.map(chapter => ({
                    value: chapter.chapterId,
                    label: chapter.chapterName
                  }))}
                  prefix={<FaBookOpen style={{ color: "#2DD4BF" }} />}
                  onChange={handleFilterTopicChange}
                  value={filterTopic}
                  disabled={!filterGrade}
                  // placeholder={filterGrade ? "Chọn chương học" : "Vui lòng chọn lớp trước"}
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
                      setFilteredChaptersForFilter(chapters);
                      toast.success('Đã xóa bộ lọc', { duration: 2500 });
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
                Tạo đề thi bằng AI thông minh, nhanh chóng và chính xác.
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
              // Reset multi-chapter states
              setIsMultiChapter(false);
              setSelectedChapters([]);
              setChapterAllocations({});
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

                {/* NEW: Multi-chapter toggle */}
                {selectedGrade && (
                  <Form.Item style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Checkbox
                        checked={isMultiChapter}
                        onChange={(e) => handleMultiChapterToggle(e.target.checked)}
                        style={{ color: '#fff' }}
                      />
                      <span style={{ color: '#fff', fontSize: '14px' }}>
                        📚 Đề thi tổng hợp (nhiều chương)
                      </span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '4px', marginLeft: '24px' }}>
                      Tạo đề thi kết hợp câu hỏi từ nhiều chương học - phù hợp cho ôn tập cuối kỳ
                    </div>
                  </Form.Item>
                )}

                {/* Chapter selection - Single or Multi mode */}
                {!isMultiChapter ? (
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
                ) : (
                  <Form.Item
                    label={<span style={{ color: '#fff' }}>Chọn các chương học</span>}
                    style={{ marginBottom: '20px' }}
                  >
                    <div style={{ 
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      padding: '8px'
                    }}>
                      {Array.isArray(filteredChapters) ? filteredChapters.map(chapter => (
                        <div key={chapter.chapterId} style={{ 
                          marginBottom: '8px',
                          padding: '8px',
                          backgroundColor: selectedChapters.includes(chapter.chapterId) ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
                          borderRadius: '4px',
                          border: selectedChapters.includes(chapter.chapterId) ? '1px solid rgba(24, 144, 255, 0.3)' : '1px solid transparent'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Checkbox
                                checked={selectedChapters.includes(chapter.chapterId)}
                                onChange={(e) => handleChapterSelection(chapter.chapterId, e.target.checked)}
                              />
                              <span style={{ color: '#fff', fontSize: '13px' }}>
                                {chapter.chapterName}
                              </span>
                            </div>
                            {selectedChapters.includes(chapter.chapterId) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                  Số câu:
                                </span>
                                <InputNumber
                                  size="small"
                                  min={1}
                                  max={10}
                                  value={chapterAllocations[chapter.chapterId] || 2}
                                  onChange={(value) => handleAllocationChange(chapter.chapterId, value)}
                                  style={{ width: '60px' }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )) : []}
                    </div>
                    
                    {selectedChapters.length > 0 && (
                      <div style={{ 
                        marginTop: '8px',
                        padding: '8px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.8)'
                      }}>
                        📊 Tổng cộng: {Object.values(chapterAllocations).reduce((sum, count) => sum + count, 0)} câu từ {selectedChapters.length} chương
                      </div>
                    )}
                  </Form.Item>
                )}

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

                {/* Question Count - Only show for single chapter mode */}
                {!isMultiChapter && (
                  <Form.Item
                    name="questionCount"
                    label={<span style={{ color: '#fff' }}>Số lượng câu hỏi</span>}
                    initialValue={10}
                    rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi!' }]}
                  >
                    <InputNumber min={5} max={50} style={{ width: '100%' }} placeholder="Nhập số câu hỏi (5-50)" />
                  </Form.Item>
                )}

                {/* Thời gian thi dạng dropdown */}
                <Form.Item shouldUpdate={(prevValues, curValues) => 
                  prevValues.questionCount !== curValues.questionCount ||
                  JSON.stringify(prevValues.chapterAllocations) !== JSON.stringify(chapterAllocations)
                }>
                  {({ getFieldValue }) => {
                    // Tính tổng số câu hỏi hiện tại
                    const currentQuestionCount = isMultiChapter 
                      ? Object.values(chapterAllocations).reduce((sum, count) => sum + count, 0)
                      : getFieldValue('questionCount') || 10;
                    
                    const availableDurationOptions = getDurationOptions(currentQuestionCount);
                    const suggestedDuration = getSuggestedDuration(currentQuestionCount);
                    
                    return (
                      <Form.Item
                        name="duration"
                        label={<span style={{ color: '#fff' }}>Thời gian thi</span>}
                      >
                        <Select placeholder="Chọn thời gian thi">
                          {availableDurationOptions.map(option => (
                            <Select.Option key={option.value} value={option.value}>
                              {option.label}
                              {option.value === suggestedDuration && (
                                <span style={{ color: '#52c41a', marginLeft: '8px' }}>
                                  ⭐ Đề xuất
                                </span>
                              )}
                            </Select.Option>
                          ))}
                        </Select>
                        
                        {currentQuestionCount > 0 && suggestedDuration && (
                          <div style={{ 
                            color: 'rgba(255,255,255,0.7)', 
                            fontSize: '12px', 
                            marginTop: '4px' 
                          }}>
                            💡 Đề xuất {suggestedDuration} phút cho {currentQuestionCount} câu hỏi 
                            ({Math.round(suggestedDuration/currentQuestionCount)} phút/câu)
                          </div>
                        )}
                        
                        {availableDurationOptions.length === 0 && (
                          <div style={{ 
                            color: '#ff7875', 
                            fontSize: '12px', 
                            marginTop: '4px' 
                          }}>
                            ⚠️ Số câu hỏi hiện tại không phù hợp với bất kỳ thời gian thi nào
                          </div>
                        )}
                      </Form.Item>
                    );
                  }}
                </Form.Item>

                {/* <Divider style={{ background: "white", margin: "16px 0" }} />

                <div style={{ marginBottom: "16px" }}>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>🎯 Loại đề thi:</span>
                </div> */}

                {/* <Form.Item name="useSmartExam" valuePropName="checked" initialValue={false}>
                  <div className="modal-switch-row">
                    <span className="modal-label">
                      🧠 Smart Exam
                      <br />
                      <small style={{ opacity: 0.8 }}>Đề thi thích ứng - AI tự động điều chỉnh độ khó</small>
                    </span>
                    <Switch />
                  </div>
                </Form.Item> */}

                {/* <Divider style={{ background: "white", margin: "16px 0" }} />

                <div style={{ marginBottom: "16px" }}>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>📝 Loại câu hỏi:</span>
                </div> */}

                {/* <Form.Item name="includeMultipleChoice" valuePropName="checked" initialValue={true}>
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
                </Form.Item> */}

                {/* Hiển thị thông tin phân chia khi cả 2 được chọn */}
                {/* <Form.Item shouldUpdate={(prevValues, curValues) => 
                  prevValues.includeMultipleChoice !== curValues.includeMultipleChoice ||
                  prevValues.includeEssay !== curValues.includeEssay ||
                  prevValues.questionCount !== curValues.questionCount ||
                  prevValues.customRatio !== curValues.customRatio ||
                  prevValues.multipleChoicePercentage !== curValues.multipleChoicePercentage
                }>
                  {({ getFieldValue }) => {
                    const includeMultipleChoice = getFieldValue('includeMultipleChoice');
                    const includeEssay = getFieldValue('includeEssay');
                    const questionCount = getFieldValue('questionCount') || 10;
                    const customRatio = getFieldValue('customRatio');
                    const mcPercentage = customRatio && getFieldValue('multipleChoicePercentage') ? 
                      getFieldValue('multipleChoicePercentage') / 100 : 0.7;
                    
                    if (includeMultipleChoice && includeEssay) {
                      const multipleChoiceCount = Math.floor(questionCount * mcPercentage);
                      const essayCount = questionCount - multipleChoiceCount;
                      
                      return (
                        <div style={{ 
                          background: 'rgba(255,255,255,0.1)', 
                          padding: '12px', 
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          marginTop: '12px'
                        }}>
                          <div style={{ color: '#fff', fontSize: '13px', marginBottom: '8px' }}>
                            📊 <strong>Phân chia câu hỏi tự động:</strong>
                          </div>
                          <div style={{ color: '#fff', fontSize: '12px', lineHeight: '1.5' }}>
                            🔘 <strong>{multipleChoiceCount} câu trắc nghiệm</strong> ({Math.round(mcPercentage * 100)}%)<br/>
                            ✍️ <strong>{essayCount} câu tự luận</strong> ({100 - Math.round(mcPercentage * 100)}%)
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '6px' }}>
                            {customRatio ? 
                              '⚙️ Tỷ lệ tùy chỉnh theo yêu cầu của bạn' : 
                              '💡 Tỷ lệ này được AI tối ưu để cân bằng giữa đánh giá nhanh và sâu'
                            }
                          </div>
                        </div>
                      );
                    }
                    
                    if (includeMultipleChoice && !includeEssay) {
                      return (
                        <div style={{ 
                          background: 'rgba(34, 197, 94, 0.1)', 
                          padding: '10px', 
                          borderRadius: '6px',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          marginTop: '8px'
                        }}>
                          <div style={{ color: '#22c55e', fontSize: '12px' }}>
                            🔘 <strong>{questionCount} câu trắc nghiệm</strong> - Đánh giá nhanh, khách quan
                          </div>
                        </div>
                      );
                    }
                    
                    if (!includeMultipleChoice && includeEssay) {
                      return (
                        <div style={{ 
                          background: 'rgba(168, 85, 247, 0.1)', 
                          padding: '10px', 
                          borderRadius: '6px',
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                          marginTop: '8px'
                        }}>
                          <div style={{ color: '#a855f7', fontSize: '12px' }}>
                            ✍️ <strong>{questionCount} câu tự luận</strong> - Đánh giá sâu, tư duy phản biện
                          </div>
                        </div>
                      );
                    }
                    
                    return null;
                  }}
                </Form.Item> */}

                {/* Tùy chọn nâng cao */}
                {/* <Form.Item shouldUpdate={(prevValues, curValues) => 
                  prevValues.includeMultipleChoice !== curValues.includeMultipleChoice ||
                  prevValues.includeEssay !== curValues.includeEssay
                }>
                  {({ getFieldValue }) => {
                    const includeMultipleChoice = getFieldValue('includeMultipleChoice');
                    const includeEssay = getFieldValue('includeEssay');
                    
                    if (includeMultipleChoice && includeEssay) {
                      return (
                        <>
                          <Divider style={{ background: "white", margin: "16px 0" }} />
                          <div style={{ marginBottom: "16px" }}>
                            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>
                              ⚙️ Tùy chọn nâng cao (Tùy chọn):
                            </span>
                          </div>
                          
                          <Form.Item name="customRatio" valuePropName="checked" initialValue={false}>
                            <div className="modal-switch-row">
                              <span className="modal-label">
                                🎛️ Tùy chỉnh tỷ lệ phân chia
                                <br />
                                <small style={{ opacity: 0.8 }}>Tự điều chỉnh % trắc nghiệm và tự luận</small>
                              </span>
                              <Switch />
                            </div>
                          </Form.Item>

                          <Form.Item shouldUpdate={(prevValues, curValues) => 
                            prevValues.customRatio !== curValues.customRatio
                          }>
                            {({ getFieldValue }) => {
                              const customRatio = getFieldValue('customRatio');
                              
                              if (customRatio) {
                                return (
                                  <Form.Item
                                    name="multipleChoicePercentage"
                                    label={<span style={{ color: '#fff' }}>Tỷ lệ trắc nghiệm (%)</span>}
                                    initialValue={70}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <InputNumber 
                                        min={20} 
                                        max={80} 
                                        step={10}
                                        style={{ width: '80px' }} 
                                        formatter={value => `${value}%`}
                                        parser={value => value.replace('%', '')}
                                      />
                                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                        (Tự luận sẽ chiếm {100 - (getFieldValue('multipleChoicePercentage') || 70)}%)
                                      </span>
                                    </div>
                                  </Form.Item>
                                );
                              }
                              return null;
                            }}
                          </Form.Item>
                        </>
                      );
                    }
                    return null;
                  }}
                </Form.Item> */}

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
