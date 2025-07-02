import React, { useState, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Button, message } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { smartUpload } from '../../../quiz-uploads/firebaseStorage';
import './index.scss';

const AdvancedTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Nhập nội dung...', 
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Selected file:', file); // Debug

    // Kiểm tra định dạng file
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file hình ảnh!');
      return;
    }

    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước file không được vượt quá 5MB!');
      return;
    }

    setUploading(true);
    console.log('Starting upload...'); // Debug
    
    try {
      const imageUrl = await smartUpload(file, 'essay-images');
      console.log('Upload successful:', imageUrl); // Debug
      
      // Chèn markdown image vào vị trí cursor
      const imageMarkdown = `![${file.name}](${imageUrl})`;
      const newValue = value + '\n\n' + imageMarkdown + '\n\n';
      onChange?.(newValue);
      
      message.success('Upload ảnh thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      message.error(`Upload ảnh thất bại: ${error.message}`);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    console.log('Upload button clicked'); // Debug
    fileInputRef.current?.click();
  };

  return (
    <div className="advanced-text-editor">
      {/* Toolbar tùy chỉnh - hiển thị rõ ràng hơn */}
      <div className="editor-toolbar" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '12px', 
        border: '1px solid #d9d9d9',
        borderRadius: '6px 6px 0 0',
        backgroundColor: '#fafafa'
      }}>
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          loading={uploading}
          onClick={handleUploadClick}
          size="small"
          disabled={disabled}
        >
          {uploading ? 'Đang upload...' : 'Upload ảnh'}
        </Button>
        
        <span style={{ fontSize: '12px', color: '#666' }}>
          Chọn ảnh để chèn vào nội dung
        </span>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>

      {/* MD Editor */}
      <MDEditor
        value={value}
        onChange={(val) => onChange?.(val || '')}
        preview="edit"
        hideToolbar={false}
        visibleDragBar={false}
        height={200}
        data-color-mode="light"
        style={{
          backgroundColor: 'white',
          '--md-editor-focus-outline': '#1890ff',
          '--md-editor-focus-border': '#1890ff',
          borderRadius: '0 0 6px 6px'
        }}
        textareaProps={{
          placeholder,
          disabled,
          style: {
            fontSize: '14px',
            lineHeight: '1.6',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }
        }}
      />

      {/* Hướng dẫn sử dụng */}
      <div className="editor-help" style={{ 
        padding: '8px 12px', 
        backgroundColor: '#f6f8fa', 
        borderTop: '1px solid #d9d9d9',
        borderRadius: '0 0 6px 6px'
      }}>
        <small style={{ color: '#666' }}>
          💡 Hỗ trợ Markdown: **đậm**, *nghiêng*, ## tiêu đề, ![ảnh](url), [link](url), - danh sách
        </small>
      </div>
    </div>
  );
};

export default AdvancedTextEditor;      