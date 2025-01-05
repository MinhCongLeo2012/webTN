import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { BsPersonCircle } from "react-icons/bs";
import { RiTeamLine, RiUserSettingsLine } from "react-icons/ri";
import { BiLogOutCircle } from "react-icons/bi";
import { IoIosArrowBack } from 'react-icons/io';
import "./StudentGround.css";

function StudentGround() {
  console.log('StudentGround rendered');
  const navigate = useNavigate();
  const location = useLocation();

  // Sửa lại hàm kiểm tra active
  const isActive = (path) => {
    if (path === '/student/class') {
      return location.pathname === '/student/class' || 
             location.pathname.includes('/student/class/') ||
             location.pathname.includes('/student/exam/') ||
             location.pathname.includes('/student/accountinfo');
    }
    return location.pathname.includes(path);
  };

  // Thêm hàm lấy tiêu đề
  const getHeaderContent = () => {
    switch (location.pathname) {
      case '/student/class':
        return { title: 'Lớp học' };
      case '/student/accountinfo':
        return { title: 'Thông tin' }; 
      default:
        return { title: '' };
    }
  };

  const headerContent = getHeaderContent();

  // Thêm các hàm xử lý
  const handleAccountInfo = () => {
    navigate('/student/accountinfo');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Thêm hàm xử lý quay lại
  const handleBack = () => {
    navigate(-1);
  };

  // Thêm hàm kiểm tra hiển thị nút back
  const shouldShowBackButton = () => {
    const noBackButtonPaths = ['/student/class'];
    return !noBackButtonPaths.includes(location.pathname);
  };

  return (
    <div className="ground-container">
      <div className="side-nav">
        <div className="nav-items">
          <div 
            className={`student-nav-item ${isActive('/student/class') ? 'active' : ''}`}
            onClick={() => navigate("/student/class")}
          >
            <RiTeamLine size="20px" />
            <span className="student-hover-text">Lớp học</span>
          </div>
        </div>
      </div>
      <div className="page-container">
        <div className="main-content">
          <div className="page-header">
            <div className="student-header-title-group">
              {shouldShowBackButton() && (
                <button className="student-back-button" onClick={handleBack}>
                  <IoIosArrowBack size="20" />
                  <span>Quay lại</span>
                </button>
              )}
              <h1 className="student-page-title">{headerContent.title}</h1>
            </div>
            
            <div className="account-control">
              <div className={`account-icon-wrapper ${isActive('/student/accountinfo') ? 'active' : ''}`}>
                <BsPersonCircle className="account-icon" size="24px" />
              </div>
              <div className="account-dropdown">
                <div 
                  className={`dropdown-item ${isActive('/student/accountinfo') ? 'active' : ''}`}
                  onClick={handleAccountInfo}
                >
                  <RiUserSettingsLine className="dropdown-icon" size="20px" />
                  <span>Xem thông tin tài khoản</span>
                </div>
                <div 
                  className="dropdown-item" 
                  onClick={handleLogout}
                >
                  <BiLogOutCircle className="logout-icon" size="20px" />
                  <span>Đăng xuất</span>
                </div>
              </div>
            </div>
          </div>
          <div className="content-wrapper">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentGround; 