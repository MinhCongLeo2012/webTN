import React, { useState, useEffect } from 'react';
import { PiGraduationCapFill } from 'react-icons/pi';
import axios from 'axios';
import './AccountInfo.css';

function AccountInfo({ readOnly = false, userType = 'teacher' }) {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "male",
    birthDate: ""
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('User data from localStorage:', user);
    if (user) {
      setUserInfo({
        name: user.hoten || '',
        email: user.email || '',
        phone: user.sodienthoai || '',
        gender: user.gioitinh || 'male',
        birthDate: user.ngaysinh ? formatDate(user.ngaysinh) : ''
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(userInfo.phone)) {
        setError('Số điện thoại phải có 10 chữ số');
        return;
      }

      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      if (!user || !user.id) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      const response = await axios.put(
        `${API_URL}/api/auth/profile/${user.id}`,
        {
          hoten: userInfo.name,
          ngaysinh: userInfo.birthDate,
          gioitinh: userInfo.gender,
          sodienthoai: userInfo.phone
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        const updatedUser = {
          ...user,
          hoten: response.data.user.hoten || '',
          ngaysinh: response.data.user.ngaysinh || '',
          gioitinh: response.data.user.gioitinh || 'male',
          sodienthoai: response.data.user.sodienthoai || ''
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setUserInfo({
          name: updatedUser.hoten,
          email: updatedUser.email,
          phone: updatedUser.sodienthoai,
          gender: updatedUser.gioitinh,
          birthDate: formatDate(updatedUser.ngaysinh)
        });
        
        setSuccess('Cập nhật thông tin thành công');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.response?.data?.message || 'Lỗi cập nhật thông tin');
    }
  };

  // Sửa lại hàm kiểm tra ngày sinh hợp lệ
  const isValidBirthDate = (date) => {
    // Nếu chưa nhập đầy đủ ngày tháng năm, return true để cho phép tiếp tục nhập
    if (!date || date.length < 10) return true;
    
    const today = new Date();
    const birthDate = new Date(date);
    
    // Chỉ so sánh khi đã có ngày hợp lệ
    if (!isNaN(birthDate.getTime())) {
      return birthDate <= today;
    }
    return true;
  };

  // Sửa lại hàm formatDate để không làm thay đổi định dạng của input date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Trả về định dạng YYYY-MM-DD cho input type="date"
      return dateString.split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <div className={`profile-container-ac ${userType === 'student' ? 'student-profile-ac' : ''}`}>
      <div className="info-container-ac">
        <div className="avatar-wrapper-ac">
          <div className="avatar-circle-ac">
            <PiGraduationCapFill size="50px" />
          </div>
        </div>

        <div className="info-row-ac">
          <div className="info-group-ac">
            <label>Họ và tên</label>
            <input 
              type="text"
              value={userInfo.name}
              onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              readOnly={readOnly}
              className={readOnly ? 'info-input-readonly-ac' : ''}
              placeholder="Nhập họ và tên..."
            />
          </div>

          <div className="info-group-ac">
            <label>Email</label>
            <input 
              type="email" 
              value={userInfo.email} 
              className="info-input-readonly-ac"
              readOnly
            />
          </div>
        </div>

        <div className="info-row-ac">
          <div className="info-group-ac">
            <label>Ngày sinh</label>
            <input 
              type="date" 
              value={userInfo.birthDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = e.target.value;
                if (isValidBirthDate(newDate)) {
                  setUserInfo({ ...userInfo, birthDate: newDate });
                  setError(''); // Xóa thông báo lỗi nếu có
                } else {
                  setError('Ngày sinh không thể lớn hơn ngày hiện tại');
                }
              }}
              className="info-date-ac"
            />
          </div>

          <div className="info-group-ac">
            <label>Giới tính</label>
            <div className="gender-container-ac">
              <div className="gender-options-ac">
                <div className="gender-item-ac">
                  <input
                    className="gender-radio-ac"
                    type="radio"
                    id="male"
                    name="gender"
                    value="male"
                    checked={userInfo.gender === "male"}
                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}
                  />
                  <label className="gender-label-ac" htmlFor="male">Nam</label>
                </div>
                <div className="gender-item-ac">
                  <input
                    className="gender-radio-ac"
                    type="radio"
                    id="female"
                    name="gender"
                    value="female"
                    checked={userInfo.gender === "female"}
                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}
                  />
                  <label className="gender-label-ac" htmlFor="female">Nữ</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="info-row-ac">
          <div className="info-group-ac">
            <label>Số điện thoại</label>
            <input 
              type="tel" 
              value={userInfo.phone} 
              onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
              placeholder="Nhập số điện thoại..."
            />
          </div>
          <div className="info-group-ac">
            {/* Để trống để căn đều layout */}
          </div>
        </div>
        
        {error && <div className="error-message-ac">{error}</div>}
        {success && <div className="success-message-ac">{success}</div>}
        
        <button className="update-button-ac" onClick={handleSubmit}>
          Cập nhật thông tin
        </button>
      </div>
    </div>
  );
}

export default AccountInfo; 