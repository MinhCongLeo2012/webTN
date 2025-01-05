import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineSearch } from 'react-icons/hi';
import { FaPlus } from 'react-icons/fa';
import { RiFileUploadLine, RiEditLine, RiShareForwardLine, RiFileExcelLine } from 'react-icons/ri';
import { IoClose } from 'react-icons/io5';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { MdEdit, MdDelete } from 'react-icons/md';
import '../../components/Ground/Ground.css';
import './Exam.css';
import { toast } from 'react-toastify';
import Select from 'react-select';
import examService from '../../services/exam.service';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import * as XLSX from 'xlsx';

function Exam() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [exams, setExams] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, examId: null });
  const [selectedExams, setSelectedExams] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const subjects = [
    { value: 'literature', label: 'Ngữ văn' },
    { value: 'math', label: 'Toán' },
    { value: 'physics', label: 'Vật lí' },
    { value: 'chemistry', label: 'Hóa học' },
    { value: 'biology', label: 'Sinh học' },
    { value: 'history', label: 'Lịch sử' },
    { value: 'geography', label: 'Địa lí' },
    { value: 'technology', label: 'Công nghệ' },
    { value: 'informatics', label: 'Tin học' },
    { value: 'music', label: 'Âm nhạc' },
    { value: 'fine-art', label: 'Mỹ thuật' },
    { value: 'physical-education', label: 'Giáo dục thể chất' },
    { value: 'defense-education', label: 'Giáo dục quốc phòng và an ninh' },
    { value: 'economics-law', label: 'Giáo dục kinh tế và pháp luật' },
    { value: 'foreign-language-1', label: 'Ngoại ngữ 1' },
    { value: 'foreign-language-2', label: 'Ngoại ngữ 2' },
    { value: 'ethnic-language', label: 'Tiếng dân tộc thiểu số' }
  ];

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/exam`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Fetched exams:', response.data);

        if (response.data.success) {
          const formattedExams = response.data.data.map(exam => ({
            iddethi: exam.iddethi,
            tende: exam.tende,
            tongsocau: exam.tongsocau,
            ngaytao: exam.ngaytao,
            idmonhoc: exam.idmonhoc,
            idmucdich: exam.idmucdich,
            idkhoi: exam.idkhoi,
            questions: exam.questions || [],
            teacher_name: exam.teacher_name
          }));
          
          setExams(formattedExams);
        } else {
          setError('Không thể tải danh sách đề thi');
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
        setError('Lỗi khi tải danh sách đề thi');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [navigate]);

  const handleSearch = async () => {
    try {
      let url = '/api/exam/search?';
      if (searchTerm) url += `search=${searchTerm}&`;
      if (selectedGrade) url += `grade=${selectedGrade}&`;
      if (selectedType) url += `type=${selectedType}&`;
      if (selectedSubject) url += `subject=${selectedSubject}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tìm kiếm đề thi');
      }

      const data = await response.json();
      setExams(data.data);
    } catch (error) {
      console.error('Error searching exams:', error);
      toast.error('Không thể tìm kiếm đề thi');
    }
  };

  const handleCreateOption = (option) => {
    setShowCreateModal(false);
    if (option === 'upload') {
      navigate('/exam/upload');
    } else if (option === 'manual') {
      navigate('/exam/create');
    }
  };

  // Thêm useEffect để xử lý click bên ngoài context menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu.show) {
        setContextMenu({ show: false, x: 0, y: 0, examId: null });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.show]);

  const handleContextMenu = (e, examId) => {
    e.preventDefault();
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
    setContextMenu({
      show: true,
      x: e.pageX,
      y: e.pageY,
      examId
    });
  };

  const handleEdit = (exam) => {
    console.log('Editing exam:', exam);
    if (exam) {
      setSelectedExam(exam);
      setShowEditModal(true);
      setContextMenu({ show: false, x: 0, y: 0, examId: null });
    } else {
      console.error('No exam provided to handleEdit');
    }
  };

  const handleDelete = (exam) => {
    if (!exam || !exam.iddethi) {
      console.error('Invalid exam object:', exam);
      toast.error('Không thể xóa đề thi: Thiếu thông tin');
      return;
    }
    console.log('Handling delete for exam:', exam);
    setExamToDelete(exam);
    setShowDeleteModal(true);
    setContextMenu({ show: false, x: 0, y: 0, examId: null });
  };

  const handleConfirmDelete = async () => {
    if (!examToDelete || !examToDelete.iddethi) {
      console.error('Invalid examToDelete:', examToDelete);
      toast.error('Không thể xóa đề thi: Thiếu thông tin');
      return;
    }
    
    console.log('Confirming delete for exam:', examToDelete);
    try {
      console.log('Sending delete request for exam ID:', examToDelete.iddethi);
      const result = await examService.deleteExam(examToDelete.iddethi);
      console.log('Delete result:', result);
      
      setExams(prevExams => prevExams.filter(exam => exam.iddethi !== examToDelete.iddethi));
      setShowDeleteModal(false);
      toast.success('Xóa đề thi thành công!');
    } catch (error) {
      console.error('Detailed delete error:', error);
      toast.error(error.message || 'Không thể xóa đề thi');
    }
  };

  const handleSaveEdit = async (editedExam) => {
    try {
      if (!editedExam.tende?.trim()) {
        toast.error('Vui lòng nhập tên đề thi');
        return;
      }

      if (!editedExam.idmucdich) {
        toast.error('Vui lòng chọn mục đích tạo đề');
        return;
      }

      await examService.updateExam(editedExam);
      
      setExams(prevExams => 
        prevExams.map(exam => 
          exam.iddethi === editedExam.iddethi ? editedExam : exam
        )
      );
      
      setShowEditModal(false);
      toast.success('Cập nhật đề thi thành công!');
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error(error.message || 'Không thể cập nhật đề thi');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedExams(exams.map(exam => exam.iddethi));
    } else {
      setSelectedExams([]);
    }
  };

  const handleSelectExam = (examId) => {
    setSelectedExams(prev => {
      if (prev.includes(examId)) {
        return prev.filter(id => id !== examId);
      } else {
        return [...prev, examId];
      }
    });
  };

  const handleDeleteSelected = () => {
    const examsToDelete = exams.filter(exam => selectedExams.includes(exam.iddethi));
    if (examsToDelete.length === 0) {
      toast.error('Không có đề thi nào được chọn');
      return;
    }
    console.log('Exams to delete:', examsToDelete);
    setExamToDelete(examsToDelete);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteSelected = async () => {
    if (!Array.isArray(examToDelete) || examToDelete.length === 0) {
      console.error('Invalid examToDelete array:', examToDelete);
      toast.error('Không thể xóa đề thi: Thiếu thông tin');
      return;
    }

    try {
      // Xóa từng đề thi một và đợi tất cả hoàn thành
      const deletePromises = examToDelete.map(exam => 
        examService.deleteExam(exam.iddethi)
      );

      await Promise.all(deletePromises);

      // Cập nhật state để loại bỏ các đề thi đã xóa
      setExams(prevExams => 
        prevExams.filter(exam => 
          !examToDelete.some(deletedExam => deletedExam.iddethi === exam.iddethi)
        )
      );

      // Reset states
      setSelectedExams([]);
      setShowDeleteModal(false);
      toast.success('Xóa đề thi thành công!');
    } catch (error) {
      console.error('Error deleting multiple exams:', error);
      toast.error(error.message || 'Không thể xóa đề thi');
    }
  };

  // Thêm các hàm helper để chuyển đổi dữ liệu
  const getSubjectName = (idmonhoc) => {
    const subjects = {
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
    return subjects[idmonhoc] || idmonhoc;
  };

  const getKhoiName = (idkhoi) => {
    const khoi = {
      'L10': 'Lớp 10',
      'L11': 'Lớp 11', 
      'L12': 'Lớp 12'
    };
    return khoi[idkhoi] || idkhoi;
  };

  const getMucDichLabel = (idmucdich) => {
    const mucdich = {
      'THUONG_XUYEN': 'Đánh giá thường xuyên',
      'DINH_KY': 'Đánh giá định kỳ',
      'ON_TAP': 'Ôn tập'
    };
    return mucdich[idmucdich] || idmucdich;
  };

  const handleAssignExams = () => {
    const selectedExamDetails = exams.filter(exam => selectedExams.includes(exam.iddethi));
    navigate('/exam/assign', { state: { selectedExams: selectedExamDetails } });
  };

  const handleExportMatrix = async (exam) => {
    try {
      // Kiểm tra xem có questions và mức độ không
      if (!exam.questions || !Array.isArray(exam.questions)) {
        throw new Error('Không có dữ liệu câu hỏi');
      }

      console.log('Questions data:', exam.questions); // Debug log

      // Tính toán số câu hỏi cho từng mức độ
      const levelCounts = {
        'NHAN_BIET': 0,
        'THONG_HIEU': 0,
        'VAN_DUNG': 0,
        'VAN_DUNG_CAO': 0
      };

      exam.questions.forEach(question => {
        // Kiểm tra và log từng câu hỏi
        console.log('Processing question:', question); // Debug log
        
        // Sử dụng trực tiếp mức độ từ dữ liệu câu hỏi
        if (question.mucdo && levelCounts.hasOwnProperty(question.mucdo)) {
          levelCounts[question.mucdo]++;
        } else {
          console.warn('Invalid or missing mucdo for question:', question); // Debug log
        }
      });

      console.log('Level counts:', levelCounts); // Debug log

      // Tính tổng số câu
      const totalQuestions = Object.values(levelCounts).reduce((a, b) => a + b, 0);

      // Kiểm tra nếu tổng số câu không khớp
      if (totalQuestions !== exam.tongsocau) {
        console.warn(`Mismatch in question count: ${totalQuestions} vs ${exam.tongsocau}`);
      }

      // Tạo dữ liệu cho file Excel
      const data = [
        ['THÔNG TIN ĐỀ THI'],
        ['Tên đề thi:', exam.tende],
        ['Môn học:', getSubjectName(exam.idmonhoc)],
        ['Khối:', getKhoiName(exam.idkhoi)],
        ['Mục đích:', getMucDichLabel(exam.idmucdich)],
        [],
        ['MA TRẬN ĐỀ THI'],
        ['Tổng số câu', 'Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'],
        [
          exam.tongsocau,
          levelCounts['NHAN_BIET'],
          levelCounts['THONG_HIEU'],
          levelCounts['VAN_DUNG'],
          levelCounts['VAN_DUNG_CAO']
        ],
        ['Tỉ lệ %', 
          `${((levelCounts['NHAN_BIET'] / exam.tongsocau) * 100).toFixed(1)}%`,
          `${((levelCounts['THONG_HIEU'] / exam.tongsocau) * 100).toFixed(1)}%`,
          `${((levelCounts['VAN_DUNG'] / exam.tongsocau) * 100).toFixed(1)}%`,
          `${((levelCounts['VAN_DUNG_CAO'] / exam.tongsocau) * 100).toFixed(1)}%`
        ]
      ];

      // Tạo workbook mới
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(data);

      // Thiết lập style cho worksheet
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Merge dòng tiêu đề thông tin
        { s: { r: 6, c: 0 }, e: { r: 6, c: 4 } }, // Merge dòng tiêu đề ma trận
      ];

      // Thiết lập độ rộng cột
      ws['!cols'] = [
        { wch: 15 }, // A
        { wch: 15 }, // B
        { wch: 15 }, // C
        { wch: 15 }, // D
        { wch: 15 }, // E
      ];

      // Tạo style cho các ô
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          const cellRef = XLSX.utils.encode_cell({ r: i, c: j });
          if (!ws[cellRef]) ws[cellRef] = {};
          
          // Style mặc định cho tất cả các ô
          ws[cellRef].s = {
            font: { name: "Arial" },
            alignment: { vertical: "center", horizontal: "center", wrapText: true },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } }
            }
          };

          // Style đặc biệt cho tiêu đề
          if (i === 0 || i === 6) {
            ws[cellRef].s = {
              font: { name: "Arial", bold: true, sz: 14 },
              alignment: { vertical: "center", horizontal: "center", wrapText: true },
              fill: { fgColor: { rgb: "FFFF00" }, patternType: "solid" },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
              }
            };
          }

          // Style cho header của bảng ma trận
          if (i === 7) {
            ws[cellRef].s = {
              font: { name: "Arial", bold: true },
              alignment: { vertical: "center", horizontal: "center", wrapText: true },
              fill: { fgColor: { rgb: "E6E6E6" }, patternType: "solid" },
              border: {
                top: { style: "medium", color: { rgb: "000000" } },
                bottom: { style: "medium", color: { rgb: "000000" } },
                left: { style: "medium", color: { rgb: "000000" } },
                right: { style: "medium", color: { rgb: "000000" } }
              }
            };
          }

          // Style cho các label
          if (i > 0 && i < 5 && j === 0) {
            ws[cellRef].s = {
              font: { name: "Arial", bold: true },
              alignment: { vertical: "center", horizontal: "left", wrapText: true },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
              }
            };
          }

          // Style cho các giá trị thông tin
          if (i > 0 && i < 5 && j === 1) {
            ws[cellRef].s = {
              font: { name: "Arial" },
              alignment: { vertical: "center", horizontal: "left", wrapText: true },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
              }
            };
          }

          // Style cho dòng số liệu và tỉ lệ
          if (i === 8 || i === 9) {
            ws[cellRef].s = {
              font: { name: "Arial" },
              alignment: { vertical: "center", horizontal: "center", wrapText: true },
              border: {
                top: { style: "medium", color: { rgb: "000000" } },
                bottom: { style: "medium", color: { rgb: "000000" } },
                left: { style: "medium", color: { rgb: "000000" } },
                right: { style: "medium", color: { rgb: "000000" } }
              }
            };
          }
        }
      }

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Ma trận đề thi');

      // Xuất file
      XLSX.writeFile(wb, `Matran_${exam.tende || 'dethi'}.xlsx`);
    } catch (error) {
      console.error('Error exporting matrix:', error);
      toast.error('Không thể xuất ma trận đề thi');
    }
  };

  return (
    <div className="exam-page">
      <div className="exam-controls">
        <div className="search-container">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Tìm kiếm đề thi..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!e.target.value) {
                  handleSearch();
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <HiOutlineSearch 
              className="search-icon" 
              onClick={handleSearch}
              style={{ cursor: 'pointer' }}
            />
          </div>
          
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả môn học</option>
            {subjects.map(subject => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
          
          <select 
            className="filter-select"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            <option value="">Tất cả các lớp</option>
            <option value="10">Lớp 10</option>
            <option value="11">Lớp 11</option>
            <option value="12">Lớp 12</option>
          </select>
          
          <select 
            className="filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">Mục đích tạo đề</option>
            <option value="THUONG_XUYEN">Đánh giá thường xuyên</option>
            <option value="DINH_KY">Đánh giá định kì</option>
            <option value="ON_TAP">Ôn tập</option>
          </select>
        </div>
        <div className="button-group">
          <button 
            className="add-exam-button"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus className="icon-control" />
            Tạo đề thi
          </button>
        </div>
      </div>

      {/* Modal tạo đề thi */}
      {showCreateModal && (
        <div className="exam-create-modal-overlay">
          <div className="exam-create-modal">
            <div className="exam-modal-header">
              <h2>Tạo đề thi mới</h2>
              <button 
                className="exam-modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                <IoClose />
              </button>
            </div>
            
            <div className="exam-create-options">
              <div 
                className="create-option"
                onClick={() => handleCreateOption('upload')}
              >
                <div className="option-icon">
                  <RiFileUploadLine size={48} />
                </div>
                <div className="option-content">
                  <h3>Tải lên đề thi</h3>
                  <p>Tạo đề thi nhanh bằng cách tải lên file</p>
                </div>
              </div>

              <div 
                className="create-option"
                onClick={() => handleCreateOption('manual')}
              >
                <div className="option-icon">
                  <RiEditLine size={48} />
                </div>
                <div className="option-content">
                  <h3>Soạn đề thủ công</h3>
                  <p>Tạo đề thi từ đầu và chỉnh sửa thủ công</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="list-header">
        <h2>Danh sách đề thi</h2>
        <div className="list-actions">
          {selectedExams.length > 0 && (
            <>
              {selectedExams.length === 1 && (
                <>
                  <button 
                    className="export-matrix-button"
                    onClick={() => handleExportMatrix(exams.find(e => e.iddethi === selectedExams[0]))}
                  >
                    <RiFileExcelLine className="icon-control" />
                    Xuất ma trận
                  </button>
                  <button 
                    className="assign-exam-button"
                    onClick={handleAssignExams}
                  >
                    <RiShareForwardLine className="icon-control" />
                    Giao đề
                  </button>
                </>
              )}
              <button 
                className="delete-selected-button"
                onClick={handleDeleteSelected}
              >
                <MdDelete className="icon-control" />
                Xóa ({selectedExams.length})
              </button>
            </>
          )}
        </div>
      </div>

      <div className="exam-list-main">
        <div className="exam-table-container">
          <table className="exam-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input 
                    type="checkbox"
                    checked={selectedExams.length > 0 && selectedExams.length === exams.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="file-icon-column"></th>
                <th className="name-column">Tên đề thi</th>
                <th className="subject-column">Môn học</th>
                <th className="class-column">Lớp</th>
                <th className="type-column">Mục đích tạo đề</th>
                <th className="date-column">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam.iddethi} onContextMenu={(e) => handleContextMenu(e, exam.iddethi)}>
                  <td className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={selectedExams.includes(exam.iddethi)}
                      onChange={() => handleSelectExam(exam.iddethi)}
                    />
                  </td>
                  <td className="file-icon-column">
                    <RiFileUploadLine className="file-icon" />
                  </td>
                  <td className="title-column">
                    {exam.tende || 'Chưa có tên'}
                  </td>
                  <td className="subject-column">
                    {getSubjectName(exam.idmonhoc) || 'Chưa có môn học'}
                  </td>
                  <td className="grade-column">
                    {getKhoiName(exam.idkhoi) || 'Chưa có khối'}
                  </td>
                  <td className="type-column">
                    <span className={`type-badge ${exam.idmucdich?.toLowerCase()}`}>
                      {getMucDichLabel(exam.idmucdich) || 'Chưa có mục đích'}
                    </span>
                  </td>
                  <td className="date-column">
                    {exam.ngaytao ? new Date(exam.ngaytao).toLocaleDateString('vi-VN') : 'Chưa có ngày tạo'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div 
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div 
            className="context-menu-item"
            onClick={() => {
              const examToEdit = exams.find(e => e.iddethi === contextMenu.examId);
              console.log('Found exam to edit:', examToEdit);
              if (examToEdit) {
                handleEdit(examToEdit);
              } else {
                console.error('Could not find exam with id:', contextMenu.examId);
              }
            }}
          >
            <MdEdit /> Chỉnh sửa
          </div>
          <div 
            className="context-menu-item delete"
            onClick={() => {
              const examToDelete = exams.find(e => e.iddethi === contextMenu.examId);
              console.log('Found exam to delete:', examToDelete);
              if (examToDelete) {
                handleDelete(examToDelete);
              } else {
                console.error('Could not find exam with id:', contextMenu.examId);
              }
            }}
          >
            <MdDelete /> Xóa
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa */}
      {showEditModal && selectedExam && (
        <div className="exam-modal-overlay">
          <div className="exam-modal">
            <div className="exam-modal-header">
              <h2>Chỉnh sửa đề thi</h2>
              <button 
                className="exam-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <IoClose />
              </button>
            </div>
            <div className="exam-modal-content">
              <div className="exam-form-group">
                <label>Tên đề thi</label>
                <input 
                  type="text"
                  value={selectedExam?.tende || ''}
                  onChange={(e) => setSelectedExam({
                    ...selectedExam,
                    tende: e.target.value
                  })}
                />
              </div>

              <div className="exam-form-group">
                <label>Mục đích tạo đề</label>
                <select
                  className="modal-select"
                  value={selectedExam?.idmucdich || ''}
                  onChange={(e) => setSelectedExam({
                    ...selectedExam,
                    idmucdich: e.target.value
                  })}
                >
                  <option value="THUONG_XUYEN">Đánh giá thường xuyên</option>
                  <option value="DINH_KY">Đánh giá định kì</option>
                  <option value="ON_TAP">Ôn tập</option>
                </select>
              </div>
            </div>
            
            <div className="exam-modal-actions">
              <button 
                className="exam-modal-cancel"
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </button>
              <button 
                className="exam-modal-save"
                onClick={() => handleSaveEdit(selectedExam)}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal">
            <div className="exam-modal-header">
              <h2>Xác nhận xóa</h2>
              <button 
                className="exam-modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <IoClose />
              </button>
            </div>
            <div className="exam-modal-content">
              {Array.isArray(examToDelete) ? (
                <p>Bạn có chắc chắn muốn xóa {examToDelete.length} đề thi đã chọn?</p>
              ) : (
                <p>Bạn có chắc chắn muốn xóa đề thi "{examToDelete?.tende}" không?</p>
              )}
            </div>
            <div className="exam-modal-actions">
              <button 
                className="exam-modal-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
              <button 
                className="exam-modal-confirm"
                onClick={Array.isArray(examToDelete) ? handleConfirmDeleteSelected : handleConfirmDelete}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Exam; 