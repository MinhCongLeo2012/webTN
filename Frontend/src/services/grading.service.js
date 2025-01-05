import axios from 'axios';
import authHeader from './auth-header';

// Đảm bảo port khớp với backend (thường là 5000)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class GradingService {
  async submitExam(examId, answers) {
    try {
      console.log('Submitting to:', `${API_URL}/api/grading/exams/${examId}/submit`);
      console.log('Data:', answers);
      
      const response = await axios.post(
        `${API_URL}/api/grading/exams/${examId}/submit`,
        answers,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Submit error details:', error.response?.data);
      throw error;
    }
  }

  async getExamResult(resultId) {
    try {
      const response = await axios.get(
        `${API_URL}/api/grading/results/${resultId}`,
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new GradingService(); 