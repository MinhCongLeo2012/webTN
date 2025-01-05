import axios from 'axios';
import { API_BASE_URL } from '../config';
import { handleResponse } from './api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Xử lý lỗi chung
const handleError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return { message: 'Phiên đăng nhập hết hạn' };
  }
  return error.response?.data || { message: 'Lỗi kết nối đến máy chủ' };
};

const classService = {
  getAllClasses: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token being sent:', token);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.get('/api/classes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('API Response:', response);

      if (!response.data) {
        throw new Error('No data received from server');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Unknown error occurred');
      }

      return response.data;
    } catch (error) {
      console.error('getAllClasses error:', error);
      throw handleError(error);
    }
  },

  createClass: async (classData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.post('/api/classes', classData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Unknown error occurred');
      }

      return response.data;
    } catch (error) {
      console.error('createClass error:', error);
      throw handleError(error);
    }
  },

  updateClass: async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.put(`/api/classes/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return response.data;
    } catch (error) {
      console.error('updateClass error:', error);
      throw handleError(error);
    }
  },

  deleteClass: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.delete(`/api/classes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return response.data;
    } catch (error) {
      console.error('deleteClass error:', error);
      throw handleError(error);
    }
  },

  exportStudentList: async (classId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.get(
        `/api/class-details/${classId}/export-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob' // Quan trọng: để nhận file Excel
        }
      );

      // Tạo URL cho file và tải xuống
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `danh-sach-lop.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('exportStudentList error:', error);
      throw handleError(error);
    }
  },

  importStudents: async (classId, file) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(
        `/api/class-details/${classId}/import-students`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('importStudents error:', error);
      throw handleError(error);
    }
  },

  getImportTemplate: async (classId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.get(
        `/api/class-details/${classId}/import-template`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mau-danh-sach-hoc-sinh.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('getImportTemplate error:', error);
      throw handleError(error);
    }
  },

  exportExamResults: async (classId, examId) => {
    try {
      console.log('Calling export API with:', { classId, examId }); // Debug log
      
      const token = localStorage.getItem('token');
      const response = await axios({
        method: 'get',
        url: `${API_BASE_URL}/api/class-details/${classId}/export-results?examId=${examId}`,
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('API Response:', response); // Debug log

      // Tạo URL cho blob và tải xuống
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Lấy tên file từ header hoặc tạo tên mặc định
      const filename = response.headers['content-disposition']
        ? response.headers['content-disposition'].split('filename=')[1]
        : `ket-qua-thi-${new Date().toISOString()}.xlsx`;
        
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error in exportExamResults:', error);
      if (error.response) {
        console.error('Error response:', error.response);
      }
      throw new Error(error.response?.data?.message || 'Lỗi khi xuất bảng điểm');
    }
  }
};

export default classService; 