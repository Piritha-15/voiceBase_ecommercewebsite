import React, { createContext, useContext, useState, useCallback } from 'react';

const SpeechCoordinationContext = createContext();

export const useSpeechCoordination = () => {
  const context = useContext(SpeechCoordinationContext);
  if (!context) {
    throw new Error('useSpeechCoordination must be used within a SpeechCoordinationProvider');
  }
  return context;
};

export const SpeechCoordinationProvider = ({ children }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeRecognition, setActiveRecognition] = useState(null);
  const [recognitionState, setRecognitionState] = useState('stopped'); // 'stopped', 'starting', 'running', 'stopping'

  // Coordinated speech function that pauses voice recognition
  const coordinatedSpeak = useCallback((text, options = {}) => {
    if (!text || text.trim() === '') {
      console.log('❌ Empty text, skipping speech');
      return Promise.resolve();
    }

    if (!('speechSynthesis' in window)) {
      console.error('❌ Speech synthesis not supported');
      return Promise.reject(new Error('Speech synthesis not supported'));
    }

    return new Promise((resolve, reject) => {
      console.log('🔊 COORDINATED SPEECH:', text);

      // AGGRESSIVELY PAUSE voice recognition during speech
      if (isListening && activeRecognition && recognitionState === 'running') {
        console.log('⏸️ AGGRESSIVELY pausing voice recognition for speech...');
        try {
          setRecognitionState('stopping');
          // Use both stop and abort for complete shutdown
          activeRecognition.stop();
          activeRecognition.abort();
          setIsListening(false);
          console.log('✅ Voice recognition completely stopped for speech');
        } catch (error) {
          console.log('Note: Could not pause recognition:', error.message);
          setRecognitionState('stopped');
        }
      }

      setIsSpeaking(true);

      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Wait longer for cancellation and recognition stopping to complete
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = options.rate || 0.9;
          utterance.pitch = options.pitch || 1.0;
          utterance.volume = options.volume || 1.0;
          utterance.lang = options.lang || 'en-US';
          
          // Get best available voice
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            const englishVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
            utterance.voice = englishVoice;
            console.log('🎤 Using coordinated voice:', englishVoice.name);
          }

          utterance.onstart = () => {
            console.log('✅ COORDINATED SPEECH STARTED');
          };
          
          utterance.onend = () => {
            console.log('✅ COORDINATED SPEECH COMPLETED');
            setIsSpeaking(false);
            
            // RESUME voice recognition after speech completes with proper timing
            if (activeRecognition && recognitionState === 'stopping') {
              console.log('▶️ Resuming voice recognition after coordinated speech...');
              setTimeout(() => {
                if (activeRecognition && recognitionState === 'stopping') {
                  try {
                    console.log('🔄 Attempting to restart recognition after 2 second delay...');
                    setRecognitionState('starting');
                    activeRecognition.start();
                    setIsListening(true);
                    setRecognitionState('running');
                  } catch (error) {
                    console.log('Note: Could not resume recognition:', error.message);
                    setRecognitionState('stopped');
                  }
                }
              }, 2000); // Much longer delay - 2 seconds to ensure no interference
            }
            
            resolve();
          };
          
          utterance.onerror = (event) => {
            console.error('❌ COORDINATED SPEECH ERROR:', event.error);
            setIsSpeaking(false);
            
            // Resume voice recognition even on error with proper state management
            if (activeRecognition && recognitionState === 'stopping') {
              setTimeout(() => {
                if (activeRecognition && recognitionState === 'stopping') {
                  try {
                    console.log('🔄 Restarting recognition after speech error with 2 second delay...');
                    setRecognitionState('starting');
                    activeRecognition.start();
                    setIsListening(true);
                    setRecognitionState('running');
                  } catch (error) {
                    console.log('Note: Could not resume recognition after error:', error.message);
                    setRecognitionState('stopped');
                  }
                }
              }, 2000); // 2 second delay for error recovery too
            }
            
            reject(new Error(event.error));
          };

          console.log('🔊 STARTING COORDINATED SPEECH...');
          window.speechSynthesis.speak(utterance);
          
        }, 300); // Longer delay before starting speech
        
      } catch (error) {
        console.error('❌ COORDINATED SPEECH EXCEPTION:', error);
        setIsSpeaking(false);
        reject(error);
      }
    });
  }, [isListening, activeRecognition, recognitionState]);

  // Register voice recognition instance
  const registerRecognition = useCallback((recognition) => {
    console.log('📝 Registering voice recognition for coordination');
    setActiveRecognition(recognition);
    setRecognitionState('stopped');
  }, []);

  // Unregister voice recognition instance
  const unregisterRecognition = useCallback(() => {
    console.log('📝 Unregistering voice recognition');
    setActiveRecognition(null);
    setIsListening(false);
    setRecognitionState('stopped');
  }, []);

  // Set listening state with proper state management
  const setListeningState = useCallback((listening) => {
    setIsListening(listening);
    if (listening) {
      setRecognitionState('running');
    } else {
      setRecognitionState('stopped');
    }
  }, []);

  // Set recognition state
  const setRecognitionStateExternal = useCallback((state) => {
    setRecognitionState(state);
  }, []);

  const value = {
    isSpeaking,
    isListening,
    recognitionState,
    coordinatedSpeak,
    registerRecognition,
    unregisterRecognition,
    setListeningState,
    setRecognitionState: setRecognitionStateExternal
  };

  return (
    <SpeechCoordinationContext.Provider value={value}>
      {children}
    </SpeechCoordinationContext.Provider>
  );
};