import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoAdd, IoClose, IoShuffle, IoSwapHorizontal } from 'react-icons/io5';
import './ExamCreate.css';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const levelOptions = [
  { value: 'NHAN_BIET', label: 'Nhận biết' },
  { value: 'THONG_HIEU', label: 'Thông hiểu' },
  { value: 'VAN_DUNG', label: 'Vận dụng' },
  { value: 'VAN_DUNG_CAO', label: 'Vận dụng cao' }
];

const subjectMapping = {
  'TOAN': 'TOAN',
  'VLY': 'VLY',
  'HOA': 'HOA',
  'SINH': 'SINH',
  'MT': 'MT',
  'TIN': 'TIN',
  'VAN': 'VAN',
  'NN1': 'NN1',
  'NN2': 'NN2', 
  'SU': 'SU',
  'DIA': 'DIA',
  'CN': 'CN',
  'GDTC': 'GDTC',
  'AN': 'AN',
  'GDQPAN': 'GDQPAN',
  'GDKTPL': 'GDKTPL',
  'TDTTS': 'TDTTS'
};

// Thêm constant cho mapping giữa display text và database value
const TYPE_MAPPING = {
  'Đánh giá định kì': 'DINH_KY',
  'Ôn tập': 'ON_TAP', 
  'Đánh giá thường xuyên': 'THUONG_XUYEN'
};

