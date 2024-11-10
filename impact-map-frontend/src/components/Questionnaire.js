import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'; // Import required Chart.js components
import './Questionnaire.css';

// Register required components
ChartJS.register(ArcElement, Tooltip, Legend);

const Questionnaire = () => {
  const [responses, setResponses] = useState({
    bodyType: 'None',
    sex: 'None',
    diet: 'None',
    showerFrequency: 'None',
    heatingEnergySource: 'None',
    transport: 'None',
    vehicleType: 'None',
    socialActivity: 'None',
    monthlyGroceryBill: '',
    travelFrequency: 'None',
    vehicleDistance: '',
    wasteBagSize: 'None',
    wasteBagCount: '',
    screenTime: '',
    newClothes: '',
    internetTime: '',
    energyEfficiency: 'None',
  });

  const [carbonEmission, setCarbonEmission] = useState(null);
  const [error, setError] = useState(null);

  const expectedRange = { min: 500, max: 2000 }; // Define expected range for carbon emissions

  // Define static percentage breakdown for categories
  const breakdownPercentages = {
    transport: 40,
    diet: 25,
    energy: 20,
    waste: 15,
  };

  // Calculate dynamic pie chart data
  const getPieData = () => {
    if (!carbonEmission) return null;

    const dataValues = Object.values(breakdownPercentages).map(
      (percent) => (percent / 100) * carbonEmission
    );

    return {
      labels: Object.keys(breakdownPercentages),
      datasets: [
        {
          label: 'Carbon Emission Breakdown',
          data: dataValues,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        },
      ],
    };
  };

  const options = {
    bodyType: ['normal', 'overweight', 'obese', 'underweight'],
    sex: ['male', 'female'],
    diet: ['vegan', 'vegetarian', 'pescatarian', 'omnivore'],
    showerFrequency: ['daily', 'less frequently', 'more frequently', 'twice a day'],
    heatingEnergySource: ['coal', 'electricity', 'natural gas', 'wood'],
    transport: ['private', 'public', 'walk/bicycle'],
    vehicleType: ['diesel', 'electric', 'hybrid', 'lpg', 'petrol', 'none'],
    socialActivity: ['never', 'often', 'sometimes'],
    travelFrequency: ['frequently', 'never', 'rarely', 'very frequently'],
    wasteBagSize: ['large', 'medium', 'small', 'extra large'],
    energyEfficiency: ['No', 'Sometimes', 'Yes'],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponses((prevResponses) => ({
      ...prevResponses,
      [name]: value || 'None', // Set to 'None' if the value is blank
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCarbonEmission(null);

    const jsonResponse = JSON.stringify(responses);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token not found. Please log in.');
      }

      const response = await fetch('http://localhost:5000/submit-questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: jsonResponse,
      });

      if (!response.ok) {
        throw new Error('Failed to submit questionnaire. Please try again.');
      }

      const data = await response.json();
      const emissionValue = parseFloat(data.data).toFixed(2); // Format to 2 decimal places
      setCarbonEmission(emissionValue);
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="questionnaire-container">
      <h1 className="title">Monthly Lifestyle Questionnaire</h1>
      <form onSubmit={handleSubmit} className="questionnaire-form">
        {Object.keys(responses).map((key) => (
          <div className="form-group" key={key}>
            <label htmlFor={key}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:
            </label>
            {['monthlyGroceryBill', 'vehicleDistance', 'wasteBagCount', 'screenTime', 'newClothes', 'internetTime'].includes(key) ? (
              <input
                type="number"
                name={key}
                id={key}
                value={responses[key]}
                onChange={handleChange}
                required
                min="0"
                placeholder="Enter a number"
              />
            ) : (
              <select name={key} id={key} value={responses[key]} onChange={handleChange} required>
                <option value="None">Select...</option>
                {key === 'vehicleType' && responses.transport !== 'private'
                  ? <option value="None">None (Public Transport)</option>
                  : options[key]?.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            )}
          </div>
        ))}
        <button type="submit" className="submit-button">Submit</button>
      </form>
      {carbonEmission && (
        <>
          <div className="result">
            <h2>Your Predicted Carbon Emission</h2>
            <p>{carbonEmission} kg CO₂</p>
            <p>
              {carbonEmission < expectedRange.min
                ? "Your carbon footprint is significantly lower than the expected range. Great job!"
                : carbonEmission > expectedRange.max
                ? "Your carbon footprint is higher than the expected range. Consider adopting more sustainable practices."
                : "Your carbon footprint is within the expected range. Keep maintaining a balanced lifestyle!"}
            </p>
          </div>
          <div className="chart">
            <h2>Carbon Emission Breakdown</h2>
            <Pie data={getPieData()} />
          </div>
        </>
      )}
      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
