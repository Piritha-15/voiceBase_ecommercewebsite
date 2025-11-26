import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoiceNarration } from '../context/VoiceNarrationContext';
import { useSpeechCoordination } from '../context/SpeechCoordinationContext';

const BasicVoiceButton = () => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isCurrentlyListening, setIsCurrentlyListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [lastCommand, setLastCommand] = useState('');
  const [status, setStatus] = useState('Ready');
  const [restartTimeout, setRestartTimeout] = useState(null);
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [lastSpeechTime, setLastSpeechTime] = useState(0);
  const [lastProcessedCommand, setLastProcessedCommand] = useState('');
  const [lastCommandTime, setLastCommandTime] = useState(0);
  const isVoiceActiveRef = useRef(false); // Use ref for reliable state in callbacks
  const navigate = useNavigate();
  const { isNarrationEnabled, toggleNarration } = useVoiceNarration();

  // Independent narration toggle (separate from voice recognition)
  const handleNarrationToggle = () => {
    console.log('📢 Read-aloud button clicked (INDEPENDENT), current state:', isNarrationEnabled);
    const wasEnabled = isNarrationEnabled;
    toggleNarration();

    // Provide immediate audio feedback (independent of voice recognition)
    setTimeout(() => {
      if (wasEnabled) {
        console.log('📢 Turning OFF read-aloud system (INDEPENDENT)');
        speak('Read-aloud system off');
      } else {
        console.log('📢 Turning ON read-aloud system (INDEPENDENT)');
        speak('Read-aloud system on');
      }
    }, 100);
  };
  const { coordinatedSpeak, isSpeaking } = useSpeechCoordination();

  // Simple and reliable voice recognition test
  const testVoiceRecognition = () => {
    console.log('🎤 SIMPLE VOICE RECOGNITION TEST...');

    // Check basic support
    if (!('webkitSpeechRecognition' in window)) {
      alert('❌ Voice recognition not supported. Please use Chrome browser.');
      return;
    }

    console.log('✅ Voice recognition API available');

    // Request microphone permission first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log('✅ Microphone permission granted');
          startSimpleVoiceTest();
        })
        .catch((error) => {
          console.error('❌ Microphone permission denied:', error);
          alert('❌ Please allow microphone access and try again.');
        });
    } else {
      // Try without explicit permission request
      startSimpleVoiceTest();
    }
  };

  // Start a simple voice recognition test
  const startSimpleVoiceTest = () => {
    try {
      console.log('🎤 Creating simple voice recognition test...');

      const testRecognition = new window.webkitSpeechRecognition();
      testRecognition.continuous = false;
      testRecognition.interimResults = false;
      testRecognition.lang = 'en-US';

      let testStarted = false;

      testRecognition.onstart = () => {
        console.log('✅ VOICE TEST STARTED');
        testStarted = true;
        alert('🎤 Voice test started! Say "hello" clearly now.');
      };

      testRecognition.onresult = (event) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript.toLowerCase().trim();
          const confidence = event.results[0][0].confidence;
          console.log('✅ VOICE TEST SUCCESS:', transcript, confidence);
          alert(`✅ Voice recognition WORKING! Heard: "${transcript}" (confidence: ${confidence.toFixed(2)})`);
        }
      };

      testRecognition.onerror = (event) => {
        console.error('❌ VOICE TEST ERROR:', event.error);
        let errorMsg = 'Voice recognition error: ';
        switch (event.error) {
          case 'not-allowed':
            errorMsg += 'Microphone access denied. Please allow microphone access.';
            break;
          case 'no-speech':
            errorMsg += 'No speech detected. Please speak louder and try again.';
            break;
          case 'network':
            errorMsg += 'Network error. Please check your internet connection.';
            break;
          default:
            errorMsg += event.error;
        }
        alert(`❌ ${errorMsg}`);
      };

      testRecognition.onend = () => {
        console.log('🔚 Voice test ended');
        if (!testStarted) {
          alert('❌ Voice recognition failed to start. Please check microphone permissions.');
        }
      };

      console.log('🎤 Starting voice recognition test...');
      testRecognition.start();

    } catch (error) {
      console.error('❌ Exception starting voice test:', error);
      alert(`❌ Error: ${error.message}. Please use Chrome browser.`);
    }
  };

  // Initialize speech recognition and synthesis
  useEffect(() => {
    console.log('🎤 Initializing Voice System...');

    // Check speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true; // Enable continuous recognition
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      console.log('✅ Speech Recognition initialized for continuous mode');
      setRecognition(recognitionInstance);
    } else {
      console.error('❌ Speech Recognition not supported');
      setStatus('Recognition Not Supported');
      return;
    }

    // Check speech synthesis
    if ('speechSynthesis' in window) {
      console.log('✅ Speech Synthesis available');

      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('🎤 Loaded voices:', voices.length);
        if (voices.length > 0) {
          setStatus('Voice Ready - Narration Auto-Enabled');
        } else {
          setStatus('Loading voices...');
        }
      };

      // Load voices immediately if available
      loadVoices();

      // Also listen for voice loading event
      window.speechSynthesis.onvoiceschanged = loadVoices;
    } else {
      console.error('❌ Speech Synthesis not supported');
      setStatus('Speech Not Supported');
    }
  }, []);

  // Completely independent speech function (NO coordination with voice recognition)
  const speak = (text) => {
    if (!text || text.trim() === '') {
      console.log('❌ Empty text, skipping speech');
      return;
    }

    const currentTime = Date.now();
    const normalizedText = text.toLowerCase().trim();

    // Prevent exact duplicate speech within 2 seconds
    if (lastSpokenText === normalizedText && (currentTime - lastSpeechTime) < 2000) {
      console.log('🚫 DUPLICATE SPEECH BLOCKED:', text);
      return;
    }

    console.log('🔊 INDEPENDENT SPEECH (NO COORDINATION):', text);
    setLastSpokenText(normalizedText);
    setLastSpeechTime(currentTime);

    // Simple speech synthesis - completely independent from voice recognition
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      utterance.onend = () => {
        console.log('✅ Speech completed (no coordination)');
      };

      utterance.onerror = (error) => {
        console.error('❌ Speech error:', error);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('❌ Speech synthesis error:', error);
    }
  };

  // Fuzzy matching function for better speech recognition
  const fuzzyMatch = (text, patterns) => {
    const normalizedText = text.toLowerCase().replace(/[^a-z\s]/g, '').trim();

    for (const pattern of patterns) {
      if (normalizedText.includes(pattern)) {
        return true;
      }
    }

    // Check for phonetic similarities
    for (const pattern of patterns) {
      const words = normalizedText.split(' ');
      for (const word of words) {
        if (isPhoneticallySimilar(word, pattern)) {
          return true;
        }
      }
    }

    return false;
  };

  // Check if words sound similar (basic phonetic matching)
  const isPhoneticallySimilar = (word1, word2) => {
    // Handle common speech recognition errors
    const phoneticMap = {
      'cart': ['cart', 'caret', 'card', 'cat', 'cot', 'cut', 'kart', 'part'],
      'move': ['move', 'moo', 'mood', 'mote', 'mot', 'mu'],
      'go': ['go', 'goo', 'got', 'good'],
      'show': ['show', 'so', 'shoe', 'shaw'],
      'open': ['open', 'opin', 'upon']
    };

    for (const [key, variants] of Object.entries(phoneticMap)) {
      if (variants.includes(word1) && variants.includes(word2)) {
        return true;
      }
      if (key === word2 && variants.includes(word1)) {
        return true;
      }
      if (key === word1 && variants.includes(word2)) {
        return true;
      }
    }

    return false;
  };

  // Process voice commands with improved fuzzy matching and duplicate prevention
  const processCommand = (transcript) => {
    console.log('🎯 Processing command:', transcript);
    const command = transcript.toLowerCase().trim();
    const currentTime = Date.now();

    // Prevent processing the same command within 1 second (less aggressive)
    if (lastProcessedCommand === command && (currentTime - lastCommandTime) < 1000) {
      console.log('🚫 DUPLICATE COMMAND BLOCKED:', command);
      return;
    }

    // Update command tracking
    setLastProcessedCommand(command);
    setLastCommandTime(currentTime);
    setLastCommand(transcript);
    setStatus(`Heard: "${transcript}"`);

    // Test commands
    if (fuzzyMatch(command, ['hello', 'test', 'helo', 'tast'])) {
      console.log('✅ Test command recognized');
      setStatus('✅ Voice Working!');
      speak('Hello! Voice recognition is working perfectly!');
      return;
    }

    // Cart commands with fuzzy matching for common mishearings
    const cartPatterns = [
      'cart', 'show cart', 'open cart', 'go to cart', 'move to cart',
      'caret', 'card', 'cat', 'cot', 'kart', 'part', // Common mishearings
      'motu capet', 'moto cart', 'motor cart', 'motu cart', // Specific mishearings you mentioned
      'shopping cart', 'my cart', 'view cart'
    ];

    if (fuzzyMatch(command, cartPatterns) ||
      command.includes('cart') ||
      command.includes('caret') ||
      command.includes('motu') ||
      (command.includes('move') && (command.includes('cart') || command.includes('capet')))) {
      console.log('🛒 Cart command recognized (fuzzy match)');
      setStatus('Opening cart');
      speak('Opening your shopping cart');
      setTimeout(() => navigate('/cart'), 1000);
      return;
    }

    // Home navigation with fuzzy matching
    const homePatterns = ['home', 'go home', 'home page', 'main page', 'hom', 'ohm'];
    if (fuzzyMatch(command, homePatterns)) {
      console.log('🏠 Navigating to home');
      setStatus('Going to home');
      speak('Going to home page');
      setTimeout(() => navigate('/'), 1000);
      return;
    }

    // Search commands with fuzzy matching
    const searchPatterns = ['search', 'find', 'look for', 'serch', 'fined', 'surch'];
    if (fuzzyMatch(command, searchPatterns)) {
      let searchTerm = '';

      // Extract search term with multiple patterns
      const searchPrefixes = ['search for', 'find', 'look for', 'search', 'serch for', 'fined'];
      for (const prefix of searchPrefixes) {
        if (command.includes(prefix)) {
          searchTerm = command.replace(prefix, '').trim();
          break;
        }
      }

      if (searchTerm) {
        console.log('🔍 Searching for:', searchTerm);
        setStatus(`Searching: ${searchTerm}`);
        speak(`Searching for ${searchTerm}`);
        setTimeout(() => navigate(`/?search=${encodeURIComponent(searchTerm)}`), 1000);
      } else {
        setStatus('What to search?');
        speak('What would you like to search for?');
      }
      return;
    }

    // Health category with fuzzy matching
    const healthPatterns = ['health', 'health category', 'go to health', 'helth', 'helt', 'medical'];
    if (fuzzyMatch(command, healthPatterns)) {
      console.log('🏥 Opening health category');
      setStatus('Health category');
      speak('Opening health products category');
      setTimeout(() => navigate('/category/health'), 1000);
      return;
    }

    // Nutrition category with fuzzy matching
    const nutritionPatterns = ['nutrition', 'nutrition category', 'go to nutrition', 'nutriton', 'food', 'vitamins'];
    if (fuzzyMatch(command, nutritionPatterns)) {
      console.log('🥗 Opening nutrition category');
      setStatus('Nutrition category');
      speak('Opening nutrition products category');
      setTimeout(() => navigate('/category/nutrition'), 1000);
      return;
    }

    // Help command with fuzzy matching
    const helpPatterns = ['help', 'what can i say', 'commands', 'what to say', 'halp', 'elp'];
    if (fuzzyMatch(command, helpPatterns)) {
      console.log('❓ Help requested');
      setStatus('Help available');
      speak('You can say: hello, go home, show cart, search for vitamins, health category, nutrition category, or help');
      return;
    }

    // Additional common commands
    // Checkout command
    const checkoutPatterns = ['checkout', 'check out', 'pay now', 'payment', 'chekout'];
    if (fuzzyMatch(command, checkoutPatterns)) {
      console.log('💳 Going to checkout');
      setStatus('Going to checkout');
      speak('Going to checkout');
      setTimeout(() => navigate('/checkout'), 1000);
      return;
    }

    // Back command
    const backPatterns = ['go back', 'back', 'previous', 'return', 'bak'];
    if (fuzzyMatch(command, backPatterns)) {
      console.log('⬅️ Going back');
      setStatus('Going back');
      speak('Going back');
      setTimeout(() => window.history.back(), 1000);
      return;
    }

    // Default response
    console.log('❓ Unknown command:', command);
    setStatus(`Unknown: "${transcript}"`);
    speak(`I heard ${transcript}, but I don't understand that command. Try saying hello, go home, show cart, or search for something.`);
  };

  // Removed complex setupContinuousRecognition - using simpler approach

  // Simple voice recognition toggle
  const toggleVoiceRecognition = async () => {
    console.log('🎤 Voice recognition button clicked, current state:', isVoiceActive);

    if (!recognition) {
      alert('❌ Voice recognition not supported. Please use Chrome browser.');
      return;
    }

    if (isVoiceActive) {
      // Turn OFF voice recognition
      console.log('🔇 Turning OFF voice recognition');
      setIsVoiceActive(false);
      isVoiceActiveRef.current = false; // Update ref
      setIsCurrentlyListening(false);
      setStatus('Voice OFF');

      // Clear any restart timeout
      if (restartTimeout) {
        clearTimeout(restartTimeout);
        setRestartTimeout(null);
      }

      try {
        recognition.stop();
        recognition.abort();
      } catch (error) {
        console.log('Note: Error stopping recognition:', error.message);
      }

      speak('Voice recognition turned off');

    } else {
      // Turn ON voice recognition
      console.log('🔊 Turning ON voice recognition');

      try {
        // Request microphone permission
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('✅ Microphone permission granted');
        }
      } catch (error) {
        console.error('❌ Microphone permission denied:', error);
        alert('❌ Please allow microphone access to use voice commands.');
        return;
      }

      setIsVoiceActive(true);
      isVoiceActiveRef.current = true; // Update ref
      setStatus('Voice ON');

      // Setup simple continuous recognition
      setupContinuousRecognition();

      speak('Voice recognition activated. Say hello to test.');
    }
  };

  // Simple continuous recognition setup
  const setupContinuousRecognition = () => {
    if (!recognition) return;

    console.log('🎤 Setting up SIMPLE continuous recognition...');

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('✅ Simple voice recognition started');
      setIsCurrentlyListening(true);
      setStatus('🎤 Listening...');
    };

    recognition.onresult = (event) => {
      console.log('📝 Voice result received');

      if (event.results && event.results.length > 0) {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        console.log('📝 Transcript:', transcript, 'Confidence:', confidence);

        processCommand(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Voice recognition error:', event.error);
      setIsCurrentlyListening(false);

      if (event.error === 'not-allowed') {
        alert('❌ Microphone access denied. Please allow microphone access.');
        setIsVoiceActive(false);
        setStatus('Voice OFF - Permission Denied');
        return;
      } else if (event.error === 'no-speech') {
        console.log('⚠️ No speech detected, will auto-restart...');
        setStatus('🎤 Waiting for speech...');
      } else {
        console.log('⚠️ Voice error:', event.error, 'will auto-restart...');
        setStatus(`⚠️ ${event.error} - restarting...`);
      }
    };

    recognition.onend = () => {
      console.log('🔚 Voice recognition ended, isVoiceActiveRef:', isVoiceActiveRef.current);
      setIsCurrentlyListening(false);

      // Reliable auto-restart using ref
      if (isVoiceActiveRef.current) {
        console.log('🔄 Auto-restarting voice recognition...');
        setStatus('🔄 Restarting...');

        // Clear any existing restart timeout
        if (restartTimeout) {
          clearTimeout(restartTimeout);
        }

        // Restart with shorter, more reliable timing
        const timeout = setTimeout(() => {
          if (isVoiceActiveRef.current) {
            try {
              console.log('🎬 Restarting recognition...');
              recognition.start();
              setIsCurrentlyListening(true);
              setStatus('🎤 Listening...');
            } catch (error) {
              console.log('Could not restart recognition:', error.message);
              if (error.message.includes('already started')) {
                console.log('ℹ️ Recognition already running');
                setIsCurrentlyListening(true);
                setStatus('🎤 Listening...');
              } else {
                console.log('⚠️ Restart failed, trying once more...');
                setStatus('🔄 Retrying...');
                // One more try with longer delay
                setTimeout(() => {
                  if (isVoiceActiveRef.current) {
                    try {
                      recognition.start();
                      setIsCurrentlyListening(true);
                      setStatus('🎤 Listening...');
                    } catch (retryError) {
                      console.log('Final retry failed:', retryError.message);
                      setStatus('❌ Voice recognition stopped');
                      setIsVoiceActive(false);
                      isVoiceActiveRef.current = false;
                    }
                  }
                }, 1000);
              }
            }
          }
        }, 500); // Even faster restart

        setRestartTimeout(timeout);
      } else {
        setStatus('Voice OFF');
      }
    };

    // Start recognition
    try {
      console.log('🎬 Starting simple recognition...');
      recognition.start();
    } catch (error) {
      console.error('❌ Error starting recognition:', error);
      if (error.message.includes('already started')) {
        console.log('ℹ️ Recognition already running');
        setIsCurrentlyListening(true);
        setStatus('🎤 Listening...');
      } else {
        alert(`❌ Error starting voice recognition: ${error.message}`);
        setIsVoiceActive(false);
        setStatus('Voice OFF');
      }
    }
  };

  if (!recognition) {
    return (
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
        <div style={{
          background: '#ff6b6b',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          Voice not supported.<br />Please use Chrome browser.
        </div>
      </div>
    );
  }

  // Comprehensive test speech function
  const testSpeech = () => {
    console.log('🔊 COMPREHENSIVE SPEECH TEST...');

    // Check browser support
    if (!('speechSynthesis' in window)) {
      alert('❌ Speech synthesis not supported. Please use Chrome browser.');
      return;
    }

    // Check voices
    const voices = window.speechSynthesis.getVoices();
    console.log('🎤 SPEECH DIAGNOSTICS:');
    console.log('- Available voices:', voices.length);
    console.log('- Narration enabled:', isNarrationEnabled);
    console.log('- Speech synthesis speaking:', window.speechSynthesis.speaking);
    console.log('- Speech synthesis pending:', window.speechSynthesis.pending);

    if (voices.length === 0) {
      console.log('⚠️ No voices loaded, trying to load...');
      // Try to trigger voice loading
      window.speechSynthesis.getVoices();
      setTimeout(() => {
        const newVoices = window.speechSynthesis.getVoices();
        console.log('🎤 Voices after reload:', newVoices.length);
        if (newVoices.length > 0) {
          testActualSpeech();
        } else {
          alert('❌ No voices available. Please refresh the page and try again.');
        }
      }, 1000);
    } else {
      testActualSpeech();
    }
  };

  // Test actual speech synthesis
  const testActualSpeech = () => {
    console.log('🔊 TESTING ACTUAL SPEECH...');

    try {
      // Force cancel any ongoing speech
      window.speechSynthesis.cancel();

      const testText = 'Testing speech synthesis. Can you hear this message clearly?';
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        utterance.voice = voices[0];
        console.log('🎤 Using voice:', voices[0].name);
      }

      utterance.onstart = () => {
        console.log('✅ SPEECH TEST STARTED SUCCESSFULLY');
      };

      utterance.onend = () => {
        console.log('✅ SPEECH TEST COMPLETED SUCCESSFULLY');
      };

      utterance.onerror = (event) => {
        console.error('❌ SPEECH TEST ERROR:', event.error);
        alert(`Speech test failed: ${event.error}`);
      };

      console.log('🔊 STARTING SPEECH TEST...');
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('❌ SPEECH TEST EXCEPTION:', error);
      alert(`Speech test exception: ${error.message}`);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {/* Test voice recognition button */}
      <button
        onClick={testVoiceRecognition}
        style={{
          position: 'absolute',
          bottom: '130px',
          right: '0px',
          width: '40px',
          height: '30px',
          borderRadius: '15px',
          backgroundColor: '#9C27B0',
          color: 'white',
          border: 'none',
          fontSize: '12px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
        title="Test voice recognition"
      >
        🎙️
      </button>

      {/* Voice Read-Aloud System Toggle Button (Prominent) */}
      <button
        onClick={handleNarrationToggle}
        style={{
          position: 'absolute',
          bottom: '100px',
          right: '0px',
          width: '50px',
          height: '40px',
          borderRadius: '20px',
          backgroundColor: isNarrationEnabled ? '#FF9800' : '#666',
          color: 'white',
          border: isNarrationEnabled ? '2px solid #F57C00' : '2px solid #444',
          fontSize: '16px',
          cursor: 'pointer',
          boxShadow: isNarrationEnabled ? '0 4px 12px rgba(255, 152, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s ease',
          fontWeight: 'bold'
        }}
        title={isNarrationEnabled ? 'Turn OFF Read-Aloud (Independent)' : 'Turn ON Read-Aloud (Independent)'}
      >
        {isNarrationEnabled ? '📢' : '🔇'}
      </button>

      {/* Read-Aloud Status Label */}
      {isNarrationEnabled && (
        <div style={{
          position: 'absolute',
          bottom: '145px',
          right: '0px',
          background: '#FF9800',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '9px',
          fontWeight: 'bold',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          READ-ALOUD ON
        </div>
      )}

      {/* Test speech button */}
      <button
        onClick={testSpeech}
        style={{
          position: 'absolute',
          bottom: '70px',
          right: '0px',
          width: '40px',
          height: '30px',
          borderRadius: '15px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          fontSize: '12px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
        title="Test speech output"
      >
        🔊
      </button>

      {/* Main voice toggle button */}
      <button
        onClick={toggleVoiceRecognition}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: isVoiceActive ? '#4CAF50' : '#666',
          color: 'white',
          border: isVoiceActive ? '3px solid #2E7D32' : '3px solid #444',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: isVoiceActive ? '0 4px 15px rgba(76, 175, 80, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
          animation: isCurrentlyListening ? 'pulse 1s infinite' : 'none',
          transition: 'all 0.3s ease'
        }}
        title={isVoiceActive ? 'Turn OFF Voice Recognition (Independent)' : 'Turn ON Voice Recognition (Independent)'}
      >
        {isVoiceActive ? '🎤' : '🔇'}
      </button>

      {/* Status display */}
      <div style={{
        position: 'absolute',
        bottom: '70px',
        right: '0px',
        background: isVoiceActive ? '#E8F5E8' : 'white',
        padding: '6px 10px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: '11px',
        whiteSpace: 'nowrap',
        maxWidth: '200px',
        textAlign: 'center',
        border: isVoiceActive ? '1px solid #4CAF50' : '1px solid #ddd',
        color: isVoiceActive ? '#2E7D32' : '#333'
      }}>
        {status}
      </div>

      {/* Voice mode indicator with speech status */}
      {isVoiceActive && (
        <div style={{
          position: 'absolute',
          bottom: '100px',
          right: '0px',
          background: isSpeaking ? '#FF5722' : isCurrentlyListening ? '#4CAF50' : '#FFC107',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 'bold',
          textAlign: 'center',
          animation: isCurrentlyListening ? 'pulse 1s infinite' : 'none'
        }}>
          {isSpeaking ? '🔊 SPEAKING' : isCurrentlyListening ? '🎤 LISTENING' : '⏸️ READY'}
        </div>
      )}

      {/* Last command display */}
      {lastCommand && (
        <div style={{
          position: 'absolute',
          bottom: isVoiceActive ? '130px' : '100px',
          right: '0px',
          background: '#e8f5e8',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          maxWidth: '150px',
          wordBreak: 'break-word',
          border: '1px solid #4CAF50'
        }}>
          Last: "{lastCommand}"
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

export default BasicVoiceButton;