import React, { createContext, useContext, useState, useEffect } from 'react';

const VoiceContext = createContext();

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};

export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  // Removed offline mode for simplicity

  useEffect(() => {
    console.log('Initializing Voice API...');
    
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 1;
      
      // Configure for better offline/network handling
      try {
        // Try to set service URI to local if available (Chrome specific)
        if (recognitionInstance.serviceURI !== undefined) {
          recognitionInstance.serviceURI = '';
        }
      } catch (e) {
        console.log('Cannot configure offline mode, using default');
      }
      
      console.log('Speech Recognition initialized');
      setRecognition(recognitionInstance);
    } else {
      console.error('Speech Recognition not supported in this browser');
    }

    if ('speechSynthesis' in window) {
      console.log('Speech Synthesis initialized');
      setSynthesis(window.speechSynthesis);
      
      // Preload voices to avoid delays
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          console.log('Voices loaded:', window.speechSynthesis.getVoices().length);
        });
      }
    } else {
      console.error('Speech Synthesis not supported in this browser');
    }
  }, []);

  const startListening = (onResult, onError) => {
    console.log('=== STARTING VOICE RECOGNITION ===');
    console.log('Recognition available:', !!recognition);
    console.log('Current listening state:', isListening);
    
    if (!recognition) {
      console.error('Recognition not available');
      onError && onError('Speech recognition not supported');
      return;
    }

    // Force stop any existing recognition
    try {
      recognition.abort();
      recognition.stop();
    } catch (e) {
      console.log('No existing recognition to stop');
    }

    // Wait a moment before starting new recognition
    setTimeout(() => {
      console.log('Setting up fresh recognition handlers...');
      setIsListening(true);
      
      // Set up event handlers
      recognition.onstart = (event) => {
        console.log('✅ Speech recognition STARTED successfully', event);
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        console.log('✅ Speech recognition RESULT received:', event);
        console.log('Results array:', event.results);
        
        if (event.results && event.results.length > 0) {
          const result = event.results[0][0];
          const transcript = result.transcript;
          const confidence = result.confidence || 0.9;
          
          console.log('📝 TRANSCRIPT:', transcript);
          console.log('🎯 CONFIDENCE:', confidence);
          
          setIsListening(false);
          
          // Call the result handler
          if (onResult) {
            console.log('🚀 Calling onResult with transcript:', transcript);
            onResult(transcript);
          }
        } else {
          console.log('❌ No results in event');
          setIsListening(false);
          onError && onError('no-speech');
        }
      };

      recognition.onerror = (event) => {
        console.error('❌ Speech recognition ERROR:', event.error, event);
        setIsListening(false);
        
        // Handle specific errors
        if (event.error === 'network') {
          console.log('Network error detected');
        }
        
        if (onError) {
          console.log('🚨 Calling onError with:', event.error);
          onError(event.error);
        }
      };

      recognition.onend = (event) => {
        console.log('🔚 Speech recognition ENDED', event);
        setIsListening(false);
      };

      recognition.onnomatch = (event) => {
        console.log('🤷 No match found', event);
        setIsListening(false);
        onError && onError('no-match');
      };

      recognition.onspeechstart = (event) => {
        console.log('🎤 Speech detected, processing...', event);
      };

      recognition.onspeechend = (event) => {
        console.log('🔇 Speech ended', event);
      };

      // Start recognition
      try {
        console.log('🎬 STARTING recognition.start()...');
        recognition.start();
        console.log('✅ recognition.start() called successfully');
      } catch (error) {
        console.error('💥 Error calling recognition.start():', error);
        setIsListening(false);
        onError && onError(error.message);
      }
    }, 200); // Increased delay to ensure clean start
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const speak = (text, options = {}) => {
    if (!synthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.8; // Slower for seniors
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }

    synthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel();
    }
  };

  // Offline mode removed for simplicity - focusing on core voice recognition

  const value = {
    isListening,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported: !!recognition && !!synthesis
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};