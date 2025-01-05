// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import Ground from './components/Ground/Ground';
import AccountInfo from './components/AccountInfo/AccountInfo';
import Exam from './components/Exam/Exam';
import ExamUpload from './components/ExamUpload/ExamUpload';
import ExamCreate from './components/ExamCreate/ExamCreate';
import Class from './components/Class/Class';
import ClassDetail from './components/ClassDetail/ClassDetail';
import './styles/variables.css';
import './App.css';
import './index.css';
import './components/Auth/Auth.css';
import './components/Ground/Ground.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExamReview from './components/ExamReview/ExamReview';
import StudentClass from './components/StudentClass/StudentClass';
import StudentGround from './components/StudentGround/StudentGround';
import StudentAccountInfo from './components/StudentAccountInfo/StudentAccountInfo';
import StudentClassDetail from './components/StudentClassDetail/StudentClassDetail';
import StudentExamStart from './components/StudentExamStart/StudentExamStart';
import PrivateRoute from './components/Auth/PrivateRoute';
import ExamAssign from './components/ExamAssign/ExamAssign';
import StudentExamContent from './components/StudentExamContent/StudentExamContent';
import StudentExamResult from './components/StudentExamResult/StudentExamResult';
import AdminApp from './components/Admin/AdminApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Teacher routes */}
        <Route path="/*" element={
          <PrivateRoute allowedRoles={['TEACHER']}>
            <Routes>
              {/* Routes độc lập không dùng Ground layout */}
              <Route path="exam/create" element={<ExamCreate />} />
              <Route path="exam/review" element={<ExamReview />} />

              {/* Routes với Ground layout */}
              <Route element={<Ground />}>
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="home" element={<Home />} />
                <Route path="class" element={<Class />} />
                <Route path="class/:id" element={<ClassDetail />} />
                <Route path="exam" element={<Exam />} />
                <Route path="exam/upload" element={<ExamUpload />} />
                <Route path="exam/assign" element={<ExamAssign />} />
                <Route path="accountinfo" element={<AccountInfo />} />
              </Route>
            </Routes>
          </PrivateRoute>
        } />

        {/* Student routes */}
        <Route path="/student/*" element={
          <PrivateRoute allowedRoles={['STUDENT']}>
            <Routes>
              {/* Route độc lập không dùng StudentGround */}
              <Route path="exam/:id/content" element={<StudentExamContent />} />

              {/* Routes với StudentGround layout */}
              <Route element={<StudentGround />}>
                <Route path="class" element={<StudentClass />} />
                <Route path="class/:id" element={<StudentClassDetail />} />
                <Route path="exam/:id" element={<StudentExamStart />} />
                <Route path="accountinfo" element={<StudentAccountInfo />} />
                <Route path="exam/:id/result" element={<StudentExamResult />} />
              </Route>
            </Routes>
          </PrivateRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin/*" element={
          <PrivateRoute allowedRoles={['ADMIN']}>
            <AdminApp />
          </PrivateRoute>
        } />

        {/* Redirect to login for unknown routes */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}
export default App;

