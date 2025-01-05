import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import AccountInfo from './components/AccountInfo/AccountInfo';
import Ground from './components/Ground/Ground';
import ExamCreate from './components/ExamCreate/ExamCreate';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Ground />}>
          <Route path="/home" element={<Home />} />
          <Route path="/exam/create" element={<ExamCreate />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

