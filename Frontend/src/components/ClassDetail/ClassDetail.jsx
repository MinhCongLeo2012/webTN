import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RiTeamLine } from 'react-icons/ri';
import { BsFileText } from 'react-icons/bs';
import { IoSearchOutline, IoAddOutline, IoClose } from 'react-icons/io5';
import { IoPersonAdd } from 'react-icons/io5';
import { FaFileExport, FaFileAlt, FaFileDownload } from 'react-icons/fa';
import './ClassDetail.css';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import classService from '../../services/classService';

function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [className, setClassName] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    studentId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [editStudent, setEditStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [notificationId, setNotificationId] = useState(0);
  const [assignedExams, setAssignedExams] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const fileInputRef = useRef(null);

  const refreshClassDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/classes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.data) {
        const classData = response.data.data;
        setClassName(classData.tenlop);
        setSchoolYear(classData.namhoc);
        
        // Cập nhật localStorage
        localStorage.setItem('currentClass', JSON.stringify({
          idlop: classData.idlop,
          tenlop: classData.tenlop,
          namhoc: classData.namhoc
        }));
      }
    } catch (error) {
      console.error('Error refreshing class details:', error);
      // Lấy từ localStorage nếu API fail
      const savedClass = JSON.parse(localStorage.getItem('currentClass') || '{}');
      if (savedClass.tenlop) setClassName(savedClass.tenlop);
      if (savedClass.namhoc) setSchoolYear(savedClass.namhoc);
    }
  };

  useEffect(() => {
    refreshClassDetails();
    
    // Thiết lập interval để refresh định kỳ
    const intervalId = setInterval(refreshClassDetails, 30000); // 30 giây refresh một lần
    
    return () => {
      clearInterval(intervalId);
    };
  }, [id]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedClass = JSON.parse(localStorage.getItem('currentClass') || '{}');
      if (savedClass.tenlop) setClassName(savedClass.tenlop);
      if (savedClass.namhoc) setSchoolYear(savedClass.namhoc);
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleCopyLink = () => {
    const link = `Link tham gia lớp học ${className}`;
    navigator.clipboard.writeText(link);
    // Có thể thêm thông báo copy thành công
  };

  const handleAddStudentClick = () => {
    setShowAddStudentModal(true);
    setFormData({ email: '', studentId: '' });
    setFormErrors({});
    setEditStudent(null);
  };

  const renderAddStudentModal = () => {
    if (!showAddStudentModal) return null;

    return (
      <div className="modal-overlay">
        <div className="add-student-modal">
          <div className="modal-header">
            <h2>Thêm Học Sinh</h2>
            <button className="close-button" onClick={() => setShowAddStudentModal(false)}>
              <IoClose />
            </button>
          </div>
          <div className="manual-form">
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Nhập email (@gmail.com)" 
              />
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
            </div>
            <div className="form-group">
              <label>Số báo danh</label>
              <input 
                type="text" 
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                placeholder="Nhập số báo danh" 
              />
              {formErrors.studentId && <span className="error-message">{formErrors.studentId}</span>}
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => {
                setShowAddStudentModal(false);
                setFormData({ email: '', studentId: '' });
                setFormErrors({});
              }}>
                Hủy
              </button>
              <button className="sem-submit-button" onClick={handleAddStudent}>
                Thêm học sinh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const renderContent = () => {
    if (activeTab === 'students') {
      return (
        <div>
          <div className="class-info-header">
            <div className="class-info-text">
              {className && <h2>{className}</h2>}
              {schoolYear && <h3>({schoolYear})</h3>}
            </div>
          </div>
          <div className="class-actions">
            <div className="student-search-box">
              <IoSearchOutline className="student-search-icon" />
              <input 
                type="text" 
                placeholder="Tìm theo tên, email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="action-group">
              {selectedStudents.length > 0 && (
                <div className="selected-actions">
                  <span>Đã chọn {selectedStudents.length}</span>
                  <button 
                    className="delete-selected-button"
                    onClick={() => {
                      setSelectedStudent({ ids: selectedStudents });
                      setShowDeleteModal(true);
                    }}
                  >
                    Xóa
                  </button>
                </div>
              )}
              <button className="student-action-button" onClick={handleExportStudentList}>
                <FaFileExport /> Xuất danh sách HS
              </button>
              <button 
                className="student-action-button" 
                onClick={() => setShowExportModal(true)}
              >
                <FaFileExport /> Xuất bảng điểm
              </button>
              <button className="student-action-button" onClick={handleAddStudentClick}>
                <IoPersonAdd /> Thêm học sinh
              </button>
              <button className="student-action-button" onClick={() => setShowImportModal(true)}>
                <IoPersonAdd /> Import DS học sinh
              </button>
            </div>
          </div>
          {students && students.length > 0 ? renderStudentTable() : null}
        </div>
      );
    } else if (activeTab === 'exams') {
      return (
        <div>
          <div className="class-info-header">
            <div className="class-info-text">
              <h2>{className}</h2>
              <h3>({schoolYear})</h3>
            </div>
          </div>
          <div className="exam-actions">
            <div className="exam-search-box">
              <IoSearchOutline className="exam-search-icon" />
              <input 
                type="text" 
                placeholder="Tìm kiếm đề thi"
              />
            </div>
            <div className="exam-action-group">
              <button 
                className="exam-action-button"
                onClick={handleAddExam}
              >
                <IoAddOutline /> Thêm đề thi mới
              </button>
            </div>
          </div>
          <div className="exam-list-container">
            <h3 className="exam-list-title">Danh sách các đề đã giao</h3>
            <div className="exams-grid">
              {assignedExams.map((exam) => (
                <div key={exam.iddethi} className="exam-card">
                  <div className="exam-icon">
                    <FaFileAlt />
                  </div>
                  <div className="exam-info">
                    <h4>{exam.tende}</h4>
                    <p>{exam.luot_lam || 0} lượt làm</p>
                  </div>
                </div>
              ))}
              {assignedExams.length === 0 && (
                <div className="exam-empty-state">
                  <div className="exam-empty-icon">
                    <BsFileText size={48} color="var(--primary-color)" />
                  </div>
                  <p className="exam-empty-text">Chưa có đề thi nào!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Kiểm tra email
    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!formData.email.endsWith('@gmail.com')) {
      errors.email = 'Email phải là địa chỉ Gmail';
    }

    // Kiểm tra số báo danh (không bắt buộc)
    if (formData.studentId.trim()) {
      const isNumber = /^\d+$/.test(formData.studentId);
      if (!isNumber) {
        errors.studentId = 'Số báo danh phải là số';
      } else {
        const isDuplicateId = students.some(student => 
          student.studentId === formData.studentId && 
          (!editStudent || student.id !== editStudent.id)
        );
        if (isDuplicateId) {
          errors.studentId = 'Số báo danh đã tồn tại';
        }
      }
    }

    return errors;
  };

  const showNotification = (message, type = 'success') => {
    setNotificationId(prev => prev + 1);
    setNotification({
      show: true,
      message,
      type,
      id: notificationId
    });
  };

  const handleAddStudent = async () => {
    try {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/class-details/${id}/students`,
        {
          email: formData.email,
          studentId: formData.studentId || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const newStudent = {
          id: response.data.data.iduser,
          name: response.data.data.hoten,
          email: response.data.data.email,
          studentId: response.data.data.sbd || '',
          completedExams: 0,
          totalExams: 0
        };

        const updatedStudents = [...students, newStudent];
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);
        
        // Cập nhật localStorage cho danh sách học sinh
        localStorage.setItem(`class_${id}_students`, JSON.stringify(updatedStudents));
        
        // Cập nhật sĩ số trong localStorage
        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        const updatedClasses = classes.map(c => 
          c.idlop === id 
            ? { ...c, siso: response.data.siso }
            : c
        );
        localStorage.setItem('classes', JSON.stringify(updatedClasses));

        setShowAddStudentModal(false);
        setFormData({ email: '', studentId: '' });
        showNotification('Thêm học sinh thành công', 'success');
      }
    } catch (error) {
      console.error('Error details:', error);
      showNotification(error.response?.data?.message || 'Lỗi khi thêm học sinh', 'error');
    }
  };

  const renderStudentTable = () => {
    if (students.length === 0) return null;
    
    return (
      <table className="student-list-table">
        <thead>
          <tr>
            <th className="checkbox-cell">
              <input 
                type="checkbox" 
                checked={selectedStudents.length === filteredStudents.length}
                onChange={handleSelectAll}
              />
            </th>
            <th className="number-cell">Sĩ số: {students.length}</th>
            <th className="name-cell">Họ và Tên</th>
            <th className="student-id-cell">Số báo danh</th>
            <th className="exam-count-cell">Đề thi đã làm</th>
            <th className="action-cell">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student, index) => (
            <tr key={student.id}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleSelectStudent(student.id)}
                />
              </td>
              <td className="center-text">{index + 1}</td>
              <td className="name-cell">
                <div>{student.name}</div>
                <div className="student-email">{student.email}</div>
              </td>
              <td className="center-text">{student.studentId}</td>
              <td className="center-text">
                {student.completedExams}/{student.totalExams}
              </td>
              <td className="center-text">
                <div className="actions-buttons">
                  <button className="edit-button action-button" onClick={() => handleEditClick(student)}>Sửa</button>
                  <button 
                    className="delete-button action-button" 
                    onClick={() => handleDeleteClick(student)}
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const handleEditClick = (student) => {
    setFormData({
      email: student.email,
      studentId: student.studentId
    });
    setEditStudent(student);
    setFormErrors({});
  };

  const handleEditSubmit = async () => {
    try {
      const errors = validateForm(formData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/class-details/${id}/students/${editStudent.id}`,
        {
          email: formData.email,
          studentId: formData.studentId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const updatedStudents = students.map(student => 
          student.id === editStudent.id 
            ? {
                ...student,
                email: formData.email,
                studentId: formData.studentId
              }
            : student
        );
        
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);
        localStorage.setItem(`class_${id}_students`, JSON.stringify(updatedStudents));
        setEditStudent(null);
        setFormData({ email: '', studentId: '' });
        setFormErrors({});
        showNotification('Cập nhật thông tin học sinh thành công!', 'success');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      showNotification(
        error.response?.data?.message || 'Lỗi khi cập nhật thông tin học sinh', 
        'error'
      );
    }
  };

  const renderEditModal = () => {
    if (!editStudent) return null;

    return (
      <div className="sem-modal-overlay">
        <div className="sem-modal-content">
          <h3 className="sem-modal-title">Sửa thông tin học sinh</h3>
          <div className="sem-form">
            <div className="sem-form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Nhập email (@gmail.com)" 
              />
              {formErrors.email && <span className="sem-error-message">{formErrors.email}</span>}
            </div>
            <div className="sem-form-group">
              <label>Số báo danh</label>
              <input 
                type="text" 
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                placeholder="Nhập số báo danh" 
              />
              {formErrors.studentId && <span className="sem-error-message">{formErrors.studentId}</span>}
            </div>
            <div className="sem-modal-actions">
              <button 
                className="sem-cancel-button" 
                onClick={() => {
                  setEditStudent(null);
                  setFormData({ email: '', studentId: '' });
                  setFormErrors({});
                }}
              >
                Hủy
              </button>
              <button className="sem-submit-button" onClick={handleEditSubmit}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      let response;

      if (selectedStudent.ids) {
        // Xóa nhiều học sinh
        response = await axios.delete(
          `${API_BASE_URL}/api/class-details/${id}/students/bulk`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { studentIds: selectedStudent.ids }
          }
        );
      } else {
        // Xóa một học sinh
        response = await axios.delete(
          `${API_BASE_URL}/api/class-details/${id}/students/${selectedStudent.id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      if (response.data.success) {
        const updatedStudents = selectedStudent.ids
          ? students.filter(student => !selectedStudent.ids.includes(student.id))
          : students.filter(student => student.id !== selectedStudent.id);

        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents);
        setSelectedStudents([]);
        
        // Cập nhật localStorage cho danh sách học sinh
        localStorage.setItem(`class_${id}_students`, JSON.stringify(updatedStudents));
        
        // Cập nhật sĩ số trong localStorage
        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        const updatedClasses = classes.map(c => 
          c.idlop === id 
            ? { ...c, siso: response.data.siso }
            : c
        );
        localStorage.setItem('classes', JSON.stringify(updatedClasses));
        
        setShowDeleteModal(false);
        setSelectedStudent(null);
        showNotification(
          selectedStudent.ids 
            ? `Đã xóa ${selectedStudent.ids.length} học sinh khỏi lớp`
            : 'Đã xóa học sinh khỏi lớp', 
          'success'
        );
      }
    } catch (error) {
      console.error('Error deleting student(s):', error);
      showNotification(
        error.response?.data?.message || 'Lỗi khi xóa học sinh',
        'error'
      );
    }
  };

  const renderDeleteModal = () => {
    if (!showDeleteModal || !selectedStudent) return null;

    const deleteMessage = selectedStudent.ids 
      ? `Bạn có muốn xóa ${selectedStudent.ids.length} học sinh đã chọn ra khỏi lớp "${className}"?`
      : `Bạn có muốn xóa học sinh "${selectedStudent.name}" ra khỏi lớp "${className}"?`;

    return (
      <div className="modal-overlay">
        <div className="delete-student-modal">
          <p className="delete-confirmation-text">
            {deleteMessage}
          </p>
          <div className="modal-actions">
            <button 
              className="cancel-button" 
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedStudent(null);
              }}
            >
              Hủy
            </button>
            <button 
              className="delete-confirm-button" 
              onClick={handleConfirmDelete}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderNotification = () => {
    if (!notification.show) return null;

    return (
      <div 
        key={notification.id}
        className={`notification ${notification.type}`}
        onClick={() => setNotification(prev => ({ ...prev, show: false }))}
        style={{ cursor: 'pointer' }}
      >
        {notification.message}
      </div>
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  console.log('State values:', { className, schoolYear });

  useEffect(() => {
    const filtered = students.filter(student => {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
      );
    });
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  const fetchStudentsData = async () => {
    try {
      console.log("Fetching students for class:", id);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/class-details/${id}/students`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const formattedStudents = response.data.data.map(student => ({
          id: student.iduser,
          name: student.hoten,
          email: student.email,
          studentId: student.sobaodanh || '',
          completedExams: parseInt(student.completed_exams) || 0,
          totalExams: parseInt(student.total_exams) || 0
        }));
        
        console.log("Formatted students:", formattedStudents);
        
        setStudents(formattedStudents);
        setFilteredStudents(formattedStudents);
        localStorage.setItem(`class_${id}_students`, JSON.stringify(formattedStudents));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showNotification('Lỗi khi tải danh sách học sinh', 'error');
    }
  };

  useEffect(() => {
    if (id) {
      fetchStudentsData();
    }
  }, [id]);

  useEffect(() => {
    let timer;
    if (notification.show) {
      timer = setTimeout(() => {
        setNotification(prev => ({...prev, show: false}));
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [notification.id]);

  const handleAddExam = () => {
    navigate('/exam');
  };

  const fetchAssignedExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/class-details/${id}/exams`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setAssignedExams(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching assigned exams:', error);
      showNotification('Lỗi khi tải danh sách đề thi', 'error');
    }
  };

  useEffect(() => {
    if (id && activeTab === 'exams') {
      fetchAssignedExams();
    }
  }, [id, activeTab]);

  const handleExportStudentList = async () => {
    try {
      await classService.exportStudentList(id);
      showNotification('Xuất danh sách học sinh thành công', 'success');
    } catch (error) {
      console.error('Error exporting student list:', error);
      showNotification(
        error.message || 'Lỗi khi xuất danh sách học sinh', 
        'error'
      );
    }
  };

  const handleImportStudents = async (event) => {
    event.preventDefault();
    const file = fileInputRef.current.files[0];
    
    if (!file) {
      showNotification('Vui lòng chọn file Excel', 'error');
      return;
    }

    try {
      const response = await classService.importStudents(id, file);
      showNotification(
        `Đã thêm ${response.results.length} học sinh vào lớp`, 
        'success'
      );
      if (response.errors?.length > 0) {
        console.log('Import errors:', response.errors);
      }
      setShowImportModal(false);
      fetchStudentsData(); // Refresh danh sách
    } catch (error) {
      showNotification(
        error.message || 'Lỗi khi import danh sách học sinh', 
        'error'
      );
    }
  };

  const renderImportModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header-h2">
          <h2>Import danh sách học sinh</h2>
        </div>
        <div className="modal-body">
          <div className="import-instructions">
            <p>Để import danh sách học sinh:</p>
            <ol>
              <li>Tải file mẫu Excel</li>
              <li>Điền thông tin học sinh vào file</li>
              <li>Tải file đã điền lên hệ thống</li>
            </ol>
          </div>
          <button 
            className="template-button"
            onClick={() => classService.getImportTemplate(id)}
          >
            <FaFileDownload /> Tải file mẫu
          </button>
          <form onSubmit={handleImportStudents}>
            <div className="form-group">
              <label>Chọn file Excel đã điền thông tin</label>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls"
                required
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="cancel-button" onClick={() => setShowImportModal(false)}>
                Hủy
              </button>
              <button type="submit" className="sem-submit-button">
                Import
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const handleExportExamResults = async (examId) => {
    try {
      if (!examId) {
        showNotification('Vui lòng chọn đề thi để xuất bảng điểm', 'error');
        return;
      }
      
      console.log('Exporting results for exam:', examId); // Debug log
      await classService.exportExamResults(id, examId);
      showNotification('Xuất bảng điểm thành công', 'success');
    } catch (error) {
      console.error('Error exporting results:', error);
      showNotification(
        error.message || 'Lỗi khi xuất bảng điểm', 
        'error'
      );
    }
  };

  const renderExportModal = () => {
    if (!showExportModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Chọn đề thi để xuất điểm</h3>
          <div className="exam-list">
            {assignedExams.map(exam => (
              <div 
                key={exam.iddethi}
                className={`exam-item ${selectedExamId === exam.iddethi ? 'selected' : ''}`}
                onClick={() => setSelectedExamId(exam.iddethi)}
              >
                {exam.tende}
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button 
              className="cancel-button"
              onClick={() => {
                setShowExportModal(false);
                setSelectedExamId(null);
              }}
            >
              Hủy
            </button>
            <button 
              className="export-button"
              disabled={!selectedExamId}
              onClick={() => {
                handleExportExamResults(selectedExamId);
                setShowExportModal(false);
              }}
            >
              Xuất điểm
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchAssignedExams = async () => {
      if (showExportModal) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_BASE_URL}/api/class-details/${id}/exams`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.success) {
            console.log('Fetched exams:', response.data.data);
            setAssignedExams(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching assigned exams:', error);
          showNotification('Lỗi khi lấy danh sách đề thi', 'error');
        }
      }
    };

    fetchAssignedExams();
  }, [id, showExportModal]);

  return (
    <div className="class-detail-page">
      <div className="class-detail-container">
        <div className="class-sidebar">
          <div 
            className={`sidebar-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <RiTeamLine className="sidebar-icon" />
            <span>Danh sách học sinh</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'exams' ? 'active' : ''}`}
            onClick={() => setActiveTab('exams')}
          >
            <BsFileText className="sidebar-icon" />
            <span>đề thi</span>
          </div>
        </div>
        <div className="content-divider"></div>
        <div className="class-content">
          {renderContent()}
        </div>
      </div>
      {renderAddStudentModal()}
      {editStudent && renderEditModal()}
      {renderDeleteModal()}
      {renderNotification()}
      {showImportModal && renderImportModal()}
      {renderExportModal()}
    </div>
  );
}

export default ClassDetail; 