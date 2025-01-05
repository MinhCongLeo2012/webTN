import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../Auth/Auth.css';

function ForgotPassword() {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    console.log('Starting password reset process...');

    try {
      // Log form data
      console.log('Form data:', {
        email: formData.email,
        passwordLength: formData.newPassword.length
      });

      if (formData.newPassword !== formData.confirmPassword) {
        console.log('Password mismatch');
        setError('Mật khẩu xác nhận không khớp!');
        return;
      }

      if (!formData.email.endsWith('@gmail.com')) {
        console.log('Invalid email format');
        setError('Email phải là địa chỉ Gmail');
        return;
      }

      console.log('Sending request to server...');
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email: formData.email.trim(),
        newPassword: formData.newPassword
      });

      console.log('Server response:', response.data);
      setMessage('Link xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra email để hoàn tất việc đổi mật khẩu.');
      setError('');
    } catch (error) {
      console.error('Password reset error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Đổi mật khẩu</h2>
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
            type="password"
            name="newPassword"
            placeholder="Mật khẩu mới"
            value={formData.newPassword}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="password-input-container">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu mới"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Gửi yêu cầu đổi mật khẩu</button>
        
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <div className="auth-links">
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
