import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineSearch } from 'react-icons/hi';
import { FaPlus, FaEdit, FaCopy, FaTrash } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { BsThreeDotsVertical } from 'react-icons/bs';
import classService from '../../services/classService';
import '../../components/Ground/Ground.css';
import './Class.css';

function Class() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [classData, setClassData] = useState({
    tenlop: '',
    namhoc: '2024-2025'
  });
  const [classes, setClasses] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
    
    // Add event listener for class updates
    const handleClassUpdate = () => {
      fetchClasses();
    };
    
    window.addEventListener('classUpdated', handleClassUpdate);
    
    return () => {
      window.removeEventListener('classUpdated', handleClassUpdate);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await classService.getAllClasses();
      
      if (response.status === 401) {
        // Token hết hạn hoặc không hợp lệ
        localStorage.removeItem('token'); // Xóa token
        navigate('/login'); // Chuyển về trang login
        return;
      }
      
      if (!response || !response.data) {
        throw new Error('Invalid response format');
      }
      
      setClasses(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      console.error('Error fetching classes:', error);
      showNotification(
        error.message || 'Lỗi khi lấy danh sách lớp học', 
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await classService.createClass(classData);
      if (response.success && response.data) {
        setClasses([...classes, response.data]);
        setShowModal(false);
        setClassData({
          tenlop: '',
          namhoc: '2024-2025'
        });
        showNotification('Tạo lớp học thành công');
      } else {
        throw new Error(response.message || 'Lỗi khi tạo lớp học');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      showNotification(error.message || 'Lỗi khi tạo lớp học', 'error');
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    try {
      const response = await classService.updateClass(selectedClass.idlop, classData);
      const updatedClasses = classes.map(c => 
        c.idlop === selectedClass.idlop ? response.data : c
      );
      setClasses(updatedClasses);
      
      // Cập nhật localStorage nếu đang chỉnh sửa lớp hiện tại
      const currentClass = JSON.parse(localStorage.getItem('currentClass') || '{}');
      if (currentClass && currentClass.tenlop === selectedClass.tenlop) {
        localStorage.setItem('currentClass', JSON.stringify({
          tenlop: classData.tenlop,
          namhoc: classData.namhoc
        }));
      }
      
      setShowEditModal(false);
      setSelectedClass(null);
      showNotification('Cập nhật lớp học thành công');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleDeleteClass = async () => {
    try {
      await classService.deleteClass(classToDelete.idlop);
      setClasses(classes.filter(c => c.idlop !== classToDelete.idlop));
      setShowDeleteModal(false);
      setClassToDelete(null);
      showNotification('Xóa lớp học thành công');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleClassClick = (classItem) => {
    localStorage.setItem('currentClass', JSON.stringify({
      idlop: classItem.idlop,
      tenlop: classItem.tenlop,
      namhoc: classItem.namhoc
    }));
    navigate(`/class/${classItem.idlop}`);
  };

  const handleEditClass = (classItem, e) => {
    e.stopPropagation();
    setSelectedClass(classItem);
    setClassData({
      tenlop: classItem.tenlop,
      namhoc: classItem.namhoc
    });
    setShowEditModal(true);
    setShowDropdown(null);
  };

  // Filter classes based on search term
  const filteredClasses = classes.filter(classItem => 
    classItem.tenlop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="class-page">
      {/* Notification component */}
      {notification.show && (
        <div className={`notification-container ${notification.type}`}>
          <div className="notification-content">
            {notification.message}
          </div>
        </div>
      )}

      {/* Search and controls */}
      <div className="exam-controls">
        <div className="search-container">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên lớp..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <HiOutlineSearch className="search-icon" />
          </div>
        </div>

        <button 
          className="add-content-button"
          onClick={() => setShowModal(true)}
        >
          <FaPlus className="icon-control" />
          Tạo lớp học
        </button>
      </div>

      {/* Class grid */}
      <div className="exams-container">
        {isLoading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <div className="exams-grid">
            {filteredClasses.map((classItem) => (
              <div 
                key={classItem.idlop} 
                className="class-card" 
                onClick={() => navigate(`/class/${classItem.idlop}`)}
              >
                <div className="class-header">
                  <h3 className="class-name">{classItem.tenlop}</h3>
                  <div className="dropdown-container">
                    <button 
                      className="more-options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(classItem.idlop);
                      }}
                    >
                      <BsThreeDotsVertical />
                    </button>
                    {showDropdown === classItem.idlop && (
                      <div className="dropdown-menu" ref={dropdownRef}>
                        <button onClick={(e) => handleEditClass(classItem, e)}>
                          <FaEdit className="dropdown-icon" />
                          Sửa
                        </button>
                        <button 
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setClassToDelete(classItem);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FaTrash className="dropdown-icon" />
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="class-info">
                  <div className="class-details">
                    <span>Sĩ số: {classItem.siso}</span>
                  </div>
                  <div className="class-year">
                    Năm học: {classItem.namhoc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showModal || showEditModal) && (
        <div className="cm-modal-overlay">
          <div className="cm-modal-content">
            <div className="cm-modal-header">
              <h2>{showEditModal ? 'Sửa lớp học' : 'Tạo lớp học mới'}</h2>
              <button 
                className="cm-close-button"
                onClick={() => {
                  showEditModal ? setShowEditModal(false) : setShowModal(false);
                  setSelectedClass(null);
                }}
              >
                <IoClose />
              </button>
            </div>
            
            <form onSubmit={showEditModal ? handleUpdateClass : handleSubmit} className="cm-create-class-form">
              <div className="cm-form-group">
                <label htmlFor="tenlop">Tên lớp</label>
                <input
                  type="text"
                  id="tenlop"
                  value={classData.tenlop}
                  onChange={(e) => setClassData({...classData, tenlop: e.target.value})}
                  required
                />
              </div>

              <div className="cm-form-group">
                <label htmlFor="namhoc">Năm học</label>
                <select
                  id="namhoc"
                  value={classData.namhoc}
                  onChange={(e) => setClassData({...classData, namhoc: e.target.value})}
                  required
                >
                  {Array.from({ length: 7 }, (_, i) => {
                    const year = 2024 + i;
                    return (
                      <option key={year} value={`${year}-${year + 1}`}>
                        {year}-{year + 1}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="cm-modal-actions">
                <button type="button" className="cm-cancel-button" onClick={() => showEditModal ? setShowEditModal(false) : setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="cm-submit-button">
                  {showEditModal ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="cdm-modal-overlay">
          <div className="cdm-modal-content">
            <div className="cdm-modal-header">
              <h2>Xác nhận xóa</h2>
            </div>
            <div className="cdm-modal-body">
              <p>Bạn có chắc chắn muốn xóa lớp "{classToDelete.tenlop}"?</p>
            </div>
            <div className="cdm-modal-actions">
              <button className="cdm-cancel-button" onClick={() => setShowDeleteModal(false)}>
                Hủy
              </button>
              <button className="cdm-confirm-button" onClick={handleDeleteClass}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Class;