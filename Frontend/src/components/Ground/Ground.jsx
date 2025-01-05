import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { BsHouseDoor, BsPersonCircle } from "react-icons/bs";
import { RiTeamLine, RiFolderOpenLine, RiUserSettingsLine } from "react-icons/ri";
import { BiLogOutCircle } from "react-icons/bi";
import { IoIosArrowBack } from 'react-icons/io';
import "./Ground.css";
import '../../styles/variables.css';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function Ground() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isHome = location.pathname === '/home' || location.pathname === '/accountinfo';

  const [headerContent, setHeaderContent] = useState({ title: '' });

  useEffect(() => {
    const fetchHeaderContent = async () => {
      const content = await getHeaderContent();
      setHeaderContent(content);
    };
    
    fetchHeaderContent();
  }, [location.pathname]);

  const getHeaderContent = async () => {
    if (location.pathname.startsWith('/class/')) {
      const classId = location.pathname.split('/').pop();
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/classes/${classId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.data) {
          const classData = response.data.data;
          // Cập nhật localStorage với dữ liệu mới
          localStorage.setItem('currentClass', JSON.stringify({
            idlop: classData.idlop,
            tenlop: classData.tenlop,
            namhoc: classData.namhoc
          }));
          return { 
            title: classData.tenlop
          };
        }
      } catch (error) {
        console.error('Error fetching class details:', error);
        // Fallback to localStorage if API fails
        const savedClass = JSON.parse(localStorage.getItem('currentClass') || '{}');
        return { 
          title: savedClass.tenlop || 'Chi tiết lớp học'
        };
      }
    }

    switch (location.pathname) {
      case '/home':
        return { title: 'Trang chủ' };
      case '/accountinfo':
        return { title: 'Thông tin' };
      case '/exam':
        return { title: 'Đề thi' };
      case '/class':
        return { title: 'Lớp học' };
      case '/exam/upload':
        return { title: 'Tạo đề thi' };
      default:
        return { title: '' };
    }
  };

  const handleAccountInfo = () => {
    navigate('/accountinfo');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  const shouldShowBackButton = () => {
    const noBackButtonPaths = ['/home', '/login', '/register', '/forgot-password', '/'];
    return !noBackButtonPaths.includes(location.pathname);
  };

  const isActive = (path) => {
    if (path === '/home') {
      return isHome;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="ground-container">
      <div className="side-nav">
        <div className="nav-items">
          <div 
            className={`nav-item ${isActive('/home') ? 'active' : ''}`}
            onClick={() => navigate('/home')}
          >
            <BsHouseDoor size="24px"/>
            <div className="hover-text">Trang chủ</div>
          </div>
          <div 
            className={`nav-item ${isActive('/exam') ? 'active' : ''}`} 
            onClick={() => handleNavigate("/exam")}
          >
            <RiFolderOpenLine size="24px" />
            <span className="hover-text">Đề thi</span>
          </div>
          <div 
            className={`nav-item ${isActive('/class') ? 'active' : ''}`} 
            onClick={() => handleNavigate("/class")}
          >
            <RiTeamLine size="24px" />
            <span className="hover-text">Lớp học</span>
          </div>
        </div>
      </div>
      <div className="page-container">
        <div className="main-content">
          <div className={`page-header ${isHome ? 'home-page' : ''}`}>
            <div className="header-title-group">
              {shouldShowBackButton() && (
                <button className="back-button" onClick={handleBack}>
                  <IoIosArrowBack size="20" />
                  <span>Quay lại</span>
                </button>
              )}
              <h1 className="page-title">{headerContent.title}</h1>
            </div>
            
            <div className="account-control">
              <div className="account-icon-wrapper">
                <BsPersonCircle className="account-icon" size="24px" />
              </div>
              <div className="account-dropdown">
                <div className="dropdown-item" onClick={handleAccountInfo}>
                  <RiUserSettingsLine className="dropdown-icon" size="20px" />
                  <span>Xem thông tin tài khoản</span>
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <BiLogOutCircle className="logout-icon" size="20px" />
                  <span>Đăng xuất</span>
                </div>
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Ground;
