import React, { useState } from 'react';
import { useVoice } from '../context/VoiceContext';

const VoiceTest = () => {
  const { isListening, startListening, speak, isSupported } = useVoice();
  const [lastTranscript, setLastTranscript] = useState('');
  const [testResults, setTestResults] = useState([]);

  const runVoiceTest = () => {
    console.log('=== RUNNING VOICE TEST ===');
    
    if (!isSupported) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    speak('Voice test starting. Please say hello when you hear the beep.');
    
    setTimeout(() => {
      // Make a beep sound
      speak('Beep');
      
      setTimeout(() => {
        console.log('Starting listening for test...');
        
        startListening(
          (transcript) => {
            console.log('TEST RESULT - Transcript:', transcript);
            setLastTranscript(transcript);
            
            const result = {
              timestamp: new Date().toLocaleTimeString(),
              transcript: transcript,
              success: true
            };
            
            setTestResults(prev => [result, ...prev.slice(0, 4)]);
            speak(`I heard you say: ${transcript}`);
          },
          (error) => {
            console.error('TEST ERROR:', error);
            
            const result = {
              timestamp: new Date().toLocaleTimeString(),
              transcript: `Error: ${error}`,
              success: false
            };
            
            setTestResults(prev => [result, ...prev.slice(0, 4)]);
            speak(`Voice test failed with error: ${error}`);
          }
        );
      }, 1000);
    }, 2000);
  };

  const testSpeech = () => {
    speak('Speech synthesis test. If you can hear this, speech output is working correctly.');
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      zIndex: 1000
    }}>
      {/* Small debug button */}
      <button 
        onClick={runVoiceTest} 
        disabled={isListening}
        style={{
          background: isSupported ? '#008080' : '#ccc',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: isListening ? 'not-allowed' : 'pointer',
          marginBottom: '5px',
          display: 'block'
        }}
        title="Quick voice test - say 'hello'"
      >
        {isListening ? '🎤 Listening...' : '🎤 Test Voice'}
      </button>
      
      {/* Small speech test button */}
      <button 
        onClick={testSpeech}
        style={{
          background: '#666',
          color: 'white',
          border: 'none',
          padding: '6px 10px',
          borderRadius: '4px',
          fontSize: '11px',
          cursor: 'pointer'
        }}
        title="Test speech output"
      >
        🔊 TTS
      </button>
      
      {/* Show last result if any */}
      {lastTranscript && (
        <div style={{
          marginTop: '5px',
          padding: '4px 6px',
          background: '#e8f5e8',
          borderRadius: '3px',
          fontSize: '10px',
          maxWidth: '120px',
          wordBreak: 'break-word'
        }}>
          ✅ "{lastTranscript}"
        </div>
      )}
    </div>
  );
};

export default VoiceTest;