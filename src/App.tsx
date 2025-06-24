import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import SignUpPage from "./components/SignUpPage";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import WriteupsPage from './components/WriteUpsPage';
import BottleGamePage from "./components/BottleGamePage";


// inside your Router:


const App: React.FC = () => {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/writeups" element={<WriteupsPage />} />
        <Route path="/game" element={<BottleGamePage />} />
      </Routes>
    </Router>
  );
};

export default App;


