import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleVoiceButton = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [lastCommand, setLastCommand] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate();

  // Initialize speech recognition and synthesis
  useEffect(() => {
    console.log('🎤 Initializing Simple Voice System...');
    
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      console.log('✅ Speech Recognition initialized');
      setRecognition(recognitionInstance);
    } else {
      console.error('❌ Speech Recognition not supported');
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      console.log('✅ Speech Synthesis available');
      const synth = window.speechSynthesis;
      
      // Load voices if not already loaded
      const loadVoices = () => {
        const voices = synth.getVoices();
        console.log('📢 Available voices:', voices.length);
        setSynthesis(synth);
      };
      
      if (synth.getVoices().length > 0) {
        loadVoices();
      } else {
        synth.addEventListener('voiceschanged', loadVoices);
      }
    } else {
      console.error('❌ Speech Synthesis not supported');
    }
  }, []);

  // Robust speak function that handles common speech synthesis issues
  const speak = (text) => {
    console.log('🔊 Attempting to speak:', text);
    
    if (!synthesis) {
      console.error('❌ No speech synthesis available');
      console.log('📢 Fallback: Showing text instead of speaking:', text);
      return;
    }

    try {
      // Cancel any ongoing speech
      synthesis.cancel();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Try to use a specific voice if available
      const voices = synthesis.getVoices();
      if (voices.length > 0) {
        // Prefer English voices
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
          console.log('🎤 Using voice:', englishVoice.name);
        }
      }
      
      utterance.onstart = () => {
        console.log('✅ Speech started successfully:', text);
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log('✅ Speech completed:', text);
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('❌ Speech synthesis error:', event.error, event);
        setIsSpeaking(false);
        
        // Don't show alert for speech errors, just log them
        console.log('📢 Speech failed, continuing without audio feedback');
      };
      
      console.log('🔊 Starting speech synthesis...');
      
      // Use a small delay to ensure the synthesis is ready
      setTimeout(() => {
        if (synthesis.speaking) {
          synthesis.cancel();
        }
        synthesis.speak(utterance);
      }, 50);
      
    } catch (error) {
      console.error('❌ Speech synthesis exception:', error);
      setIsSpeaking(false);
      // Don't show alert, just continue without speech
      console.log('📢 Speech synthesis failed, continuing silently');
    }
  };

  // Process voice commands
  const processCommand = (transcript) => {
    console.log('🎯 Processing command:', transcript);
    const command = transcript.toLowerCase().trim();
    setLastCommand(transcript);

    // Test commands
    if (command.includes('hello') || command.includes('test')) {
      speak('Hello! Voice recognition is working perfectly!');
      return;
    }

    // Navigation commands
    if (command.includes('home')) {
      speak('Going to home page');
      navigate('/');
      return;
    }

    if (command.includes('cart')) {
      speak('Opening your cart');
      navigate('/cart');
      return;
    }

    // Search commands
    if (command.includes('search') || command.includes('find')) {
      let searchTerm = '';
      
      if (command.includes('search for')) {
        searchTerm = command.replace('search for', '').trim();
      } else if (command.includes('find')) {
        searchTerm = command.replace('find', '').trim();
      } else if (command.includes('search')) {
        searchTerm = command.replace('search', '').trim();
      }

      if (searchTerm) {
        speak(`Searching for ${searchTerm}`);
        navigate(`/?search=${encodeURIComponent(searchTerm)}`);
      } else {
        speak('What would you like to search for?');
      }
      return;
    }

    // Category navigation
    if (command.includes('health')) {
      speak('Opening health category');
      navigate('/category/health');
      return;
    }

    if (command.includes('nutrition')) {
      speak('Opening nutrition category');
      navigate('/category/nutrition');
      return;
    }

    // Help
    if (command.includes('help')) {
      speak('You can say: hello, go home, show cart, search for vitamins, health category, or help');
      return;
    }

    // Default response
    speak(`I heard: ${transcript}. Try saying: hello, go home, show cart, or search for vitamins`);
  };

  // Start voice recognition
  const startListening = () => {
    console.log('🎤 Starting voice recognition...');
    
    if (!recognition) {
      alert('Voice recognition not supported in this browser. Please use Chrome.');
      return;
    }

    if (isListening) {
      console.log('Already listening...');
      return;
    }

    setIsListening(true);
    speak('I am listening. Please speak now.');

    // Set up event handlers
    recognition.onstart = () => {
      console.log('✅ Voice recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      console.log('📝 Voice result received:', event);
      
      if (event.results && event.results.length > 0) {
        const transcript = event.results[0][0].transcript;
        console.log('📝 Transcript:', transcript);
        
        setIsListening(false);
        processCommand(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Voice recognition error:', event.error);
      setIsListening(false);
      
      let errorMsg = 'Voice recognition error. ';
      
      switch (event.error) {
        case 'not-allowed':
          errorMsg += 'Please allow microphone access.';
          break;
        case 'no-speech':
          errorMsg += 'No speech detected. Please try again.';
          break;
        case 'network':
          errorMsg += 'Network error. Check your internet connection.';
          break;
        default:
          errorMsg += 'Please try again.';
      }
      
      speak(errorMsg);
    };

    recognition.onend = () => {
      console.log('🔚 Voice recognition ended');
      setIsListening(false);
    };

    // Start recognition
    try {
      recognition.start();
    } catch (error) {
      console.error('❌ Error starting recognition:', error);
      setIsListening(false);
      speak('Error starting voice recognition. Please try again.');
    }
  };

  // Test speech synthesis
  const testSpeech = () => {
    console.log('🔊 Testing speech synthesis...');
    speak('Speech synthesis is working correctly. You can now use voice commands.');
  };

  // Speech synthesis ready (removed auto-test to prevent errors)
  useEffect(() => {
    if (synthesis) {
      console.log('🔊 Speech synthesis ready');
    }
  }, [synthesis]);

  if (!recognition || !synthesis) {
    return null; // Don't show button if not supported
  }

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {/* Main voice button */}
      <button
        onClick={startListening}
        disabled={isListening}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: isListening ? '#e53e3e' : '#008080',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: isListening ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          animation: isListening ? 'pulse 1s infinite' : 'none'
        }}
        title={isListening ? 'Listening...' : 'Click to use voice commands'}
      >
        🎤
      </button>

      {/* Test speech button */}
      <button
        onClick={testSpeech}
        style={{
          position: 'absolute',
          bottom: '70px',
          right: '0px',
          padding: '8px 12px',
          backgroundColor: '#666',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
        title="Test speech output"
      >
        🔊 Test
      </button>

      {/* Status display */}
      {(isListening || lastCommand || isSpeaking) && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          right: '60px',
          background: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          maxWidth: '200px'
        }}>
          {isSpeaking ? '🔊 Speaking...' : 
           isListening ? '🎤 Listening...' : 
           `✅ "${lastCommand}"`}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SimpleVoiceButton;