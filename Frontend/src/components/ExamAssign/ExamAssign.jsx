import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ExamAssign.css';
import { toast } from 'react-toastify';
import classService from '../../services/classService';
import { API_BASE_URL } from '../../config';
import examService from '../../services/exam.service';

// Thêm các hàm helper
const getKhoiName = (idkhoi) => {
  const khoiMap = {
    'L10': 'Lớp 10',
    'L11': 'Lớp 11',
    'L12': 'Lớp 12'
  };
  return khoiMap[idkhoi] || idkhoi;
};

const getSubjectName = (idmonhoc) => {
  const subjectMap = {
    'AN': 'Âm nhạc',
    'CN': 'Công nghệ',
    'DIA': 'Địa lý', 
    'GDCD': 'GDCD',
    'GDKTPL': 'Giáo dục kinh tế và pháp luật',
    'GDQPAN': 'Giáo dục quốc phòng và an ninh',
    'GDTC': 'Giáo dục thể chất',
    'HOA': 'Hóa học',
    'NN1': 'Ngoại ngữ 1',
    'NN2': 'Ngoại ngữ 2',
    'SINH': 'Sinh học',
    'SU': 'Lịch sử',
    'TDTTS': 'Tiếng dân tộc thiểu số',
    'TIN': 'Tin học',
    'TOAN': 'Toán',
    'VAN': 'Ngữ văn',
    'VLY': 'Vật lý'
  };
  return subjectMap[idmonhoc] || idmonhoc;
};

const getMucDichLabel = (idmucdich) => {
  const purposeMap = {
    'THUONG_XUYEN': 'Đánh giá thường xuyên',
    'DINH_KY': 'Đánh giá định kỳ',
    'ON_TAP': 'Ôn tập'
  };
  return purposeMap[idmucdich] || idmucdich;
};

function ExamAssign() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedExam = location.state?.selectedExams[0] || null;

  const [examSettings, setExamSettings] = useState({
    ...selectedExam,
    duration: '',
    startDate: '',
    endDate: '',
  });

  const [selectedClasses, setSelectedClasses] = useState([]);
  const [classes, setClasses] = useState([]);

  // Fetch danh sách lớp khi component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await classService.getAllClasses();
        if (response.success) {
          setClasses(response.data);
        } else {
          throw new Error(response.message || 'Không thể lấy danh sách lớp');
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error(error.message || 'Lỗi khi lấy danh sách lớp học');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchClasses();
  }, [navigate]);

  const handleDateChange = (field, value) => {
    setExamSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    setExamSettings({
      ...selectedExam,
      duration: '',
      startDate: '',
      endDate: '',
    });
    setSelectedClasses([]);
  };

  const handleClassSelect = (classId) => {
    setSelectedClasses(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setExamSettings(prev => ({
        ...prev,
        duration: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!examSettings.duration) {
        toast.error('Vui lòng nhập thời gian làm bài');
        return;
      }

      if (!examSettings.startDate || !examSettings.endDate) {
        toast.error('Vui lòng chọn thời gian giao đề');
        return;
      }

      if (selectedClasses.length === 0) {
        toast.error('Vui lòng chọn ít nhất một lớp');
        return;
      }

      // Kiểm tra thời gian bắt đầu và kết thúc
      const startTime = new Date(examSettings.startDate);
      const endTime = new Date(examSettings.endDate);
      const currentTime = new Date();

      if (startTime < currentTime) {
        toast.error('Thời gian bắt đầu phải lớn hơn thời gian hiện tại');
        return;
      }

      if (endTime <= startTime) {
        toast.error('Thời gian kết thúc phải lớn hơn thời gian bắt đầu');
        return;
      }

      const assignmentData = {
        duration: parseInt(examSettings.duration),
        startDate: examSettings.startDate,
        endDate: examSettings.endDate,
        classes: selectedClasses
      };

      console.log('Submitting exam assignment:', {
        examId: selectedExam.iddethi,
        data: assignmentData
      }); // Debug log

      const response = await examService.assignExam(selectedExam.iddethi, assignmentData);

      if (response.success) {
        toast.success('Giao đề thi thành công!');
        navigate('/exam');
      }
    } catch (error) {
      console.error('Error assigning exam:', error);
      if (error.message.includes('Session expired')) {
        toast.error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại');
        navigate('/login');
      } else {
        toast.error(error.message || 'Lỗi khi giao đề thi');
      }
    }
  };

  // Giữ nguyên phần return với các class CSS gốc
  return (
    <div className="exam-assign-container">
      <div className="form-section">
        <label>Tên đề thi</label>
        <input 
          type="text" 
          value={selectedExam.tende || ''} 
          disabled 
        />
      </div>

      <div className="form-row">
        <div className="form-section">
          <label>Khối học</label>
          <input 
            type="text" 
            value={getKhoiName(selectedExam.idkhoi) || ''} 
            disabled 
          />
        </div>
        <div className="form-section">
          <label>Môn học</label>
          <input 
            type="text" 
            value={getSubjectName(selectedExam.idmonhoc) || ''} 
            disabled 
          />
        </div>
      </div>

      <div className="form-section">
        <label>Mục đích tạo đề</label>
        <input 
          type="text" 
          value={getMucDichLabel(selectedExam.idmucdich) || ''} 
          disabled 
        />
      </div>

      <div className="form-section">
        <label>Thời gian làm bài (phút)</label>
        <input
          type="number"
          min="0"
          value={examSettings.duration}
          onChange={(e) => handleDurationChange(e)}
          placeholder="Nhập thời gian làm bài"
        />
      </div>

      <div className="form-section">
        <label>Thời gian giao đề</label>
        <div className="date-row">
          <div className="date-input">
            <label>Từ</label>
            <input
              type="datetime-local"
              value={examSettings.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
          </div>
          <div className="date-input">
            <label>Đến</label>
            <input
              type="datetime-local"
              value={examSettings.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </div>
          <button className="reset-button" onClick={handleReset}>
            Đặt lại
          </button>
        </div>
      </div>

      <div className="class-selection">
        <h3>Chọn lớp học</h3>
        <div className="class-grid">
          {classes.map((classItem) => (
            <div key={classItem.idlop} className="class-checkbox">
              <input
                type="checkbox"
                id={classItem.idlop}
                checked={selectedClasses.includes(classItem.idlop)}
                onChange={() => handleClassSelect(classItem.idlop)}
              />
              <label htmlFor={classItem.idlop}>{classItem.tenlop}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="exam-assign-actions">
        <button className="submit-button-exam-assign" onClick={handleSubmit}>
          Giao đề thi
        </button>
      </div>
    </div>
  );
}

export default ExamAssign; 