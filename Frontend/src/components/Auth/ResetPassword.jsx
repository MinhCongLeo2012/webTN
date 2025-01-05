import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams(); // Lấy token từ URL
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword: formData.password
      });
      
      setMessage('Đặt lại mật khẩu thành công');
      setError('');
      
      // Chuyển hướng về trang đăng nhập sau 3 giây
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Đặt lại mật khẩu</h2>
        
        <div className="password-input-container">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Mật khẩu mới"
            required
          />
        </div>

        <div className="password-input-container">
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            placeholder="Xác nhận mật khẩu mới"
            required
          />
        </div>

        <button type="submit">Đặt lại mật khẩu</button>
        
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}

export default ResetPassword;
