// /* eslint-disable no-unused-vars */
// import React, { useState, useEffect } from 'react';
// import { 
//   Card, 
//   Table, 
//   Button, 
//   Modal, 
//   Form, 
//   Input, 
//   Select, 
//   InputNumber,
//   Tag,
//   Space,
//   Popconfirm,
//   message,
//   Row,
//   Col,
//   Statistic,
//   Badge
// } from 'antd';
// import { 
//   PlusOutlined, 
//   EditOutlined, 
//   DeleteOutlined, 
//   EyeOutlined,
//   RobotOutlined,
//   FileTextOutlined
// } from '@ant-design/icons';
// import { essayService, questionBankService } from '../../../services';
// import EssayQuestion from '../../../components/EssayQuestion';
// import './index.scss';

// const { TextArea } = Input;
// const { Option } = Select;

// const EssayManagement = () => {
//   const [essays, setEssays] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [previewVisible, setPreviewVisible] = useState(false);
//   const [selectedEssay, setSelectedEssay] = useState(null);
//   const [form] = Form.useForm();
//   const [chapters, setChapters] = useState([]);
//   const [statistics, setStatistics] = useState({
//     total: 0,
//     easy: 0,
//     medium: 0,
//     hard: 0
//   });

//   // Load data
//   useEffect(() => {
//     loadEssays();
//     loadChapters();
//   }, []);

//   const loadEssays = async () => {
//     try {
//       setLoading(true);
//       const response = await essayService.getEssayQuestions({
//         page: 1,
//         pageSize: 100
//       });
      
//       const essayList = response.data || response.items || [];
//       setEssays(essayList);
      
//       // Calculate statistics
//       const stats = {
//         total: essayList.length,
//         easy: essayList.filter(e => e.difficultyLevel === 'easy').length,
//         medium: essayList.filter(e => e.difficultyLevel === 'medium').length,
//         hard: essayList.filter(e => e.difficultyLevel === 'hard').length
//       };
//       setStatistics(stats);
      
//       message.error('Không thể tải danh sách câu hỏi tự luận');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadChapters = async () => {
//     try {
//       const response = await questionBankService.getChapters();
//       setChapters(Array.isArray(response) ? response : []);
//     } catch (error) {
//       console.error('Error loading chapters:', error);
//     }
//   };

//   // Generate essay question using AI
//   const handleGenerateEssay = async () => {
//     try {
//       setLoading(true);
//       const values = await form.validateFields();
      
//       const generateRequest = {
//         chapterId: values.chapterId,
//         difficultyLevel: values.difficultyLevel,
//         specificTopic: values.specificTopic,
//         maxWords: values.maxWords || 300,
//         minWords: values.minWords || 50,
//         essayStyle: values.essayStyle || 'analytical'
//       };

//       const response = await essayService.generateEssayQuestion(generateRequest);
      
//       if (response.success) {
//         message.success('Tạo câu hỏi tự luận thành công!');
//         setModalVisible(false);
//         form.resetFields();
//         loadEssays();
//       } else {
//         message.error(response.message || 'Không thể tạo câu hỏi');
//       }
//     } catch (error) {
//       message.error('Lỗi khi tạo câu hỏi tự luận');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Delete essay
//   const handleDelete = async (questionId) => {
//     try {
//       await essayService.deleteEssayQuestion(questionId);
//       message.success('Xóa câu hỏi thành công!');
//       loadEssays();
//     } catch (error) {
//       message.error('Không thể xóa câu hỏi');
//     }
//   };

//   // Preview essay
//   const handlePreview = async (essay) => {
//     try {
//       const detail = await essayService.getEssayQuestionDetail(essay.questionId);
//       setSelectedEssay(detail.data || essay);
//       setPreviewVisible(true);
//     } catch (error) {
//       setSelectedEssay(essay);
//       setPreviewVisible(true);
//     }
//   };

//   // Table columns
//   const columns = [
//     {
//       title: 'ID',
//       dataIndex: 'questionId',
//       key: 'questionId',
//       width: 200,
//       render: (id) => <code>{id.substring(0, 8)}...</code>
//     },
//     {
//       title: 'Nội dung câu hỏi',
//       dataIndex: 'questionText',
//       key: 'questionText',
//       ellipsis: true,
//       render: (text) => (
//         <div style={{ maxWidth: 300 }}>
//           {text.length > 100 ? `${text.substring(0, 100)}...` : text}
//         </div>
//       )
//     },
//     {
//       title: 'Chương',
//       dataIndex: 'chapterId',
//       key: 'chapterId',
//       width: 120,
//       render: (chapterId) => {
//         const chapter = chapters.find(c => c.chapterId === chapterId);
//         return chapter ? chapter.chapterName : `Chương ${chapterId}`;
//       }
//     },
//     {
//       title: 'Độ khó',
//       dataIndex: 'difficultyLevel',
//       key: 'difficultyLevel',
//       width: 100,
//       render: (level) => {
//         const colors = { easy: 'green', medium: 'orange', hard: 'red' };
//         const labels = { easy: 'Dễ', medium: 'TB', hard: 'Khó' };
//         return <Tag color={colors[level]}>{labels[level]}</Tag>;
//       }
//     },
//     {
//       title: 'AI Generated',
//       dataIndex: 'aiGenerated',
//       key: 'aiGenerated',
//       width: 120,
//       render: (generated) => (
//         <Badge 
//           status={generated ? "success" : "default"} 
//           text={generated ? "Có" : "Không"} 
//         />
//       )
//     },
//     {
//       title: 'Ngày tạo',
//       dataIndex: 'createdAt',
//       key: 'createdAt',
//       width: 120,
//       render: (date) => new Date(date).toLocaleDateString('vi-VN')
//     },
//     {
//       title: 'Thao tác',
//       key: 'actions',
//       width: 150,
//       render: (_, record) => (
//         <Space size="small">
//           <Button 
//             type="text" 
//             icon={<EyeOutlined />} 
//             onClick={() => handlePreview(record)}
//             title="Xem trước"
//           />
//           <Button 
//             type="text" 
//             icon={<EditOutlined />} 
//             title="Chỉnh sửa"
//             disabled
//           />
//           <Popconfirm
//             title="Bạn có chắc muốn xóa câu hỏi này?"
//             onConfirm={() => handleDelete(record.questionId)}
//             okText="Xóa"
//             cancelText="Hủy"
//           >
//             <Button 
//               type="text" 
//               danger 
//               icon={<DeleteOutlined />}
//               title="Xóa"
//             />
//           </Popconfirm>
//         </Space>
//       )
//     }
//   ];

