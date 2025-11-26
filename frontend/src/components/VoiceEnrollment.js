import React, { useState } from 'react';
import { useVoiceBiometric } from '../context/VoiceBiometricContext';
import { useVoice } from '../context/VoiceContext';
import './VoiceEnrollment.css';

const VoiceEnrollment = ({ onComplete, onCancel }) => {
  const { startVoiceEnrollment, isEnrolling, enrollmentStep, enrollmentPhrases } = useVoiceBiometric();
  const { speak } = useVoice();
  const [userInfo, setUserInfo] = useState({
    name: '',
    age: '',
    healthConditions: []
  });
  const [step, setStep] = useState('info'); // 'info', 'enrolling', 'complete'

  const handleStartEnrollment = (e) => {
    e.preventDefault();
    
    if (!userInfo.name.trim()) {
      speak('Please enter your name first.');
      return;
    }

    setStep('enrolling');
    startVoiceEnrollment(userInfo);
  };

  const handleHealthConditionChange = (condition) => {
    setUserInfo(prev => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(condition)
        ? prev.healthConditions.filter(c => c !== condition)
        : [...prev.healthConditions, condition]
    }));
  };

  if (step === 'enrolling') {
    return (
      <div className="voice-enrollment">
        <div className="enrollment-card">
          <h2>Voice Enrollment in Progress</h2>
          <div className="enrollment-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(enrollmentStep / enrollmentPhrases.length) * 100}%` }}
              />
            </div>
            <p>Step {enrollmentStep + 1} of {enrollmentPhrases.length}</p>
          </div>
          
          {enrollmentStep < enrollmentPhrases.length && (
            <div className="current-phrase">
              <h3>Please say:</h3>
              <p className="phrase-text">"{enrollmentPhrases[enrollmentStep]}"</p>
            </div>
          )}
          
          <div className="enrollment-tips">
            <h4>Tips for better voice recognition:</h4>
            <ul>
              <li>Speak clearly and at normal volume</li>
              <li>Minimize background noise</li>
              <li>Use your natural speaking voice</li>
              <li>Wait for the prompt before speaking</li>
            </ul>
          </div>
          
          <button onClick={onCancel} className="cancel-btn">
            Cancel Enrollment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-enrollment">
      <div className="enrollment-card">
        <h2>Set Up Voice Authentication</h2>
        <p>Create a secure voice profile for password-free access to VoiceCart.</p>
        
        <form onSubmit={handleStartEnrollment}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              value={userInfo.name}
              onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="age">Age (Optional)</label>
            <input
              type="number"
              id="age"
              value={userInfo.age}
              onChange={(e) => setUserInfo(prev => ({ ...prev, age: e.target.value }))}
              placeholder="Your age"
              min="18"
              max="120"
            />
          </div>
          
          <div className="form-group">
            <label>Health Conditions (Optional - for better recommendations)</label>
            <div className="health-conditions">
              {['diabetes', 'hypertension', 'arthritis', 'heart_condition', 'none'].map(condition => (
                <label key={condition} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={userInfo.healthConditions.includes(condition)}
                    onChange={() => handleHealthConditionChange(condition)}
                  />
                  <span>{condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="enrollment-info">
            <h4>What happens during enrollment:</h4>
            <ol>
              <li>You'll be asked to repeat 5 different phrases</li>
              <li>Your voice patterns will be securely stored locally</li>
              <li>No voice data is sent to external servers</li>
              <li>You can reset your voice profile anytime</li>
            </ol>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="start-enrollment-btn">
              🎤 Start Voice Enrollment
            </button>
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoiceEnrollment;