import React, { useState, useEffect } from 'react';
import { Card, Progress, Alert, Tooltip, Button } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import './index.scss';
import AdvancedTextEditor from '../uiBasic/AdvancedTextEditor';

const EssayQuestion = ({ 
  question, 
  value, 
  onChange, 
  onValidationChange,
  disabled = false 
}) => {
  const [wordCount, setWordCount] = useState(0);
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const minWords = question.minWords || 1;
  const maxWords = question.maxWords || 500;
  const keyPoints = question.keyPoints || [];
  const gradingCriteria = question.gradingCriteria || [];

  useEffect(() => {
    if (!value || value.trim() === '') {
      setWordCount(0);
      setIsValid(false);
      setValidationMessage('Vui lòng nhập câu trả lời');
      onValidationChange?.(false);
      return;
    }

    const cleanText = value.trim().replace(/[^\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ]/g, ' ');
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    const count = words.length;
    setWordCount(count);

    let valid = true;
    let message = '';

    if (count < minWords) {
      valid = false;
      message = `Cần thêm ${minWords - count} từ (tối thiểu ${minWords} từ)`;
    } else if (count > maxWords) {
      valid = false;
      message = `Vượt quá ${count - maxWords} từ (tối đa ${maxWords} từ)`;
    } else {
      message = `Độ dài phù hợp (${count}/${maxWords} từ)`;
    }

    setIsValid(valid);
    setValidationMessage(message);
    onValidationChange?.(valid);
  }, [value, minWords, maxWords, onValidationChange]);

  const completionPercentage = Math.min((wordCount / minWords) * 100, 100);

  useEffect(() => {
    if (value && value.length > 50) {
      const sentences = value.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const physicsTerms = [
        'lực', 'gia tốc', 'vận tốc', 'động lượng', 'năng lượng', 'công suất',
        'điện tích', 'điện trường', 'từ trường', 'dao động', 'sóng', 'ánh sáng',
        'nhiệt độ', 'định luật', 'nguyên lý', 'hiện tượng', 'công thức'
      ];
      
      const foundTerms = physicsTerms.filter(term => 
        value.toLowerCase().includes(term)
      );

      setAnalysis({
        sentences: sentences.length,
        physicsTerms: foundTerms,
        hasFormula: /[=+\-*/()]/g.test(value),
        hasExample: value.toLowerCase().includes('ví dụ') || value.toLowerCase().includes('chẳng hạn')
      });
    } else {
      setAnalysis(null);
    }
  }, [value]);

  const getProgressColor = () => {
    if (wordCount < minWords) return '#ff4d4f';
    if (wordCount > maxWords) return '#ff7a45';
    return '#52c41a';
  };

  const getValidationIcon = () => {
    if (!value) return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    if (!isValid) return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
    return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
  };

  return (
    <div className="essay-question">
      {/* Header với thông tin câu hỏi */}
      <div className="essay-header">
        <h4>Câu hỏi tự luận</h4>
        <div className="essay-meta">
          <span>Độ dài: {minWords}-{maxWords} từ</span>
          {question.essayStyle && (
            <span className="essay-style">Kiểu: {question.essayStyle}</span>
          )}
        </div>
      </div>

      {/* Hướng dẫn làm bài */}
      {(keyPoints.length > 0 || question.gradingRubric) && (
        <Card 
          size="small" 
          title="💡 Hướng dẫn làm bài" 
          className="essay-guidelines"
          collapsible
        >
          {keyPoints.length > 0 && (
            <div className="key-points">
              <p><strong>Các điểm cần đề cập:</strong></p>
              <ul>
                {keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}
          
          {question.gradingRubric && (
            <div className="grading-rubric">
              <p><strong>Tiêu chí chấm điểm:</strong></p>
              <div dangerouslySetInnerHTML={{ __html: question.gradingRubric }} />
            </div>
          )}

          {gradingCriteria.length > 0 && (
            <div className="grading-criteria">
              <p><strong>Thang điểm chi tiết:</strong></p>
              {gradingCriteria.map((criteria, index) => (
                <div key={index} className="criteria-item">
                  <strong>{criteria.criteriaName}</strong> ({criteria.maxPoints} điểm): {criteria.description}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Advanced Text Editor */}
      <div className="essay-input-container">
        <AdvancedTextEditor
          value={value || ''}
          onChange={onChange}
          placeholder="Nhập câu trả lời của bạn... Hãy trình bày một cách có logic, sử dụng thuật ngữ khoa học chính xác và đưa ra ví dụ cụ thể."
          disabled={disabled}
          minHeight="200px"
        />
        
        {/* Word count và progress */}
        <div className="essay-footer">
          <div className="word-count-container">
            <div className="word-count-info">
              {getValidationIcon()}
              <span className={`word-count ${!isValid ? 'word-count--invalid' : ''}`}>
                {validationMessage}
              </span>
            </div>
            
            <Progress
              percent={completionPercentage}
              size="small"
              strokeColor={getProgressColor()}
              showInfo={false}
              style={{ width: 200 }}
            />
          </div>

          {/* Phân tích nội dung */}
          {analysis && (
            <div className="content-analysis">
              <Tooltip title="Số câu trong bài viết">
                <span className="analysis-item">📝 {analysis.sentences} câu</span>
              </Tooltip>
              
              {analysis.physicsTerms.length > 0 && (
                <Tooltip title={`Thuật ngữ vật lý: ${analysis.physicsTerms.join(', ')}`}>
                  <span className="analysis-item">🔬 {analysis.physicsTerms.length} thuật ngữ</span>
                </Tooltip>
              )}
              
              {analysis.hasFormula && (
                <Tooltip title="Có sử dụng công thức hoặc tính toán">
                  <span className="analysis-item">🧮 Có công thức</span>
                </Tooltip>
              )}
              
              {analysis.hasExample && (
                <Tooltip title="Có đưa ra ví dụ">
                  <span className="analysis-item">💡 Có ví dụ</span>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sample answer nếu có */}
      {question.sampleAnswer && (
        <Card 
          size="small" 
          title="📖 Câu trả lời mẫu (chỉ xem sau khi nộp bài)" 
          className="sample-answer"
          style={{ marginTop: 16, display: 'none' }} // Ẩn khi làm bài
        >
          <div dangerouslySetInnerHTML={{ __html: question.sampleAnswer }} />
        </Card>
      )}
      {/* Tips để viết bài tốt hơn */}
      {/* <div className="essay-tips">
        <Alert
          message="💡 Mẹo viết bài tự luận hiệu quả"
          description={
            <ul>
              <li>Bắt đầu bằng định nghĩa hoặc phát biểu định luật</li>
              <li>Giải thích rõ ràng bằng lời và công thức</li>
              <li>Đưa ra ví dụ thực tế hoặc bài tập minh họa</li>
              <li>Kết luận tóm tắt những điểm chính</li>
              <li>Sử dụng thuật ngữ khoa học chính xác</li>
            </ul>
          }
          type="info"
          showIcon
          closable
          style={{ marginTop: 12 }}
        />
      </div> */}
    </div>
  );
};

export default EssayQuestion; 