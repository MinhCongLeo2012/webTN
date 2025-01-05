import React, { useState } from 'react';
import { RiUploadCloud2Line } from 'react-icons/ri';
import { FiInfo, FiDownload } from 'react-icons/fi';
import { FaCheck } from 'react-icons/fa';
import './ExamUpload.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function ExamUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.includes('pdf')) {
        toast.error('Chỉ hỗ trợ file PDF');
        return;
      }
      setFile(selectedFile);
      await readFileContent(selectedFile);
    }
  };

  const readFileContent = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exam/parse`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể đọc file');
      }

      const data = await response.json();
      setFileContent(data);
    } catch (error) {
      toast.error(error.message || 'Lỗi khi đọc file');
      setFile(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDelete = () => {
    setFile(null);
  };

  const handleConfirm = () => {
    if (!fileContent) {
      toast.error('Vui lòng đợi file được xử lý');
      return;
    }
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    
    navigate('/exam/review', { 
      state: { 
        file,
        fileContent,
        fileName
      } 
    });
  };

  const handleDownloadTemplate = async () => {
    try {
      console.log('Requesting template download...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exam/template`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Template download failed:', errorData);
        throw new Error(errorData.message || 'Không thể tải file mẫu');
      }

      const blob = await response.blob();
      console.log('Blob received:', blob);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exam_template.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('Template download completed');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.message || 'Lỗi khi tải file mẫu');
    }
  };

  return (
    <div className="exam-upload-page">
      <div className="upload-section">
        <div className="info-box">
          <FiInfo className="info-icon" />
          <span className="info-text">Hướng dẫn</span>
          <button 
            className="template-download-btn"
            onClick={handleDownloadTemplate}
          >
            <FiDownload /> Tải file mẫu
          </button>
        </div>
        <div className="info-content">
          Vui lòng tuân thủ định dạng tài liệu. Nhập mức độ câu hỏi và đáp án đúng. Mỗi đáp án nằm trên 1 dòng. Không có câu hỏi và đáp án tương ứng nào nằm ở hai trang.
        </div>

        <div 
          className="upload-area"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="file-info">
              <RiUploadCloud2Line className="upload-icon" />
              <div className="file-name">{file.name}</div>
              <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          ) : (
            <>
              <RiUploadCloud2Line className="upload-icon" />
              <div className="upload-text">Upload tài liệu đề thi</div>
              <div className="upload-hint">Hỗ trợ định dạng tài liệu PDF</div>
            </>
          )}
          <input
            type="file"
            className="file-input"
            onChange={handleFileChange}
            accept=".doc,.docx,.pdf"
          />
        </div>

        {file && (
          <div className="upload-actions">
            <button 
              className="upload-delete-button"
              onClick={handleDelete}
            >
              Xóa
            </button>
            <button 
              className="upload-confirm-button"
              onClick={handleConfirm}
            >
              Xác nhận
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExamUpload; 