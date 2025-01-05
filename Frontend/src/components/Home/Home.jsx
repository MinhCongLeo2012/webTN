import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiTeamLine, RiFolderOpenLine } from 'react-icons/ri';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="home-content">
      <div className="feature-grid">
        <div className="feature-item" onClick={() => navigate('/exam')}>
          <div className="icon-wrapper">
            <RiFolderOpenLine size="48px" />
          </div>
          <span className="feature-text">Đề thi</span>
        </div>
        <div className="feature-item" onClick={() => navigate('/class')}>
          <div className="icon-wrapper">
            <RiTeamLine size="48px" />
          </div>
          <span className="feature-text">Lớp học</span>
        </div>
      </div>
    </div>
  );
}

export default Home;