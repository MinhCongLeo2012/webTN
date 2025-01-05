import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaQuestionCircle } from 'react-icons/fa';
import { BsCalendarCheck } from 'react-icons/bs';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import './StudentExamStart.css';

function StudentExamStart() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [examInfo, setExamInfo] = useState(null);
  const [timeStatus, setTimeStatus] = useState(null);

  const fetchExamInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/exam/${id}/info`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setExamInfo(response.data.data);
        checkExamTime(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching exam info:', error);
    }
  };

  const checkExamTime = (exam) => {
    const now = new Date().getTime();
    const startTime = new Date(exam.thoigianbatdau).getTime();
    const endTime = new Date(exam.thoigianketthuc).getTime();

    if (now < startTime) {
      setTimeStatus('not_started');
    } else if (now > endTime) {
      setTimeStatus('ended');
    } else {
      setTimeStatus('in_progress');
    }
  };

  useEffect(() => {
    fetchExamInfo();
    const timeInterval = setInterval(() => {
      if (examInfo) {
        checkExamTime(examInfo);
      }
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [id, examInfo]);

  const checkExamAccess = (exam) => {
    if (exam.idmucdich === 'ON_TAP') {
      return true;
    }
    
    if (['THUONG_XUYEN', 'DINH_KY'].includes(exam.idmucdich) && exam.so_lan_lam > 0) {
      return false;
    }
    
    return true;
  };

  const renderAccessMessage = () => {
    if (!examInfo) return null;

    if (!checkExamAccess(examInfo)) {
      return (
        <div className="ses-time-message error">
          Bạn đã làm bài thi này. Không thể làm lại bài thi.
        </div>
      );
    }
    return null;
  };

  const handleStartExam = () => {
    if (timeStatus === 'in_progress' && checkExamAccess(examInfo)) {
      navigate(`/student/exam/${id}/content`);
    }
  };

  const renderTimeMessage = () => {
    if (timeStatus === 'not_started') {
      return (
        <div className="ses-time-message warning">
          Bài thi chưa bắt đầu. Vui lòng quay lại sau.
        </div>
      );
    } else if (timeStatus === 'ended') {
      return (
        <div className="ses-time-message error">
          Bài thi đã kết thúc.
        </div>
      );
    }
    return null;
  };

  if (!examInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="ses-student-exam-start-page">
      <div className="ses-exam-start-card">
        <h1 className="ses-exam-title">{examInfo.tende}</h1>
        <div className="ses-exam-info-grid">
          <div className="ses-exam-info-item">
            <div className="ses-info-label">
              <FaClock size={16} />
              <span>Thời gian làm bài</span>
            </div>
            <div className="ses-info-value">{examInfo.thoigian} phút</div>
          </div>

          <div className="ses-exam-info-item">
            <div className="ses-info-label">
              <BsCalendarCheck size={16} />
              <span>Thời gian bắt đầu</span>
            </div>
            <div className="ses-info-value">
              {new Date(examInfo.thoigianbatdau).toLocaleString()}
            </div>
          </div>

          <div className="ses-exam-info-item">
            <div className="ses-info-label">
              <BsCalendarCheck size={16} />
              <span>Thời gian kết thúc</span>
            </div>
            <div className="ses-info-value">
              {new Date(examInfo.thoigianketthuc).toLocaleString()}
            </div>
          </div>

          <div className="ses-exam-info-item">
            <div className="ses-info-label">
              <FaQuestionCircle size={16} />
              <span>Số lượng câu hỏi</span>
            </div>
            <div className="ses-info-value">{examInfo.socau}</div>
          </div>
        </div>

        {renderTimeMessage()}
        {renderAccessMessage()}

        <button 
          className={`ses-start-exam-button ${
            timeStatus !== 'in_progress' || !checkExamAccess(examInfo) ? 'disabled' : ''
          }`}
          onClick={handleStartExam}
          disabled={timeStatus !== 'in_progress' || !checkExamAccess(examInfo)}
        >
          Bắt đầu thi
        </button>
      </div>
    </div>
  );
}

export default StudentExamStart; 