//   return (
//     <div className="essay-management">
//       {/* Statistics */}
//       <Row gutter={16} style={{ marginBottom: 24 }}>
//         <Col span={6}>
//           <Card>
//             <Statistic
//               title="Tổng số câu hỏi"
//               value={statistics.total}
//               prefix={<FileTextOutlined />}
//             />
//           </Card>
//         </Col>
//         <Col span={6}>
//           <Card>
//             <Statistic
//               title="Dễ"
//               value={statistics.easy}
//               valueStyle={{ color: '#52c41a' }}
//             />
//           </Card>
//         </Col>
//         <Col span={6}>
//           <Card>
//             <Statistic
//               title="Trung bình"
//               value={statistics.medium}
//               valueStyle={{ color: '#fa8c16' }}
//             />
//           </Card>
//         </Col>
//         <Col span={6}>
//           <Card>
//             <Statistic
//               title="Khó"
//               value={statistics.hard}
//               valueStyle={{ color: '#f5222d' }}
//             />
//           </Card>
//         </Col>
//       </Row>

//       {/* Main table */}
//       <Card
//         title="Quản lý câu hỏi tự luận"
//         extra={
//           <Button 
//             type="primary" 
//             icon={<RobotOutlined />}
//             onClick={() => setModalVisible(true)}
//           >
//             Tạo câu hỏi bằng AI
//           </Button>
//         }
//       >
//         <Table
//           columns={columns}
//           dataSource={essays}
//           loading={loading}
//           rowKey="questionId"
//           pagination={{
//             pageSize: 10,
//             showSizeChanger: true,
//             showQuickJumper: true,
//             showTotal: (total) => `Tổng ${total} câu hỏi`
//           }}
//         />
//       </Card>

//       {/* Generate Modal */}
//       <Modal
//         title="Tạo câu hỏi tự luận bằng AI"
//         open={modalVisible}
//         onOk={handleGenerateEssay}
//         onCancel={() => {
//           setModalVisible(false);
//           form.resetFields();
//         }}
//         confirmLoading={loading}
//         width={600}
//       >
//         <Form form={form} layout="vertical">
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="chapterId"
//                 label="Chương"
//                 rules={[{ required: true, message: 'Vui lòng chọn chương' }]}
//               >
//                 <Select placeholder="Chọn chương">
//                   {chapters.map(chapter => (
//                     <Option key={chapter.chapterId} value={chapter.chapterId}>
//                       {chapter.chapterName}
//                     </Option>
//                   ))}
//                 </Select>
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 name="difficultyLevel"
//                 label="Độ khó"
//                 rules={[{ required: true, message: 'Vui lòng chọn độ khó' }]}
//               >
//                 <Select placeholder="Chọn độ khó">
//                   <Option value="easy">Dễ</Option>
//                   <Option value="medium">Trung bình</Option>
//                   <Option value="hard">Khó</Option>
//                 </Select>
//               </Form.Item>
//             </Col>
//           </Row>

//           <Form.Item
//             name="specificTopic"
//             label="Chủ đề cụ thể"
//             rules={[{ required: true, message: 'Vui lòng nhập chủ đề' }]}
//           >
//             <Input placeholder="VD: Định luật Newton, Dao động điều hòa..." />
//           </Form.Item>

//           <Row gutter={16}>
//             <Col span={8}>
//               <Form.Item
//                 name="essayStyle"
//                 label="Kiểu câu hỏi"
//                 initialValue="analytical"
//               >
//                 <Select>
//                   <Option value="analytical">Phân tích</Option>
//                   <Option value="descriptive">Mô tả</Option>
//                   <Option value="argumentative">Lập luận</Option>
//                   <Option value="comparative">So sánh</Option>
//                 </Select>
//               </Form.Item>
//             </Col>
//             <Col span={8}>
//               <Form.Item
//                 name="minWords"
//                 label="Số từ tối thiểu"
//                 initialValue={50}
//               >
//                 <InputNumber min={20} max={200} style={{ width: '100%' }} />
//               </Form.Item>
//             </Col>
//             <Col span={8}>
//               <Form.Item
//                 name="maxWords"
//                 label="Số từ tối đa"
//                 initialValue={300}
//               >
//                 <InputNumber min={100} max={1000} style={{ width: '100%' }} />
//               </Form.Item>
//             </Col>
//           </Row>
//         </Form>
//       </Modal>

//       {/* Preview Modal */}
//       <Modal
//         title="Xem trước câu hỏi tự luận"
//         open={previewVisible}
//         onCancel={() => setPreviewVisible(false)}
//         footer={[
//           <Button key="close" onClick={() => setPreviewVisible(false)}>
//             Đóng
//           </Button>
//         ]}
//         width={800}
//       >
//         {selectedEssay && (
//           <EssayQuestion
//             question={selectedEssay}
//             value=""
//             onChange={() => {}}
//             onValidationChange={() => {}}
//             disabled={true}
//           />
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default EssayManagement; 