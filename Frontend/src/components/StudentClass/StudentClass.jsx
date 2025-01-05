import React, { useState, useEffect } from 'react';
import { FaBook, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import './StudentClass.css';

function StudentClass() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!user || !token) {
          setError('Vui lòng đăng nhập lại');
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/classes/student/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          const classesData = response.data.data.map(classItem => ({
            id: classItem.idlop,
            name: classItem.tenlop,
            teacher: classItem.teacher_name,
            students: classItem.siso || 0,
            schoolYear: classItem.namhoc,
            students_list: classItem.students_list || []
          }));

          setClasses(classesData);
          setFilteredClasses(classesData);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError('Không thể tải danh sách lớp học');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  useEffect(() => {
    const filtered = classes.filter(classItem =>
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (classItem.students_list && classItem.students_list.some(student => 
        student.hoten.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
    setFilteredClasses(filtered);
  }, [searchTerm, classes]);

  const handleClassClick = (classId) => {
    navigate(`/student/class/${classId}`);
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="student-class-page">
      <div className="student-class-header">
        <h2 className="student-class-title">Danh sách lớp học</h2>
        <div className="student-class-search">
          <input
            type="text"
            className="student-class-search-input"
            placeholder="Tìm kiếm lớp học theo tên hoặc giáo viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="student-class-search-icon" />
        </div>
      </div>

      <div className="student-class-grid">
        {filteredClasses.length > 0 ? (
          filteredClasses.map(classItem => (
            <div 
              key={classItem.id} 
              className="student-class-card"
              onClick={() => handleClassClick(classItem.id)}
            >
              <div className="student-class-icon">
                <FaBook />
              </div>
              <div className="student-class-content">
                <h3 className="student-class-name">{classItem.name}</h3>
                <div className="student-class-details">
                  <p className="student-class-detail">
                    <span className="student-class-detail-label">Giáo viên:</span> {classItem.teacher}
                  </p>
                  <p className="student-class-detail">
                    <span className="student-class-detail-label">Sĩ số:</span> {classItem.students} học sinh
                  </p>
                  <p className="student-class-detail">
                    <span className="student-class-detail-label">Năm học:</span> {classItem.schoolYear}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="student-class-no-results">
            <p>Bạn chưa tham gia vào lớp học nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentClass; 