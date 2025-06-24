import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';  // <-- import your CSS

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <div className="homepage-container">
      <div className="homepage-content">
        <h1 className="homepage-title">
          Welcome to <span>Evanescent</span>
        </h1>
        <p className="homepage-description">
          Your words. And the Sea<br />
        </p>
        <button className="get-started-button" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HomePage;
