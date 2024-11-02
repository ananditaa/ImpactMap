import React, { useState } from 'react';
import './Questionnaire.css';

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
    monthlyGroceryBill: 'None', // Change to number input
    travelFrequency: 'None',
    vehicleDistance: 'None', // Change to number input
    wasteBagSize: 'None',
    wasteBagCount: 'None', // Change to number input
    screenTime: 'None', // Change to number input
    newClothes: 'None', // Change to number input
    internetTime: 'None', // Change to number input
    energyEfficiency: 'None',
  });

  const options = {
    bodyType: ['normal', 'overweight', 'obese', 'underweight'],
    sex: ['male', 'female'],
    diet: ['vegan', 'vegetarian', 'pescatarian','omnivore'],
    showerFrequency: ['daily', 'less frequently', 'more frequently','twice a day'],
    heatingEnergySource: ['coal','electricity','natural gas','wood'],
    transport: ['private','public','walk/bicycle'],
    vehicleType: ['diesel','electric','hybrid','lpg','petrol','none'],
    socialActivity: ['never','often','sometimes'],
    travelFrequency:['frequently','never','rarely','very frequently'],
    wasteBagSize:['large','medium','small','extra large'],
    energyEfficiency:['No','Sometimes','Yes'],
    // Add other options as needed
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponses(prevResponses => ({
      ...prevResponses,
      [name]: value || 'None' // Set to 'None' if the value is blank
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate JSON object from responses
    const jsonResponse = JSON.stringify(responses);
    console.log('Responses submitted:', jsonResponse);
    // Add submission logic here (e.g., sending to an API)
    fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonResponse,
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch(error => console.error('Error:', error));
  };

  return (
    <div className="questionnaire-container">
      <h1 className="title">Monthly Lifestyle Questionnaire</h1>
      <form onSubmit={handleSubmit} className="questionnaire-form">
        {Object.keys(responses).map((key) => (
          <div className="form-group" key={key}>
            <label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</label>
            {['monthlyGroceryBill', 'vehicleDistance', 'wasteBagCount', 'screenTime', 'newClothes', 'internetTime'].includes(key) ? (
              <input
                type="number"
                name={key}
                id={key}
                value={responses[key] === 'None' ? '' : responses[key]} // Display empty string for 'None'
                onChange={handleChange}
                required
                min="0" // Ensure only positive numbers are allowed
                placeholder="Enter a number"
              />
            ) : (
              <select name={key} id={key} value={responses[key]} onChange={handleChange} required>
                <option value="None">Select...</option>
                {options[key] ? (
                  options[key].map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))
                ) : (
                  <option value="None">No options available</option>
                )}
              </select>
            )}
          </div>
        ))}
        <button type="submit" className="submit-button">Submit</button>
      </form>
    </div>
  );
};

export default Questionnaire;
