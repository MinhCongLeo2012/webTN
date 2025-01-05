import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ExamReview.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ExamReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [examData, setExamData] = useState({
    name: '',
    grade: 'L10',
    subject: 'AN',
    purpose: 'THUONG_XUYEN',
    questions: []
  });
  const [showAnswers, setShowAnswers] = useState(false);
  const [showPointModal, setShowPointModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState('');

  useEffect(() => {
    const fileContent = location.state?.fileContent?.data;
    const fileName = location.state?.fileName;
    if (fileContent) {
      setExamData(prev => ({
        ...prev,
        name: fileName || fileContent.title || '',
        questions: fileContent.questions.map(q => ({
          content: q.content,
          level: q.level || 'THONG_HIEU',
          points: 0,
          options: q.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect || false
          }))
        })) || [],
      }));
      setTotalQuestions(fileContent.questions?.length || 0);
    }
  }, [location.state]);

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = () => {
    navigate('/exam');
  };

  const handleLevelChange = (index, value) => {
    const newQuestions = [...examData.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      level: value
    };
    setExamData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const handleQuestionClick = (num) => {
    setCurrentQuestion(num);
  };

  const handlePrevPage = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleQuestionContentChange = (index, content) => {
    const newQuestions = [...examData.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      content: content
    };
    setExamData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, text) => {
    const newQuestions = [...examData.questions];
    newQuestions[questionIndex].options[optionIndex] = {
      ...newQuestions[questionIndex].options[optionIndex],
      text: text
    };
    setExamData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const newQuestions = [...examData.questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === optionIndex
    }));
    setExamData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const subjectOptions = [
    { value: 'AN', label: 'Âm nhạc' },
    { value: 'SINH', label: 'Sinh học' },
    { value: 'CN', label: 'Công nghệ' },
    { value: 'DIA', label: 'Địa lí' },
    { value: 'GDQPAN', label: 'Giáo dục quốc phòng và an ninh' },
    { value: 'GDTC', label: 'Giáo dục thể chất' },
    { value: 'GDKTPL', label: 'Giáo dục kinh tế và pháp luật' },
    { value: 'HOA', label: 'Hóa học' },
    { value: 'TIN', label: 'Tin học' },
    { value: 'SU', label: 'Lịch sử' },
    { value: 'MT', label: 'Mỹ thuật' },
    { value: 'NN1', label: 'Ngoại ngữ 1' },
    { value: 'NN2', label: 'Ngoại ngữ 2' },
    { value: 'VAN', label: 'Ngữ văn' },
    { value: 'TDTTS', label: 'Tiếng dân tộc thiểu số' },
    { value: 'TOAN', label: 'Toán' },
    { value: 'VLY', label: 'Vật lí' }
  ];

  const purposeOptions = [
    { value: 'THUONG_XUYEN', label: 'Đánh giá thường xuyên' },
    { value: 'DINH_KY', label: 'Đánh giá định kì' },
    { value: 'ON_TAP', label: 'Ôn tập' }
  ];

  const subjectMapping = {
    'AN': 'AN',
    'SINH': 'SINH',
    'CN': 'CN',
    'DIA': 'DIA',
    'GDQPAN': 'GDQPAN',
    'GDTC': 'GDTC',
    'GDKTPL': 'GDKTPL',
    'HOA': 'HOA',
    'TIN': 'TIN',
    'SU': 'SU',
    'MT': 'MT',
    'NN1': 'NN1',
    'NN2': 'NN2',
    'VAN': 'VAN',
    'TDTTS': 'TDTTS',
    'TOAN': 'TOAN',
    'VLY': 'VLY'
  };

  const handleDistributePoints = (total) => {
    if (!total || isNaN(total) || total <= 0) {
      toast.error('Vui lòng nhập tổng điểm hợp lệ');
      return;
    }

    const pointPerQuestion = (total / examData.questions.length).toFixed(2);
    const updatedQuestions = examData.questions.map(q => ({
      ...q,
      points: parseFloat(pointPerQuestion)
    }));

    setExamData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
    setShowPointModal(false);
    toast.success('Đã phân bổ điểm thành công!');
  };

  const PointDistributionModal = ({ show, onClose, onDistribute, totalPoints, setTotalPoints }) => {
    const [error, setError] = useState('');

    if (!show) return null;

    const handleInputChange = (e) => {
      const value = e.target.value;
      setError('');
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setTotalPoints(value);
      }
    };

    const handleDistribute = () => {
      if (!totalPoints || totalPoints.trim() === '') {
        setError('Vui lòng nhập tổng điểm');
        return;
      }

      const points = parseFloat(totalPoints);
      
      if (isNaN(points)) {
        setError('Vui lòng nhập số hợp lệ');
        return;
      }

      if (points <= 0) {
        setError('Vui lòng nhập điểm lớn hơn 0');
        return;
      }

      onDistribute(points);
    };

    return (
      <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
        <div className="point-distribution-modal">
          <h3 className="point-modal-title">Chia điểm nhanh</h3>
          <div className="point-modal-form">
            <div className="point-modal-input-group">
              <label>Tổng điểm</label>
              <input
                type="text"
                value={totalPoints}
                onChange={handleInputChange}
                className="point-modal-input"
                placeholder="Nhập tổng điểm"
                autoFocus
              />
            </div>
            {error && <div className="modal-error">{error}</div>}
          </div>
          <div className="point-modal-actions">
            <button 
              className="point-modal-btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
            <button 
              className="point-modal-btn-primary"
              onClick={handleDistribute}
            >
              Chia
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestion = (question, index) => {
    if (index + 1 !== currentQuestion) return null;
    
    return (
      <div key={index} className="review-question">
        <div className="review-question-header">
          <h4>Câu {index + 1}</h4>
          <div className="review-question-info">
            <div className="review-points-group">
              <label>Điểm:</label>
              <input
                type="number"
                value={question.points}
                onChange={(e) => handlePointsChange(index, e.target.value)}
                className="review-points-input"
                min="0"
                step="0.01"
              />
            </div>
            <div className="review-level-group">
              <label>Mức độ:</label>
              <select
                value={question.level}
                onChange={(e) => handleLevelChange(index, e.target.value)}
                className="review-level-select"
              >
                <option value="NHAN_BIET">Nhận biết</option>
                <option value="THONG_HIEU">Thông hiểu</option>
                <option value="VAN_DUNG">Vận dụng</option>
                <option value="VAN_DUNG_CAO">Vận dụng cao</option>
              </select>
            </div>
          </div>
        </div>

        <div className="review-question-content">
          <textarea
            value={question.content}
            onChange={(e) => handleQuestionContentChange(index, e.target.value)}
            className="review-question-textarea"
          />
        </div>

        <div className="review-options-list">
          {question.options.map((option, optIndex) => (
            <div key={optIndex} className={`review-option-item ${option.isCorrect ? 'is-correct' : ''}`}>
              <span className="review-option-label">
                {String.fromCharCode(65 + optIndex)}.
              </span>
              <div className="review-option-content">
                <textarea
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                  className="review-option-textarea"
                />
              </div>
              <button
                className={`review-correct-btn ${option.isCorrect ? 'active' : ''}`}
                onClick={() => handleCorrectAnswerChange(index, optIndex)}
              >
                Đáp án đúng
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSaveConfirm = async () => {
    try {
      // Validate required fields
      if (!examData.name?.trim()) {
        toast.error('Vui lòng nhập tên đề thi');
        return;
      }

      if (!examData.subject) {
        toast.error('Vui lòng chọn môn học');
        return;
      }

      // Chuyển đổi grade sang format L10, L11, L12
      const gradeMapping = {
        '10': 'L10',
        '11': 'L11',
        '12': 'L12'
      };

      // Chuyển đổi dữ liệu sang format API yêu cầu
      const examPayload = {
        tende: examData.name,
        monhoc: subjectMapping[examData.subject] || 'AN',
        mucdich: examData.purpose,
        khoi: gradeMapping[examData.grade] || 'L10',
        ghichu: '',
        questions: examData.questions.map(q => ({
          noidung: q.content,
          dap_an_a: q.options[0]?.text || '',
          dap_an_b: q.options[1]?.text || '',
          dap_an_c: q.options[2]?.text || '',
          dap_an_d: q.options[3]?.text || '',
          dapandung: (q.options.findIndex(opt => opt.isCorrect) + 1).toString(),
          diem: parseFloat(q.points) || 0,
          mucdo: q.level
        }))
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exam/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(examPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi lưu đề thi');
      }

      toast.success('Lưu đề thi thành công!');
      setShowSaveModal(false);
      navigate('/exam');

    } catch (error) {
      console.error('Error saving exam:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi lưu đề thi');
    }
  };

  const handlePointsChange = (index, value) => {
    const newQuestions = [...examData.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      points: value === '' ? '' : parseFloat(value) || 0
    };
    setExamData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  return (
    <div className="review-container">
      <div className="review-header">
        <div className="review-header-actions">
          <button className="review-btn-secondary" onClick={() => setShowPointModal(true)}>
            Chia điểm
          </button>
          <button className="review-btn-secondary" onClick={() => setShowCancelModal(true)}>
            Hủy
          </button>
          <button className="review-btn-primary" onClick={() => setShowSaveModal(true)}>
            Lưu
          </button>
        </div>
      </div>

      <div className="review-content">
        <div className="review-sidebar">
          <h3 className="review-sidebar-title">Mục lục câu hỏi</h3>
          <div className="question-index-grid">
            {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`question-index-item ${num === currentQuestion ? 'selected' : ''}`}
                onClick={() => handleQuestionClick(num)}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="question-nav">
            <button 
              className="question-nav-btn"
              onClick={handlePrevPage}
              disabled={currentQuestion === 1}
            >
              <span>←</span> Trước
            </button>
            <button 
              className="question-nav-btn"
              onClick={handleNextPage}
              disabled={currentQuestion === totalQuestions}
            >
              Sau <span>→</span>
            </button>
          </div>
        </div>

        <div className="review-main">
          <h3 className="review-main-title">Nội dung đề thi</h3>
          <div className="review-questions-list">
            {examData.questions.map((question, index) => 
              renderQuestion(question, index)
            )}
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Lưu đề thi</h2>
            
            <div className="modal-form-group">
              <label>Tên đề thi</label>
              <input
                type="text"
                value={examData.name}
                onChange={(e) => setExamData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nhập tên đề thi"
                className="modal-input"
              />
            </div>

            <div className="modal-form-row">
              <div className="modal-form-group">
                <label>Khối lớp</label>
                <select 
                  className="modal-select"
                  value={examData.grade}
                  onChange={(e) => setExamData(prev => ({ ...prev, grade: e.target.value }))}
                >
                  <option value="10">Lớp 10</option>
                  <option value="11">Lớp 11</option>
                  <option value="12">Lớp 12</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label>Môn học</label>
                <select
                  className="modal-select"
                  value={examData.subject}
                  onChange={(e) => setExamData(prev => ({ ...prev, subject: e.target.value }))}
                >
                  {subjectOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-form-group">
              <label>Mục đích tạo đề</label>
              <select
                className="modal-select"
                value={examData.purpose}
                onChange={(e) => setExamData(prev => ({ ...prev, purpose: e.target.value }))}
              >
                {purposeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button 
                className="modal-btn-secondary"
                onClick={() => setShowSaveModal(false)}
              >
                Hủy
              </button>
              <button 
                className="modal-btn-primary"
                onClick={handleSaveConfirm}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="modal-overlay">
          <div className="cancel-modal-content">
            <h2 className="cancel-modal-title">Xác nhận hủy</h2>
            
            <p className="cancel-modal-message">
              Bạn có chắc chắn muốn hủy kết quả?
            </p>

            <div className="cancel-modal-actions">
              <button 
                className="cancel-modal-btn cancel-modal-btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Đóng
              </button>
              <button 
                className="cancel-modal-btn cancel-modal-btn-primary"
                onClick={handleCancelConfirm}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <PointDistributionModal
        show={showPointModal}
        onClose={() => setShowPointModal(false)}
        onDistribute={handleDistributePoints}
        totalPoints={totalPoints}
        setTotalPoints={setTotalPoints}
      />
    </div>
  );
}

export default ExamReview; 