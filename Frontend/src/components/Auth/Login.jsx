import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../Auth/Auth.css';
import axios from 'axios';
import { API_BASE_URL, GOOGLE_CLIENT_ID } from '../../config';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';

function handleError(error, setError) {
  console.error('Error details:', {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status
  });

  if (error.response) {
    if (error.response.status === 401) {
      setError('Email hoặc mật khẩu không chính xác');
    } else {
      setError(error.response.data?.message || 'Đăng nhập thất bại');
    }
  } else if (error.request) {
    setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
  } else {
    setError(`Lỗi không xác định: ${error.message}`);
  }
}

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!formData.email || !formData.password) {
        setError('Vui lòng điền đầy đủ thông tin');
        return;
      }

      if (!formData.email.endsWith('@gmail.com')) {
        setError('Email phải là địa chỉ Gmail');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', response.data.user.id);
        
        switch(response.data.user.vaitro) {
          case 'ADMIN':
            navigate('/admin');
            break;
          case 'TEACHER':
            navigate('/home');
            break;
          case 'STUDENT':
            navigate('/student/class');
            break;
          default:
            setError('Quyền người dùng không hợp lệ');
        }
      }
    } catch (error) {
      handleError(error, setError);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      console.log('Attempting Google login...');
      
      if (!credentialResponse.credential) {
        setError('Không nhận được thông tin xác thực từ Google');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/auth/google-login`, {
        credential: credentialResponse.credential
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Server response:', response.data);

      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', response.data.user.id);
        
        const role = response.data.user.vaitro;
        if (role === 'ADMIN') {
          navigate('/admin');
        } else if (role === 'TEACHER') {
          navigate('/home');
        } else if (role === 'STUDENT') {
          navigate('/student/class');
        } else {
          setError('Vai trò người dùng không hợp lệ');
        }
      } else if (response.data.requireRegistration) {
        navigate('/register', { 
          state: { 
            email: response.data.email,
            isGoogleSignup: true,
            credential: credentialResponse.credential
          } 
        });
      } else {
        setError(response.data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Google login error:', error);
      
      if (error.response?.status === 404) {
        navigate('/register');
      } else {
        setError(error.response?.data?.message || 'Lỗi đăng nhập Google');
      }
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Đăng nhập</h2>
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
        <button type="submit">Đăng nhập</button>
        <div className="auth-links">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
          <Link to="/register">Tạo một tài khoản mới</Link>
        </div>
        <div className="auth-divider">
          <span>Hoặc</span>
        </div>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              setError('Đăng nhập Google thất bại');
            }}
            size="large"
            width="100%"
            text="signin_with"
            useOneTap={false}
          />
        </GoogleOAuthProvider>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}

export default Login;