export default function ExamCreate() {
  const navigate = useNavigate();
  const [examData, setExamData] = useState({
    tende: '',
    subject: 'TOAN',
    grade: '10',
    type: 'THUONG_XUYEN',
    note: '',
    questions: []
  });

  const [showPointModal, setShowPointModal] = useState(false);
  const [totalPoints, setTotalPoints] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasDistributedPoints, setHasDistributedPoints] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [gradeMapping] = useState({
    '10': 'L10',
    '11': 'L11', 
    '12': 'L12'
  });

  const addQuestion = () => {
    setExamData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        id: prev.questions.length + 1,
        question: '',
        level: 'NHAN_BIET',
        points: 0,
        options: [
          { id: 1, text: '', isCorrect: false },
          { id: 2, text: '', isCorrect: false },
          { id: 3, text: '', isCorrect: false },
          { id: 4, text: '', isCorrect: false }
        ]
      }]
    }));
  };

  const handleQuestionChange = (questionId, value) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, question: value } : q
      )
    }));
  };

  const handleOptionChange = (questionId, optionId, value) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? {
          ...q,
          options: q.options.map(o => 
            o.id === optionId ? { ...o, text: value } : o
          )
        } : q
      )
    }));
  };

  const handleCorrectAnswer = (questionId, optionId) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? {
          ...q,
          options: q.options.map(o => ({
            ...o,
            isCorrect: o.id === optionId
          }))
        } : q
      )
    }));
  };

  const handleLevelChange = (questionId, value) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, level: value } : q
      )
    }));
  };

  const removeQuestion = (questionId) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handlePointsChange = (questionId, value) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, points: value === '' ? '' : parseFloat(value) || 0 } : q
      )
    }));
  };

  const handleSaveExam = async () => {
    const validPurposes = ['DINH_KY', 'ON_TAP', 'THUONG_XUYEN'];
    
    if (!validPurposes.includes(examData.type)) {
      toast.error('Mục đích không hợp lệ. Vui lòng chọn: Đánh giá định kì, Ôn tập hoặc Đánh giá thường xuyên');
      return;
    }
    
    try {
      // Validate required fields
      if (!examData.tende?.trim()) {
        toast.error('Vui lòng nhập tên đề thi');
        return;
      }

      if (!examData.subject) {
        toast.error('Vui lòng chọn môn học');
        return;
      }

      if (!examData.grade) {
        toast.error('Vui lòng chọn khối lớp');
        return;
      }

      // Kiểm tra số lượng câu hỏi
      if (!examData.questions || examData.questions.length === 0) {
        toast.error('Vui lòng thêm ít nhất một câu hỏi');
        return;
      }

      // Validate nội dung và đáp án của từng câu hỏi
      for (let i = 0; i < examData.questions.length; i++) {
        const question = examData.questions[i];
        
        if (!question.question?.trim()) {
          toast.error(`Vui lòng nhập nội dung cho câu hỏi ${i + 1}`);
          return;
        }

        // Kiểm tra số lượng đáp án (tối thiểu 2)
        if (question.options.length < 2) {
          toast.error(`Vui lòng thêm ít nhất 2 đáp án cho câu hỏi ${i + 1}`);
          return;
        }

        // Kiểm tra nội dung đáp án
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].text?.trim()) {
            toast.error(`Vui lòng nhập nội dung cho đáp án ${j + 1} của câu hỏi ${i + 1}`);
            return;
          }
        }

        // Kiểm tra đáp án đúng
        if (!question.options.some(opt => opt.isCorrect)) {
          toast.error(`Vui lòng chọn đáp án đúng cho câu hỏi ${i + 1}`);
          return;
        }
      }

      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);

      console.log('Current type:', examData.type);

      const examPayload = {
        tende: examData.tende,
        iduser: user.id,
        tongsocau: examData.questions.length,
        ghichu: examData.note || '',
        khoi: `L${examData.grade}`,
        monhoc: examData.subject,
        mucdich: examData.type,
        questions: examData.questions.map(q => ({
          noidung: q.question,
          dap_an_a: q.options[0]?.text || '',
          dap_an_b: q.options[1]?.text || '',
          dap_an_c: q.options[2]?.text || '',
          dap_an_d: q.options[3]?.text || '',
          dapandung: (q.options.findIndex(opt => opt.isCorrect) + 1).toString(),
          diem: parseFloat(q.points) || 0,
          mucdo: q.level
        }))
      };

      console.log('Sending exam payload:', examPayload);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exam/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(examPayload)
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Có lỗi xảy ra khi lưu đề thi');
        } else {
          throw new Error('Lỗi server: ' + response.status);
        }
      }

      const data = await response.json();
      toast.success('Tạo đề thi thành công!');
      navigate('/exam');
    } catch (error) {
      console.error('Error saving exam:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo đề thi');
    }
  };

  const handleDistributePoints = () => {
    const points = parseFloat(totalPoints);
    
    if (!points || points <= 0) {
      toast.error('Vui lòng nhập tổng điểm hợp lệ');
      return;
    }

    const questionCount = examData.questions.length;
    if (questionCount === 0) {
      toast.error('Vui lòng thêm câu hỏi trước khi phân phối điểm');
      return;
    }

    const pointPerQuestion = (points / questionCount).toFixed(2);
    
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => ({
        ...q,
        points: pointPerQuestion
      }))
    }));

    setShowPointModal(false);
    toast.success('Đã phân phối điểm thành công!');
  };

  const randomizeQuestions = () => {
    setExamData(prev => ({
      ...prev,
      questions: [...prev.questions].sort(() => Math.random() - 0.5)
    }));
  };

  const swapQuestions = (index1, index2) => {
    setExamData(prev => {
      const newQuestions = [...prev.questions];
      [newQuestions[index1], newQuestions[index2]] = [newQuestions[index2], newQuestions[index1]];
      return {
        ...prev,
        questions: newQuestions
      };
    });
  };

  const handleSwapSelect = (index) => {
    if (selectedQuestionIndex === null) {
      setSelectedQuestionIndex(index);
    } else {
      swapQuestions(selectedQuestionIndex, index);
      setSelectedQuestionIndex(null);
    }
  };

  const PointDistributionModal = ({ show, onClose, onDistribute, totalPoints, setTotalPoints, questionCount }) => {
    const [error, setError] = useState('');

    if (!show) return null;

    const handleInputChange = (e) => {
      const value = e.target.value;
      setError(''); // Reset error khi người dùng nhập
      
      // Cho phép input trống hoặc số
      if (value === '' || /^\d*$/.test(value)) {
        setTotalPoints(value);
        e.target.focus();
      }
    };

    const handleDistribute = () => {
      if (!totalPoints || parseInt(totalPoints) <= 0) {
        setError('Vui lòng nhập điểm lớn hơn 0');
        return;
      }
      onDistribute();
    };

    return (
      <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <h3 className="modal-title">Chia điểm nhanh</h3>
          <div className="modal-body">
            <span className="modal-text">Tổng điểm trắc nghiệm ({questionCount} Câu)</span>
            <div className="modal-input-wrapper">
              <input
                type="text"
                value={totalPoints}
                onChange={handleInputChange}
                className="modal-input"
                autoFocus
              />
              {error && <div className="modal-error">{error}</div>}
            </div>
          </div>
          <div className="modal-footer">
            <button className="modal-close-btn" onClick={onClose}>
              Đóng
            </button>
            <button className="modal-distribute-btn" onClick={handleDistribute}>
              Chia
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmModal = ({ show, onClose, onConfirm }) => {
    if (!show) return null;

    return (
      <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content confirm-modal">
          <h3 className="modal-title">Xác nhận</h3>
          <div>
            <p className="confirm-message">Xác nhận hủy nội dung bạn đang soạn thảo ?</p>
          </div>
          <div className="modal-footer">
            <button className="modal-close-btn" onClick={onClose}>
              Đóng
            </button>
            <button className="modal-confirm-btn" onClick={onConfirm}>
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Sửa lại cấu hình modules đơn giản
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'align': [] }],  // Sử dụng align mặc định
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }]
    ]
  };

  // Thm formats để đảm bảo các chức năng hoạt động
  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list',
    'align',  // Thêm align vào formats
    'script',
    'blockquote', 'code-block'
  ];

  const handleLeavePage = () => {
    setShowConfirmModal(true);
  };

  const addOption = (questionId) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [
              ...q.options,
              {
                id: q.options.length + 1,
                text: '',
                isCorrect: false
              }
            ]
          };
        }
        return q;
      })
    }));
  };

  const removeOption = (questionId, optionId) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          // Không cho phép xóa nếu chỉ còn 2 đáp án
          if (q.options.length <= 2) {
            toast.warning('Câu hỏi phải có ít nhất 2 đáp án!');
            return q;
          }
          return {
            ...q,
            options: q.options.filter(o => o.id !== optionId)
          };
        }
        return q;
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate các trường bắt buộc
    const errors = {};
    
    if (!examData.tende?.trim()) {
      errors.tende = 'Vui lòng nhập tên đề thi';
    }

    if (!examData.idmonhoc) {
      errors.idmonhoc = 'Vui lòng chọn môn học';
    }

    if (!examData.idkhoi) {
      errors.idkhoi = 'Vui lòng chọn lớp';
    }

    if (!examData.idmucdich) {
      errors.idmucdich = 'Vui lòng chọn mục đích tạo đề';
    }

    // Validate câu hỏi
    if (!examData.questions || examData.questions.length === 0) {
      errors.questions = 'Vui lòng thêm ít nhất một câu hỏi';
    } else {
      examData.questions.forEach((question, index) => {
        if (!question.noidung?.trim()) {
          errors[`question_${index}_noidung`] = 'Vui lòng nhập nội dung câu hỏi';
        }
        if (!question.dap_an_a?.trim()) {
          errors[`question_${index}_dap_an_a`] = 'Vui lòng nhập đáp án A';
        }
        if (!question.dap_an_b?.trim()) {
          errors[`question_${index}_dap_an_b`] = 'Vui lòng nhập đáp án B';
        }
        if (!question.dap_an_c?.trim()) {
          errors[`question_${index}_dap_an_c`] = 'Vui lòng nhập đáp án C';
        }
        if (!question.dap_an_d?.trim()) {
          errors[`question_${index}_dap_an_d`] = 'Vui lòng nhập đáp án D';
        }
        if (!question.dapandung) {
          errors[`question_${index}_dapandung`] = 'Vui lòng chọn đáp án đúng';
        }
        if (!question.diem || question.diem <= 0) {
          errors[`question_${index}_diem`] = 'Vui lòng nhập điểm số hợp lệ';
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      await examService.createExam(examData);
      toast.success('Tạo đề thi thành công!');
      navigate('/exams');
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi tạo đề thi');
    }
  };

  const handleChange = (field, value) => {
    setExamData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const editorRef = useRef(null);

  return (
    <div className="create-container">
      <div className="create-header">
        <div className="create-header-actions">
          <button 
            className="create-cancel-btn" 
            onClick={handleLeavePage}
          >
            Hủy
          </button>
          <button 
            className="create-save-btn"
            onClick={handleSaveExam}
          >
            Lưu
          </button>
        </div>
      </div>

      <div className="create-content">
        <div className="create-form">
          <div className="create-form-group">
            <label>Tên đề thi <span className="required">*</span></label>
            <input
              type="text"
              value={examData.tende}
              onChange={(e) => handleChange('tende', e.target.value)}
              className={validationErrors.tende ? 'error' : ''}
            />
            {validationErrors.tende && (
              <span className="error-message">{validationErrors.tende}</span>
            )}
          </div>

          <div className="create-form-row">
            <div className="create-form-group">
              <label>Khối lớp</label>
              <select
                className="create-select"
                value={examData.grade}
                onChange={(e) => setExamData({...examData, grade: e.target.value})}
              >
                <option value="10">Lớp 10</option>
                <option value="11">Lớp 11</option>
                <option value="12">Lớp 12</option>
              </select>
            </div>

            <div className="create-form-group">
              <label>Môn học</label>
              <select
                className="create-select"
                value={examData.subject}
                onChange={(e) => setExamData({...examData, subject: e.target.value})}
              >
                <option value="TOAN">Toán</option>
                <option value="VLY">Vật lý</option>
                <option value="HOA">Hóa học</option>
                <option value="SINH">Sinh học</option>
                <option value="MT">Mĩ thuật</option>
                <option value="TIN">Tin học</option>
                <option value="VAN">Ngữ văn</option>
                <option value="NN1">Ngoại ngữ 1</option>
                <option value="NN2">Ngoại ngữ 2</option>
                <option value="SU">Lịch sử</option>
                <option value="DIA">Địa lý</option>
                <option value="CN">Công nghệ</option>
                <option value="GDTC">Giáo dục thể chất</option>
                <option value="AN">Âm nhạc</option>
                <option value="GDQPAN">Giáo dục quốc phòng và an ninh</option>
                <option value="GDKTPL">Giáo dục kinh tế và pháp luật</option>
                <option value="TDTTS">Tiếng dân tộc thiểu số</option>
              </select>
            </div>
          </div>

          <div className="create-form-group">
            <label>Mục đích tạo đề</label>
            <select
              className="create-select"
              value={examData.type}
              onChange={(e) => setExamData({...examData, type: e.target.value})}
            >
              <option value="THUONG_XUYEN">Đánh giá thường xuyên</option>
              <option value="DINH_KY">Đánh giá định kì</option>
              <option value="ON_TAP">Ôn tập</option>
            </select>
          </div>

          <div className="create-button-group">
            <button 
              className="create-btn-secondary"
              onClick={() => setShowPointModal(true)}
            >
              Chia điểm
            </button>
          </div>
        </div>

        <div className="create-note-container">
          <div className="create-form-group">
            <label>Ghi chú cho học sinh (không bắt buộc)</label>
            <textarea
              className="create-textarea"
              placeholder="Nhập ghi chú cho học sinh (ví dụ: thời gian làm bài, yêu cầu đặc biệt...)"
              value={examData.note}
              onChange={(e) => setExamData({...examData, note: e.target.value})}
            />
          </div>
        </div>

        <div className="create-questions-form">
          {examData.questions.map((question, index) => (
            <div key={question.id} className="create-question">
              <div className="create-question-header">
                <h3>Câu {index + 1}</h3>
                <div className="create-question-controls">
                  <div className="points-input-group">
                    <span className="points-label">Điểm từng câu</span>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) => handlePointsChange(question.id, e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <select
                    className="create-select level-select"
                    value={question.level}
                    onChange={(e) => handleLevelChange(question.id, e.target.value)}
                  >
                    <option value="NHAN_BIET">Nhận biết</option>
                    <option value="THONG_HIEU">Thông hiểu</option>
                    <option value="VAN_DUNG">Vận dụng</option>
                    <option value="VAN_DUNG_CAO">Vận dụng cao</option>
                  </select>

                  <div className="question-action-buttons">
                    <button 
                      className={`create-icon-btn ${selectedQuestionIndex === index ? 'active' : ''}`}
                      onClick={() => handleSwapSelect(index)}
                      title="Hoán đổi vị trí"
                    >
                      <IoSwapHorizontal />
                    </button>
                    <button 
                      className="create-icon-btn"
                      onClick={() => removeQuestion(question.id)}
                      title="Xóa câu hỏi"
                    >
                      <IoClose />
                    </button>
                  </div>
                </div>
              </div>

              <div className="create-question-content">
                <ReactQuill
                  ref={editorRef}
                  theme="snow"
                  modules={modules}
                  formats={formats}  // Thêm formats vào đây
                  value={question.question}
                  onChange={(content) => handleQuestionChange(question.id, content)}
                  placeholder="Nhập câu hỏi..."
                />
                
                <div className="create-options-list">
                  {question.options.map((option, optIndex) => (
                    <div key={option.id} className="create-option-item">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={option.isCorrect}
                        onChange={() => handleCorrectAnswer(question.id, option.id)}
                      />
                      <input
                        className="create-input"
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(question.id, option.id, e.target.value)}
                        placeholder={`Đáp án ${optIndex + 1}`}
                      />
                      <button
                        type="button"
                        className="create-option-remove"
                        onClick={() => removeOption(question.id, option.id)}
                        title="Xóa đáp án"
                      >
                        <IoClose />
                      </button>
                    </div>
                  ))}
                  {question.options.length < 4 && (
                    <button
                      type="button"
                      className="create-add-option"
                      onClick={() => addOption(question.id)}
                    >
                      <IoAdd /> Thêm đáp án {question.options.length < 2 ? "(Tối thiểu 2 đáp án)" : ""}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button className="create-add-btn" onClick={addQuestion}>
            <IoAdd /> Thêm câu hỏi
          </button>
        </div>
      </div>

      <PointDistributionModal
        show={showPointModal}
        onClose={() => setShowPointModal(false)}
        onDistribute={handleDistributePoints}
        totalPoints={totalPoints}
        setTotalPoints={setTotalPoints}
        questionCount={examData.questions.length}
      />

      <ConfirmModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => navigate('/exam')}
      />
    </div>
  );
} 