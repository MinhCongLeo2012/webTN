import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaSearch } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import './StudentClassDetail.css';

function StudentClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch đề thi của lớp
  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/exam/class/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const examData = response.data.data.map(exam => ({
          ...exam,
          tgbatdau: new Date(exam.tgbatdau),
          tgketthuc: new Date(exam.tgketthuc)
        }));
        
        // Sắp xếp theo thời gian bắt đầu mới nhất
        const sortedExams = examData.sort((a, b) => b.tgbatdau - a.tgbatdau);
        setExams(sortedExams);
        setFilteredExams(sortedExams);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
    // Thiết lập interval để tự động refresh danh sách mỗi 30 giây
    const intervalId = setInterval(fetchExams, 30000);
    return () => clearInterval(intervalId);
  }, [id]);

  useEffect(() => {
    const filtered = exams.filter(exam =>
      exam.tende.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExams(filtered);
  }, [searchTerm, exams]);

  const handleExamClick = (examId) => {
    navigate(`/student/exam/${examId}`);
  };

  const getExamStatus = (exam) => {
    if (exam.trangthai === 'completed') {
      return {
        status: 'student-exam-card-completed',
        text: 'Đã làm'
      };
    } else {
      return {
        status: 'student-exam-card-upcoming',
        text: 'Chưa làm'
      };
    }
  };

  return (
    <div className="student-exam-page">
      <div className="student-exam-header">
        <div className="student-exam-search">
          <input
            type="text"
            className="student-exam-search-input"
            placeholder="Tìm kiếm đề thi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="student-exam-search-icon" />
        </div>
      </div>

      <div className="student-exam-grid">
        {loading ? (
          <div className="loading-message">Đang tải danh sách đề thi...</div>
        ) : filteredExams.length > 0 ? (
          filteredExams.map(exam => {
            const examStatus = getExamStatus(exam);
            return (
              <div 
                key={exam.iddethi} 
                className={`student-exam-card ${examStatus.status}`}
                onClick={() => handleExamClick(exam.iddethi)}
              >
                <div className="student-exam-icon">
                  <FaFileAlt />
                </div>
                <div className="student-exam-content">
                  <div className="student-exam-info">
                    <h3 className="student-exam-name">{exam.tende}</h3>
                    <span className={`exam-status ${examStatus.status}`}>
                      {examStatus.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="student-exam-no-results">
            <p>Chưa có đề thi nào được giao</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentClassDetail; 