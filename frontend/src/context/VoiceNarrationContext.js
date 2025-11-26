import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSpeechCoordination } from './SpeechCoordinationContext';

const VoiceNarrationContext = createContext();

export const useVoiceNarration = () => {
  const context = useContext(VoiceNarrationContext);
  if (!context) {
    throw new Error('useVoiceNarration must be used within a VoiceNarrationProvider');
  }
  return context;
};

export const VoiceNarrationProvider = ({ children }) => {
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(false); // Disable auto-narration by default
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false); // Track if welcome message played
  const { coordinatedSpeak, isSpeaking } = useSpeechCoordination();

  // Simple coordinated narration function
  const narrateAction = useCallback((text) => {
    if (!isNarrationEnabled || !text || text.trim() === '') {
      console.log('❌ Narration skipped: disabled or empty text');
      return;
    }

    console.log('🔊 COORDINATED NARRATION:', text);
    
    // Use coordinated speech that automatically handles voice recognition pausing
    coordinatedSpeak(text, { volume: 0.8 }) // Slightly lower volume for narration
      .catch((error) => {
        console.error('❌ Coordinated narration error:', error);
      });
  }, [isNarrationEnabled, coordinatedSpeak]);

  // Narration functions for different actions
  const narrateClick = (elementText) => {
    narrateAction(`Clicked ${elementText}`);
  };

  const narrateNavigation = (pageName) => {
    narrateAction(`Navigating to ${pageName}`);
  };

  const narrateAddToCart = (productName) => {
    narrateAction(`Added ${productName} to cart`);
  };

  const narrateRemoveFromCart = (productName) => {
    narrateAction(`Removed ${productName} from cart`);
  };

  const narrateSearch = (searchTerm) => {
    narrateAction(`Searching for ${searchTerm}`);
  };

  const narratePageLoad = (pageName) => {
    narrateAction(`${pageName} page loaded`);
  };

  const narrateFormSubmit = (formName) => {
    narrateAction(`Submitting ${formName} form`);
  };

  const narrateQuantityChange = (productName, quantity) => {
    narrateAction(`Changed ${productName} quantity to ${quantity}`);
  };

  const narrateCheckout = () => {
    narrateAction('Proceeding to checkout');
  };

  const narratePayment = () => {
    narrateAction('Processing payment');
  };

  const narrateOrderComplete = () => {
    narrateAction('Order completed successfully');
  };

  const narrateError = (errorMessage) => {
    narrateAction(`Error: ${errorMessage}`);
  };

  const narrateSuccess = (successMessage) => {
    narrateAction(`Success: ${successMessage}`);
  };

  // Toggle narration on/off
  const toggleNarration = () => {
    const newState = !isNarrationEnabled;
    setIsNarrationEnabled(newState);
    
    if (newState) {
      narrateAction('Voice narration enabled. All actions will be announced.');
    } else {
      narrateAction('Voice narration disabled.');
    }
  };

  // Auto-announce narration system on load and setup global listeners
  useEffect(() => {
    // Welcome message - only play once per session
    if (!hasPlayedWelcome) {
      const timer = setTimeout(() => {
        narrateAction('Welcome to VoiceCart. Voice narration is active.');
        setHasPlayedWelcome(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }

    // Global click listener to auto-narrate all clicks
    const handleGlobalClick = (event) => {
      if (!isNarrationEnabled) return;

      const element = event.target;
      let description = '';

      // Get element description
      if (element.tagName === 'BUTTON') {
        description = element.textContent || element.title || 'button';
      } else if (element.tagName === 'A') {
        description = element.textContent || element.href || 'link';
      } else if (element.classList.contains('product-card')) {
        description = 'product card';
      } else if (element.closest('.product-card')) {
        description = 'product card';
      } else if (element.closest('button')) {
        const button = element.closest('button');
        description = button.textContent || button.title || 'button';
      } else if (element.closest('a')) {
        const link = element.closest('a');
        description = link.textContent || 'link';
      } else if (element.textContent && element.textContent.trim()) {
        description = element.textContent.trim();
      }

      if (description) {
        narrateAction(`Clicked ${description}`);
      }
    };

    // Add global click listener
    document.addEventListener('click', handleGlobalClick, true);

  }, [hasPlayedWelcome, isNarrationEnabled, narrateAction]);

  // Separate useEffect for global click listener
  useEffect(() => {
    // Global click listener to auto-narrate all clicks
    const handleGlobalClick = (event) => {
      if (!isNarrationEnabled) return;

      const element = event.target;
      let description = '';

      // Get element description
      if (element.tagName === 'BUTTON') {
        description = element.textContent || element.title || 'button';
      } else if (element.tagName === 'A') {
        description = element.textContent || element.href || 'link';
      } else if (element.classList.contains('product-card')) {
        description = 'product card';
      } else if (element.closest('.product-card')) {
        description = 'product card';
      } else if (element.closest('button')) {
        const button = element.closest('button');
        description = button.textContent || button.title || 'button';
      } else if (element.closest('a')) {
        const link = element.closest('a');
        description = link.textContent || 'link';
      } else if (element.textContent && element.textContent.trim()) {
        description = element.textContent.trim();
      }

      if (description) {
        narrateAction(`Clicked ${description}`);
      }
    };

    // Add global click listener
    document.addEventListener('click', handleGlobalClick, true);

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [isNarrationEnabled, narrateAction]);

  const value = {
    isNarrationEnabled,
    isSpeaking,
    toggleNarration,
    narrateAction,
    narrateClick,
    narrateNavigation,
    narrateAddToCart,
    narrateRemoveFromCart,
    narrateSearch,
    narratePageLoad,
    narrateFormSubmit,
    narrateQuantityChange,
    narrateCheckout,
    narratePayment,
    narrateOrderComplete,
    narrateError,
    narrateSuccess
  };

  return (
    <VoiceNarrationContext.Provider value={value}>
      {children}
    </VoiceNarrationContext.Provider>
  );
};