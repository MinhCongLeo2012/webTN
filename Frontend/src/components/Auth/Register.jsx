import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../Auth/Auth.css';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { API_BASE_URL, GOOGLE_CLIENT_ID } from '../../config';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userType: 'student',
    email: '',
    password: '',
    hoten: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUserTypeChange = (type) => {
    console.log('Changing user type to:', type);
    setFormData({ ...formData, userType: type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!formData.email || !formData.password || !formData.hoten) {
        setError('Vui lòng điền đầy đủ thông tin');
        return;
      }

      if (!formData.email.endsWith('@gmail.com')) {
        setError('Email phải là địa chỉ Gmail');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        hoten: formData.hoten,
        email: formData.email.trim().toLowerCase(),
        matkhau: formData.password,
        vaitro: formData.userType === 'teacher' ? 'TEACHER' : 'STUDENT'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        alert('Đăng ký thành công!');
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        if (error.response.status === 400) {
          setError(error.response.data?.message || 'Email đã được sử dụng');
        } else {
          setError(error.response.data?.message || 'Đăng ký thất bại');
        }
      } else if (error.request) {
        setError('Không thể kết nối đến server');
      } else {
        setError('Đã xảy ra lỗi, vui lòng thử lại');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleRegister = async (credentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        setError('Không nhận được thông tin xác thực từ Google');
        return;
      }

      const userRole = formData.userType === 'teacher' ? 'TEACHER' : 'STUDENT';
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/google-register`, {
        credential: credentialResponse.credential,
        vaitro: userRole
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (response.data.user) {
        alert('Đăng ký thành công!');
        navigate('/login');
      }
    } catch (error) {
      handleError(error, setError);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Đăng Ký</h2>
        <div className="user-type">
          <span 
            className={formData.userType === 'student' ? 'active' : ''}
            onClick={() => handleUserTypeChange('student')}
          >
            <FaUserGraduate /> Học sinh
          </span>
          <span 
            className={formData.userType === 'teacher' ? 'active' : ''}
            onClick={() => handleUserTypeChange('teacher')}
          >
            <FaChalkboardTeacher /> Giáo viên
          </span>
        </div>
        <input
          type="text"
          name="hoten"
          placeholder="Họ tên"
          value={formData.hoten}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button type="submit">Đăng ký</button>
        <div className="auth-links">
          <Link to="/login">Đăng nhập</Link>
        </div>
        <div className="auth-divider">
          <span>Hoặc</span>
        </div>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={credentialResponse => {
              handleGoogleRegister(credentialResponse);
            }}
            onError={() => {
              setError('Đăng ký Google thất bại');
            }}
            size="large"
            width="100%"
            text="signup_with"
            useOneTap
          />
        </GoogleOAuthProvider>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}

// Utility function for error handling
function handleError(error, setError) {
  console.error('Error details:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status
  });

  if (error.response) {
    setError(`Lỗi server: ${error.response.data?.message || 'Không có thông báo lỗi'}`);
  } else if (error.request) {
    setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
  } else {
    setError(`Lỗi không xác định: ${error.message}`);
  }
}

export default Register;
