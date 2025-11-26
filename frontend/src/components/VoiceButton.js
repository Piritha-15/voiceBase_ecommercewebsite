import React, { useState } from 'react';
import { useVoice } from '../context/VoiceContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVoiceBiometric } from '../context/VoiceBiometricContext';
import { useRecommendations } from '../context/RecommendationContext';
import { useCaregiver } from '../context/CaregiverContext';

const VoiceButton = () => {
  const { isListening, startListening, speak, isSupported } = useVoice();
  const { isAuthenticated, authenticateWithVoice } = useVoiceBiometric();
  const { getVoiceRecommendations, setupHealthProfile } = useRecommendations();
  const { handleVoiceCaregiverCommand, assistanceMode } = useCaregiver();
  const navigate = useNavigate();
  const location = useLocation();
  const [tooltip, setTooltip] = useState('');

  const processVoiceCommand = (transcript) => {
    console.log('=== PROCESSING VOICE COMMAND ===');
    console.log('Raw transcript:', transcript);
    
    const command = transcript.toLowerCase().trim();
    console.log('Processed command:', command);
    console.log('Command length:', command.length);
    console.log('Command includes "search for":', command.includes('search for'));
    console.log('Command includes "vitamins":', command.includes('vitamins'));
    
    // Test command for debugging
    if (command.includes('test') || command.includes('hello')) {
      console.log('✅ Test command recognized');
      speak('Hello! Voice recognition is working perfectly. You said: ' + transcript);
      return;
    }

    // SEARCH COMMANDS - Check these FIRST before navigation
    if (command.includes('search for') || command.includes('find')) {
      let searchTerm = '';
      if (command.includes('search for')) {
        searchTerm = command.replace('search for', '').trim();
      } else if (command.includes('find')) {
        searchTerm = command.replace('find', '').trim();
      }
      
      console.log('🔍 SEARCH COMMAND DETECTED!');
      console.log('🔍 Search term extracted:', searchTerm);
      
      if (searchTerm) {
        speak(`Searching for ${searchTerm}`);
        navigate(`/?search=${encodeURIComponent(searchTerm)}`);
        return;
      } else {
        speak('What would you like to search for?');
        return;
      }
    }

    // Check for caregiver commands
    if (handleVoiceCaregiverCommand(command)) {
      return; // Command was handled by caregiver system
    }

    // Voice authentication commands
    if (command.includes('voice login') || command.includes('authenticate')) {
      if (!isAuthenticated) {
        authenticateWithVoice();
      } else {
        speak('You are already authenticated.');
      }
      return;
    }

    // Recommendation commands
    if (command.includes('recommend') || command.includes('suggest') || command.includes('what should i buy')) {
      getVoiceRecommendations();
      return;
    }

    if (command.includes('health profile') || command.includes('setup health')) {
      setupHealthProfile();
      return;
    }

    // Enhanced navigation commands
    if (command.includes('go to home') || command.includes('home page')) {
      console.log('🏠 Navigation: Home page');
      speak('Going to home page');
      navigate('/');
      return;
    } else if (command.includes('go to cart') || command.includes('show cart') || command.includes('cart')) {
      console.log('🛒 Navigation: Cart page');
      speak('Opening your cart');
      navigate('/cart');
      return;
    } else if (command.includes('checkout')) {
      console.log('💳 Navigation: Checkout');
      speak('Going to checkout');
      navigate('/checkout');
      return;
    } else if (command.includes('go to category') || command.includes('show category') || command.includes('category')) {
      if (command.includes('health')) {
        console.log('🏥 Navigation: Health category');
        speak('Opening health category');
        navigate('/category/health');
        return;
      } else if (command.includes('nutrition')) {
        console.log('🥗 Navigation: Nutrition category');
        speak('Opening nutrition category');
        navigate('/category/nutrition');
        return;
      } else if (command.includes('essentials')) {
        console.log('🏠 Navigation: Essentials category');
        speak('Opening essentials category');
        navigate('/category/essentials');
        return;
      }
    }
    // Search commands are now handled earlier in the function
    // Product comparison commands
    else if (command.includes('compare') || command.includes('difference between')) {
      speak('Product comparison feature coming soon. For now, you can browse individual products to see their details.');
    }
    // Cart commands
    else if (command.includes('add to cart')) {
      if (location.pathname.includes('/product/')) {
        speak('Adding item to cart');
        // This would need to be handled by the product page component
      } else {
        speak('Please go to a product page first to add items to cart');
      }
    }
    // Enhanced help commands
    else if (command.includes('help') || command.includes('what can i say')) {
      const helpText = assistanceMode 
        ? 'Caregiver assistance is active. You can say: Go to home, Show cart, Search for products, Get recommendations, Need caregiver help, or End caregiver session'
        : 'You can say: Go to home, Show cart, Search for products, Get recommendations, Voice login, Setup health profile, Need caregiver help, or ask for help';
      speak(helpText);
    }
    // Voice biometric enrollment
    else if (command.includes('enroll voice') || command.includes('setup voice')) {
      speak('Voice enrollment feature available. Please use the settings menu to set up your voice profile.');
    }
    // Default response with enhanced feedback
    else {
      const suggestions = isAuthenticated 
        ? 'Try saying: Get recommendations, Go to home, Show cart, or Search for products'
        : 'Try saying: Voice login, Go to home, Show cart, or Search for products';
      speak(`I heard: ${transcript}. ${suggestions}`);
    }
  };

  const handleVoiceClick = async () => {
    console.log('=== VOICE BUTTON CLICKED ===');
    console.log('isSupported:', isSupported);
    console.log('isListening:', isListening);
    console.log('Voice button clicked for testing');

    if (!isSupported) {
      const message = 'Voice commands are not supported in your browser. Please use Chrome, Edge, or Safari.';
      alert(message);
      speak(message);
      return;
    }

    if (isListening) {
      console.log('Already listening, ignoring click');
      speak('I am already listening. Please speak now.');
      return;
    }

    // Request microphone permission explicitly
    try {
      console.log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone permission granted');
      
      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setTooltip('Listening... Speak now!');
      speak('I am listening. Please speak your command now.');
      
      console.log('🎤 Starting voice recognition...');
      
      startListening(
        (transcript) => {
          console.log('🎯 TRANSCRIPT RECEIVED in VoiceButton:', transcript);
          setTooltip('Processing...');
          
          // Add a small delay to show processing
          setTimeout(() => {
            setTooltip('');
            processVoiceCommand(transcript);
          }, 500);
        },
        (error) => {
          console.error('🚨 VOICE ERROR in VoiceButton:', error);
          setTooltip('');
          
          let errorMessage = 'Sorry, I could not hear you clearly. Please try again.';
          
          switch (error) {
            case 'not-allowed':
              errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
              break;
            case 'no-speech':
              errorMessage = 'No speech detected. Please speak clearly and try again.';
              break;
            case 'network':
              errorMessage = 'Network issue detected. Voice recognition may be limited.';
              break;
            case 'audio-capture':
              errorMessage = 'Microphone not found. Please check your microphone connection.';
              break;
            case 'service-not-allowed':
              errorMessage = 'Speech service not available. The app will work without voice recognition.';
              break;
            default:
              errorMessage = `Voice recognition error: ${error}. Please try again.`;
          }
          
          console.log('Speaking error message:', errorMessage);
          speak(errorMessage);
        }
      );

      // Auto-hide tooltip after 8 seconds
      setTimeout(() => {
        if (tooltip.includes('Listening')) {
          setTooltip('');
        }
      }, 8000);
      
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      const message = 'Microphone access is required for voice commands. Please allow microphone access in your browser.';
      alert(message);
      speak(message);
    }
  };

  const getTooltipText = () => {
    if (tooltip) return tooltip;
    
    // Voice tooltip based on current page
    
    const currentPage = location.pathname;
    if (currentPage === '/') return 'Try: "Search for vitamins"';
    if (currentPage.includes('/category/')) return 'Try: "Filter by price under 1000"';
    if (currentPage.includes('/product/')) return 'Try: "Add to cart"';
    if (currentPage === '/cart') return 'Try: "Checkout now"';
    return 'Try: "Go to home"';
  };

  if (!isSupported) {
    return null;
  }

  const testSpeech = () => {
    speak('Voice synthesis is working correctly. You can now try voice commands.');
  };

  return (
    <>
      <button
        className={`voice-button ${isListening ? 'listening' : ''}`}
        onClick={handleVoiceClick}
        disabled={isListening}
        title="Click to use voice commands"
      >
        🎤
      </button>
      
      {/* Debug button - remove in production */}
      <button
        onClick={testSpeech}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          padding: '8px 12px',
          backgroundColor: '#008080',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
        title="Test speech synthesis"
      >
        🔊 Test Speech
      </button>
      
      <div className={`voice-tooltip ${tooltip || !isListening ? 'show' : ''}`}>
        {getTooltipText()}
      </div>
    </>
  );
};

export default VoiceButton;