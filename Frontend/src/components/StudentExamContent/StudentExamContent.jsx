import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import examService from '../../services/exam.service';
import gradingService from '../../services/grading.service';
import { toast } from 'react-toastify';
import './StudentExamContent.css';
import 'react-quill/dist/quill.snow.css';

// Thêm object mapping cho tên hiển thị của mức độ
const LEVEL_DISPLAY = {
  'NHAN_BIET': 'NB',
  'THONG_HIEU': 'TH',
  'VAN_DUNG': 'VD',
  'VAN_DUNG_CAO': 'VDC'
};

function StudentExamContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [studentInfo, setStudentInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(() => {
    const savedStartTime = localStorage.getItem(`exam_${id}_start_time`);
    return savedStartTime ? new Date(parseInt(savedStartTime)) : new Date();
  });
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await examService.getExamForStudent(id);
        
        // Randomize questions order
        const randomizedQuestions = response.data.questions ? 
          [...response.data.questions].sort(() => Math.random() - 0.5) : [];
        
        setExamData({
          ...response.data,
          questions: randomizedQuestions
        });
        
        setStudentInfo(response.data.studentInfo);
        
        if (response.data.thoigian) {
          const examMinutes = parseInt(response.data.thoigian);
          if (!isNaN(examMinutes)) {
            const totalSeconds = examMinutes * 60;
            const savedStartTime = localStorage.getItem(`exam_${id}_start_time`);
            
            if (savedStartTime) {
              const elapsedSeconds = Math.floor((new Date() - parseInt(savedStartTime)) / 1000);
              const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
              setTimeLeft(remainingSeconds);
            } else {
              localStorage.setItem(`exam_${id}_start_time`, new Date().getTime().toString());
              setTimeLeft(totalSeconds);
            }
          } else {
            console.error('Invalid thoigian value:', response.data.thoigian);
            setTimeLeft(600);
          }
        }
        
        const savedAnswers = localStorage.getItem(`exam_${id}_answers`);
        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exam:', error);
        toast.error('Không thể tải dữ liệu bài kiểm tra');
      }
    };

    fetchExamData();
  }, [id]);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`exam_${id}_answers`, JSON.stringify(answers));
    }
  }, [answers, id]);

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleSubmit = async (forceSubmit = false) => {
    if (forceSubmit) {
      await confirmSubmit();
    } else {
      setShowConfirmModal(true);
    }
  };

  const confirmSubmit = async () => {
    try {
      const timeSpent = Math.floor((new Date() - startTime) / 1000);
      
      let user = null;
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          user = JSON.parse(userStr);
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }

      if (!user?.id) {
        toast.error('Vui lòng đăng nhập lại');
        navigate('/login');
        return;
      }
      
      const submissionData = {
        iduser: user.id,
        answers: Object.entries(answers).map(([idcauhoi, dapanchon]) => ({
          idcauhoi,
          dapanchon
        })),
        tglambai: Math.floor(timeSpent),
        idlop: examData.studentInfo?.idlop
      };

      console.log('Submitting data:', submissionData);
      
      const result = await gradingService.submitExam(id, submissionData);
      
      if (result.success) {
        localStorage.removeItem(`exam_${id}_start_time`);
        localStorage.removeItem(`exam_${id}_answers`);
        
        setShowConfirmModal(false);
        
        navigate(`/student/exam/${id}/result`, { 
          state: { 
            examResult: {
              ...result.data,
              timeSpent: timeSpent
            }
          },
          replace: true
        });
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi nộp bài');
    }
  };

  const getUnansweredCount = () => {
    if (!examData?.questions) return 0;
    const totalQuestions = examData.questions.length;
    const answeredQuestions = Object.keys(answers).length;
    return totalQuestions - answeredQuestions;
  };

  const handleTimeUp = () => {
    toast.warning('Đã hết thời gian làm bài!', {
      autoClose: 2000,
      onClose: () => {
        localStorage.removeItem(`exam_${id}_start_time`);
        localStorage.removeItem(`exam_${id}_answers`);
        handleSubmit(true);
      }
    });
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="exam-content-page">
      <div className="exam-content-header">
        <div className="student-info">
          <span className="student-name">
            {studentInfo?.hoten || 'Không xác định'}
          </span>
        </div>
        <div className="exam-timer-container">
          <div className={`exam-timer ${timeLeft <= 300 ? 'warning' : ''} ${timeLeft <= 60 ? 'danger' : ''}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <button className="nb-submit-button" onClick={() => handleSubmit(false)}>
          Nộp bài
        </button>
      </div>

      <div className="exam-content-main">
        <div className="exam-content-left">
          {examData?.ghichu && (
            <div className="teacher-notes">
              <div className="note-header">
                <i className="fas fa-info-circle"></i>
                <span>Ghi chú của giáo viên:</span>
              </div>
              <div className="note-content">
                {examData.ghichu.split('\n').map((line, index) => (
                  <div key={index} className="note-line">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="questions-list">
            {examData?.questions?.map((question, index) => (
              <div key={question.idcauhoi} className="exam-question-container">
                <div className="exam-question-header">
                  <div className="exam-question-info">
                    <h3 className="exam-question-number">
                      Câu {index + 1}
                    </h3>
                    {question.mucdo && (
                      <span className={`exam-question-level exam-level-${question.mucdo}`}>
                        {LEVEL_DISPLAY[question.mucdo]}
                      </span>
                    )}
                  </div>
                  <div className="exam-question-content">
                    <div 
                      dangerouslySetInnerHTML={{ __html: question.noidung }}
                    />
                  </div>
                </div>
                <div className="exam-answer-options">
                  {['A', 'B', 'C', 'D'].map(option => {
                    const answerContent = question[`dap_an_${option.toLowerCase()}`]?.replace(/<\/?p>/g, '');
                    if (!answerContent) return null;
                    
                    return (
                      <label key={option} className="exam-answer-option">
                        <input
                          type="radio"
                          name={`question-${question.idcauhoi}`}
                          checked={answers[question.idcauhoi] === option}
                          onChange={() => handleAnswerChange(question.idcauhoi, option)}
                        />
                        <span className="exam-answer-text">
                          {option}. {answerContent}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Xác nhận nộp bài</h3>
            <p>
              {getUnansweredCount() > 0 
                ? `Bạn còn ${getUnansweredCount()} câu chưa làm. Bạn có chắc chắn muốn nộp bài?`
                : 'Bạn có chắc chắn muốn nộp bài?'
              }
            </p>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setShowConfirmModal(false)}>
                Tiếp tục làm bài
              </button>
              <button className="confirm-button" onClick={confirmSubmit}>
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentExamContent; 