import axios from 'axios';
import { API_BASE_URL } from '../config';

const examService = {
  async getList() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/exam`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Exam service response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Exam service error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đề thi');
    }
  },

  async deleteExam(examId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/api/exam/${examId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể xóa đề thi');
    }
  },

  async updateExam(exam) {
    try {
      console.log('Sending update request with data:', {
        url: `${API_BASE_URL}/api/exam/${exam.iddethi}`,
        body: {
          tende: exam.tende,
          idmucdich: exam.idmucdich
        }
      });

      const response = await axios.put(`${API_BASE_URL}/api/exam/${exam.iddethi}`, {
        tende: exam.tende,
        idmucdich: exam.idmucdich
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Update response:', response);
      return response.data;
    } catch (error) {
      console.error('Update error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.message || 'Không thể cập nhật đề thi');
    }
  },

  async getExamForStudent(examId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/exam/${examId}/student`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin bài thi');
    }
  },

  async createExam(examData) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/exam/create`, examData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể tạo đề thi');
    }
  },

  async assignExam(examId, assignmentData) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Assigning exam:', { examId, assignmentData }); // Debug log

      const response = await axios.post(
        `${API_BASE_URL}/api/exam/assign/${examId}`, 
        assignmentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to assign exam');
      }

      return response.data;
    } catch (error) {
      console.error('Exam assignment error:', error.response || error); // Debug log
      
      // Handle specific error cases
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error?.message;
        
        switch (error.response.status) {
          case 404:
            throw new Error('Không tìm thấy đề thi');
          case 400:
            throw new Error(errorMessage || 'Dữ liệu không hợp lệ');
          case 403:
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Phiên làm việc đã hết hạn');
          default:
            throw new Error(errorMessage || 'Lỗi khi giao đề thi');
        }
      }
      
      throw new Error(error.message || 'Không thể kết nối đến máy chủ');
    }
  }
};

export default examService; 