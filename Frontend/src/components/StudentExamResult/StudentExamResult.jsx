import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './StudentExamResult.css';
import { FaBook, FaUser, FaClock, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaCheck, FaTimes, FaHome, FaFilePdf } from 'react-icons/fa';
import { IoMdTimer } from 'react-icons/io';
import { BsFileEarmarkText } from 'react-icons/bs';
import html2pdf from 'html2pdf.js';

function StudentExamResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { examResult } = location.state || {};

  // Parse chitiet nếu nó là chuỗi JSON
  const parsedChitiet = React.useMemo(() => {
    if (!examResult?.chitiet) return [];
    
    if (typeof examResult.chitiet === 'string') {
      try {
        return JSON.parse(examResult.chitiet);
      } catch (error) {
        console.error('Error parsing chitiet:', error);
        return [];
      }
    }
    return examResult.chitiet;
  }, [examResult?.chitiet]);

  // Thêm hàm format thời gian mới
  const formatTime = (totalSeconds) => {
    if (!totalSeconds) return '0 phút 0 giây';
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    let result = '';
    if (minutes > 0) {
      result += `${minutes} phút `;
    }
    if (seconds > 0 || minutes === 0) {
      result += `${seconds} giây`;
    }
    
    return result.trim();
  };

  // Hàm xử lý in PDF
  const handlePrintPDF = () => {
    // Tạo container mới cho nội dung in
    const printContainer = document.createElement('div');
    printContainer.style.padding = '20mm';
    printContainer.style.backgroundColor = 'white';

    // Header của PDF
    const headerContent = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a237e; font-size: 24px; margin-bottom: 10px;">KẾT QUẢ BÀI KIỂM TRA</h1>
        <h2 style="color: #333; font-size: 18px;">${examResult.tende}</h2>
      </div>
    `;

    // Thông tin tổng quan
    const summaryContent = `
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
        <div style="background: #f8faff; padding: 15px; border-radius: 8px;">
          <p style="margin: 5px 0;"><strong>Học sinh:</strong> ${examResult.studentName}</p>
          <p style="margin: 5px 0;"><strong>Thời gian làm bài:</strong> ${formatTime(examResult.tglambai)}</p>
        </div>
        <div style="background: #f8faff; padding: 15px; border-radius: 8px;">
          <p style="margin: 5px 0;"><strong>Số câu đúng:</strong> ${examResult.socaudung}/${examResult.tongsocau}</p>
          <p style="margin: 5px 0;"><strong>Điểm số:</strong> ${examResult.tongdiem}/${examResult.maxScore}</p>
        </div>
      </div>
    `;

    // Chi tiết từng câu hỏi
    const detailContent = `
      <div style="margin-top: 20px;">
        <h3 style="color: #1a237e; margin-bottom: 20px;">CHI TIẾT BÀI LÀM</h3>
        ${parsedChitiet.map((question, index) => `
          <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <div>
                <span style="font-weight: bold; color: #1a237e;">Câu ${index + 1}</span>
                <span style="margin-left: 10px; padding: 2px 8px; border-radius: 4px; font-size: 12px; ${
                  question.mucdo.id === 'NHAN_BIET' ? 'background: #e3f2fd; color: #1976d2;' :
                  question.mucdo.id === 'THONG_HIEU' ? 'background: #e8f5e9; color: #2e7d32;' :
                  question.mucdo.id === 'VAN_DUNG' ? 'background: #fff3e0; color: #f57c00;' :
                  'background: #fbe9e7; color: #d84315;'
                }">${question.mucdo.id}</span>
              </div>
              <div>
                <span style="background: #f5f5f5; padding: 4px 12px; border-radius: 4px; color: #1a237e;">
                  Điểm: ${question.diem}
                </span>
              </div>
            </div>
            <div style="margin: 15px 0;">
              <p style="margin-bottom: 15px;"><strong>Nội dung:</strong> ${question.noidung}</p>
              
              <!-- Hiển thị tất cả các đáp án -->
              <div style="margin: 15px 0; padding-left: 20px;">
                ${Object.entries(question.cacDapAn || {}).map(([key, value]) => `
                  <div style="margin-bottom: 10px; padding: 8px 12px; border-radius: 4px; ${
                    key === question.dapandung ? 'background: #e8f5e9; border: 1px solid #a5d6a7;' :
                    key === question.dapanchon ? 'background: #fff3e0; border: 1px solid #ffcc80;' :
                    'background: #f5f5f5; border: 1px solid #e0e0e0;'
                  }">
                    <span style="font-weight: 500; margin-right: 8px;">${key}.</span>
                    <span>${value}</span>
                    ${key === question.dapandung ? 
                      '<span style="color: #4caf50; margin-left: 8px;">✓ Đáp án đúng</span>' : 
                      key === question.dapanchon ? 
                      `<span style="color: ${key === question.dapandung ? '#4caf50' : '#f44336'}; margin-left: 8px;">
                        ${key === question.dapandung ? '✓' : '✗'} Đáp án của bạn
                      </span>` : 
                      ''}
                  </div>
                `).join('')}
              </div>

              <!-- Kết quả đáp án -->
              <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #e0e0e0;">
                <p style="color: ${question.isCorrect ? '#4caf50' : '#f44336'}; font-weight: 500;">
                  ${question.isCorrect ? 
                    '✓ Bạn đã trả lời đúng' : 
                    '✗ Bạn đã trả lời sai'}
                </p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Gộp tất cả nội dung
    printContainer.innerHTML = headerContent + summaryContent + detailContent;

    // Cấu hình PDF
    const opt = {
      margin: [0, 0, 0, 0],
      filename: `ket-qua-${examResult.tende}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait'
      },
      pagebreak: { mode: ['avoid-all'] }
    };

    // Tạo PDF
    html2pdf().from(printContainer).set(opt).save();
  };

  // Hàm xử lý về trang chủ
  const handleGoHome = () => {
    navigate('/student/class');
  };

  // Di chuyển điều kiện return này xuống sau khi khai báo tất cả hooks
  if (!examResult) {
    return <div className="exam-result-container">
      <h2>Không tìm thấy kết quả bài kiểm tra</h2>
    </div>;
  }

  return (
    <div className="exam-result-container">
      <div className="result-header">
        <h1>Kết quả bài kiểm tra</h1>
        <div className="exam-info">
          <h2>{examResult.tende}</h2>
        </div>
      </div>

      <div className="result-info-grid">
        <div className="info-group">
          <div className="info-label">
            <FaUser /> Học sinh:
          </div>
          <div className="info-value">{examResult.studentName}</div>
        </div>

        <div className="info-group">
          <div className="info-label">
            <FaClock /> Thời gian làm bài:
          </div>
          <div className="info-value">{formatTime(examResult.tglambai)}</div>
        </div>
      </div>

      <div className="score-highlight">
        <div className="score-display">
          <div className="score-label">
            <FaCheck /> Số câu đúng
          </div>
          <div className="score-number correct-score">{examResult.socaudung}</div>
        </div>

        <div className="score-display">
          <div className="score-label">
            <FaTimes /> Số câu sai
          </div>
          <div className="score-number wrong-score">{examResult.socausai}</div>
        </div>

        <div className="score-display">
          <div className="score-label">
            <BsFileEarmarkText /> Tổng số câu
          </div>
          <div className="score-number total-score">{examResult.tongsocau}</div>
        </div>

        <div className="score-display">
          <div className="score-label">
            <IoMdTimer /> Điểm số
          </div>
          <div className="score-number final-score">
            {examResult.tongdiem}/{examResult.maxScore}
          </div>
        </div>
      </div>

      <div className="detailed-results">
        <h3>Chi tiết bài làm</h3>
        {parsedChitiet.map((question, index) => (
          <div key={question.idcauhoi} className={`question-result ${question.isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="question-header">
              <div className="question-info">
                <span className="question-number">Câu {index + 1}</span>
                <span 
                  className={`result-question-level level-${question.mucdo.id}`}
                >
                  {question.mucdo.id === 'NHAN_BIET' ? 'NB' :
                   question.mucdo.id === 'THONG_HIEU' ? 'TH' :
                   question.mucdo.id === 'VAN_DUNG' ? 'VD' : 'VDC'}
                </span>
              </div>
              <div className="question-score">
                <span className="score-box">Điểm: {question.diem}</span>
                <span className={`answer-status-icon ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                  {question.isCorrect ? <FaCheckCircle /> : <FaTimesCircle />}
                </span>
              </div>
            </div>
            <div className="question-content" dangerouslySetInnerHTML={{ __html: question.noidung }} />
            <div className="answer-details">
              <p>Đáp án của bạn: <strong>{question.dapanchon}</strong></p>
              <p>Đáp án đúng: <strong>{question.dapandung}</strong></p>
            </div>
            <div className="answer-options">
              {Object.entries(question.cacDapAn || {}).map(([key, value]) => (
                <div 
                  key={key} 
                  className={`answer-option ${
                    key === question.dapandung ? 'correct-answer' : 
                    key === question.dapanchon ? 'selected-answer' : ''
                  }`}
                >
                  {key}. {value}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="result-actions">
        <button 
          className="action-button home-button"
          onClick={handleGoHome}
        >
          <FaHome /> Về trang chủ
        </button>
        <button 
          className="action-button print-button"
          onClick={handlePrintPDF}
        >
          <FaFilePdf /> In kết quả PDF
        </button>
      </div>
    </div>
  );
}

export default StudentExamResult;