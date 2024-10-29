import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Import a CSS file for styling

const HomePage = () => {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleLogin = () => {
    navigate('/login'); // Navigate to login page
  };

  const handleRegister = () => {
    navigate('/register'); // Navigate to register page
  };

  return (
    <div className="home-container">
      <h1 className="home-title">AI-Powered Personal Impact Map</h1>
      <p className="home-description">
        Understand your carbon footprint through shopping, travel, energy, and water consumption. 
        Take charge of your environmental impact!
      </p>
      <div className="button-container">
        <button className="home-button" onClick={handleLogin}>Login</button>
        <button className="home-button" onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
};

export default HomePage;
