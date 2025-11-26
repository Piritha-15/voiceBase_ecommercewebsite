import React, { createContext, useContext, useState, useEffect } from 'react';
import { useVoice } from './VoiceContext';

const VoiceBiometricContext = createContext();

export const useVoiceBiometric = () => {
  const context = useContext(VoiceBiometricContext);
  if (!context) {
    throw new Error('useVoiceBiometric must be used within a VoiceBiometricProvider');
  }
  return context;
};

export const VoiceBiometricProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [voiceProfile, setVoiceProfile] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentStep, setEnrollmentStep] = useState(0);
  const [voiceSamples, setVoiceSamples] = useState([]);
  const { speak, startListening } = useVoice();

  // Voice enrollment phrases for biometric training
  const enrollmentPhrases = [
    "My voice is my password, verify me",
    "VoiceCart is my trusted shopping assistant",
    "I authorize this voice for secure access",
    "This is my unique voice signature",
    "Voice authentication for secure shopping"
  ];

  useEffect(() => {
    // Check for existing voice profile on mount
    const savedProfile = localStorage.getItem('voicecart_voice_profile');
    if (savedProfile) {
      setVoiceProfile(JSON.parse(savedProfile));
    }

    const savedUser = localStorage.getItem('voicecart_user_profile');
    if (savedUser) {
      setUserProfile(JSON.parse(savedUser));
    }
  }, []);

  const startVoiceEnrollment = (userInfo) => {
    setIsEnrolling(true);
    setEnrollmentStep(0);
    setVoiceSamples([]);
    setUserProfile(userInfo);
    
    speak(`Hello ${userInfo.name}. Let's set up your voice authentication. I'll ask you to repeat 5 phrases. Please speak clearly.`);
    
    setTimeout(() => {
      nextEnrollmentStep();
    }, 3000);
  };

  const nextEnrollmentStep = () => {
    if (enrollmentStep < enrollmentPhrases.length) {
      const phrase = enrollmentPhrases[enrollmentStep];
      speak(`Please say: ${phrase}`);
      
      setTimeout(() => {
        startListening(
          (transcript) => {
            console.log(`Enrollment step ${enrollmentStep + 1}:`, transcript);
            
            // Simulate voice pattern extraction
            const voicePattern = {
              transcript: transcript,
              timestamp: Date.now(),
              step: enrollmentStep + 1,
              similarity: calculateSimilarity(transcript, phrase)
            };
            
            setVoiceSamples(prev => [...prev, voicePattern]);
            
            if (voicePattern.similarity > 0.7) {
              speak('Good. Next phrase.');
              setEnrollmentStep(prev => prev + 1);
              
              setTimeout(() => {
                if (enrollmentStep + 1 < enrollmentPhrases.length) {
                  nextEnrollmentStep();
                } else {
                  completeEnrollment();
                }
              }, 1500);
            } else {
              speak('Please try again and speak more clearly.');
              setTimeout(() => {
                nextEnrollmentStep();
              }, 2000);
            }
          },
          (error) => {
            speak('I could not hear you clearly. Please try again.');
            setTimeout(() => {
              nextEnrollmentStep();
            }, 2000);
          }
        );
      }, 2000);
    }
  };

  const completeEnrollment = () => {
    // Create voice biometric profile
    const profile = {
      userId: userProfile.id || Date.now(),
      userName: userProfile.name,
      voicePatterns: voiceSamples,
      enrollmentDate: new Date().toISOString(),
      isActive: true
    };

    setVoiceProfile(profile);
    localStorage.setItem('voicecart_voice_profile', JSON.stringify(profile));
    localStorage.setItem('voicecart_user_profile', JSON.stringify(userProfile));
    
    setIsEnrolling(false);
    setIsAuthenticated(true);
    
    speak(`Voice enrollment complete! Welcome to VoiceCart, ${userProfile.name}. Your voice is now your secure password.`);
  };

  const authenticateWithVoice = () => {
    if (!voiceProfile) {
      speak('No voice profile found. Please enroll first.');
      return;
    }

    speak('Please say: My voice is my password, verify me');
    
    setTimeout(() => {
      startListening(
        (transcript) => {
          console.log('Authentication attempt:', transcript);
          
          // Simulate voice matching
          const similarity = calculateVoiceMatch(transcript, voiceProfile.voicePatterns);
          
          if (similarity > 0.8) {
            setIsAuthenticated(true);
            speak(`Welcome back, ${voiceProfile.userName}. Voice authentication successful.`);
            
            // Log successful authentication
            logAuthenticationAttempt(true, similarity);
          } else if (similarity > 0.6) {
            // Suspicious activity - require additional verification
            speak('Voice pattern partially matches. For security, please say your full name.');
            
            setTimeout(() => {
              startListening(
                (nameTranscript) => {
                  if (nameTranscript.toLowerCase().includes(voiceProfile.userName.toLowerCase())) {
                    setIsAuthenticated(true);
                    speak('Additional verification successful. Welcome back.');
                    logAuthenticationAttempt(true, similarity, 'additional_verification');
                  } else {
                    speak('Authentication failed. Access denied.');
                    logAuthenticationAttempt(false, similarity, 'failed_additional_verification');
                  }
                },
                () => {
                  speak('Authentication failed. Please try again.');
                  logAuthenticationAttempt(false, similarity, 'error_additional_verification');
                }
              );
            }, 2000);
          } else {
            speak('Voice authentication failed. Access denied.');
            logAuthenticationAttempt(false, similarity);
          }
        },
        (error) => {
          speak('Authentication error. Please try again.');
          logAuthenticationAttempt(false, 0, error);
        }
      );
    }, 2000);
  };

  const calculateSimilarity = (transcript, targetPhrase) => {
    // Simple similarity calculation (in production, use advanced voice biometrics)
    const transcriptWords = transcript.toLowerCase().split(' ');
    const targetWords = targetPhrase.toLowerCase().split(' ');
    
    let matches = 0;
    targetWords.forEach(word => {
      if (transcriptWords.some(t => t.includes(word) || word.includes(t))) {
        matches++;
      }
    });
    
    return matches / targetWords.length;
  };

  const calculateVoiceMatch = (transcript, voicePatterns) => {
    // Simulate voice biometric matching
    let totalSimilarity = 0;
    
    voicePatterns.forEach(pattern => {
      const similarity = calculateSimilarity(transcript, pattern.transcript);
      totalSimilarity += similarity;
    });
    
    return totalSimilarity / voicePatterns.length;
  };

  const logAuthenticationAttempt = (success, confidence, additionalInfo = '') => {
    const attempt = {
      timestamp: new Date().toISOString(),
      success,
      confidence,
      additionalInfo,
      userAgent: navigator.userAgent,
      ip: 'localhost' // In production, get real IP
    };

    // Store authentication logs
    const logs = JSON.parse(localStorage.getItem('voicecart_auth_logs') || '[]');
    logs.push(attempt);
    localStorage.setItem('voicecart_auth_logs', JSON.stringify(logs.slice(-50))); // Keep last 50 attempts
  };

  const logout = () => {
    setIsAuthenticated(false);
    speak('You have been logged out. Thank you for using VoiceCart.');
  };

  const resetVoiceProfile = () => {
    setVoiceProfile(null);
    setIsAuthenticated(false);
    localStorage.removeItem('voicecart_voice_profile');
    speak('Voice profile has been reset. You can now enroll a new voice.');
  };

  const value = {
    isAuthenticated,
    userProfile,
    voiceProfile,
    isEnrolling,
    enrollmentStep,
    enrollmentPhrases,
    startVoiceEnrollment,
    authenticateWithVoice,
    logout,
    resetVoiceProfile
  };

  return (
    <VoiceBiometricContext.Provider value={value}>
      {children}
    </VoiceBiometricContext.Provider>
  );
};