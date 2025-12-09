import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const UltraSimpleVoice = () => {
    const [isListening, setIsListening] = useState(false);
    const [lastCommand, setLastCommand] = useState('');
    const [status, setStatus] = useState('Click to start');
    const recognitionRef = useRef(null);
    const navigate = useNavigate();

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const processCommand = (text) => {
        const command = text.toLowerCase();
        console.log('===== VOICE COMMAND =====');
        console.log('Raw text:', text);
        console.log('Lowercase:', command);
        setLastCommand(text);

        // Simple command matching with detailed logging
        if (command.includes('hello') || command.includes('hi')) {
            console.log('✅ MATCHED: hello/hi');
            speak('Hello! Voice is working!');
        } else if (command.includes('cart')) {
            console.log('✅ MATCHED: cart');
            speak('Opening cart');
            setTimeout(() => navigate('/cart'), 500);
        } else if (command.includes('home')) {
            console.log('✅ MATCHED: home');
            speak('Going home');
            setTimeout(() => navigate('/'), 500);
        } else if (command.includes('health')) {
            console.log('✅ MATCHED: health');
            speak('Opening health category');
            setTimeout(() => navigate('/category/health'), 500);
        } else {
            console.log('❌ NO MATCH - saying what was heard');
            speak('I heard ' + text);
        }
        console.log('========================');
    };

    const startListening = async () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Voice not supported. Use Chrome browser.');
            return;
        }

        // Request microphone permission explicitly
        try {
            console.log('🎤 Requesting microphone permission...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('✅ Microphone permission granted');
            console.log('🎤 Microphone active:', stream.active);
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error('❌ Microphone error:', error);
            alert('Please allow microphone access! Click the 🔒 icon in address bar.');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false; // Single command mode - works better
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            console.log('✅ Voice recognition STARTED');
            setIsListening(true);
            setStatus('🎤 Listening...');
        };

        recognition.onspeechstart = () => {
            console.log('🗣️ Speech detected!');
            setStatus('🗣️ Hearing you...');
        };

        recognition.onspeechend = () => {
            console.log('🔇 Speech ended');
            setStatus('Processing...');
        };

        recognition.onaudiostart = () => {
            console.log('🎵 Audio input started');
        };

        recognition.onaudioend = () => {
            console.log('🔇 Audio input ended');
        };

        recognition.onsoundstart = () => {
            console.log('🔊 Sound detected');
        };

        recognition.onsoundend = () => {
            console.log('🔇 Sound ended');
        };

        recognition.onresult = (event) => {
            console.log('📝 onresult event fired, results:', event.results);
            if (event.results && event.results.length > 0) {
                const transcript = event.results[event.results.length - 1][0].transcript;
                const confidence = event.results[event.results.length - 1][0].confidence;
                console.log('✅ Voice recognition RESULT:', transcript);
                console.log('🎯 Confidence:', confidence);
                setStatus('Processing...');
                processCommand(transcript);
            } else {
                console.log('❌ No results in event');
                setStatus('No speech recognized');
            }
        };

        recognition.onnomatch = (event) => {
            console.log('❌ Speech not recognized (no match)');
            setStatus('Speech not recognized');
            speak('Sorry, I did not understand that');
        };

        recognition.onerror = (event) => {
            console.log('⚠️ Voice error:', event.error);
            console.log('⚠️ Error details:', event);

            if (event.error === 'not-allowed') {
                alert('Please allow microphone access!');
                setIsListening(false);
                setStatus('Mic denied');
                recognitionRef.current = null;
            } else if (event.error === 'network') {
                console.log('❌ NETWORK ERROR - Speech recognition needs internet!');
                alert('Network error! Speech recognition needs internet connection. Please check your connection.');
                setStatus('Network error');
            } else if (event.error === 'no-speech') {
                console.log('⚠️ No speech detected - will retry');
                setStatus('No speech - speak louder');
            } else if (event.error !== 'aborted') {
                console.log('❌ Error:', event.error);
                setStatus('Error: ' + event.error);
            }
        };

        recognition.onend = () => {
            console.log('🔚 Voice recognition ENDED');
            if (recognitionRef.current) {
                setStatus('🔄 Ready for next command...');
                // Auto-restart after a short delay
                setTimeout(() => {
                    if (recognitionRef.current) {
                        try {
                            console.log('🔄 Restarting recognition...');
                            recognition.start();
                        } catch (e) {
                            console.log('❌ Restart failed:', e.message);
                            if (!e.message.includes('already started')) {
                                setStatus('Click to restart');
                                setIsListening(false);
                            }
                        }
                    }
                }, 500);
            } else {
                setStatus('Stopped');
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = () => {
        console.log('🛑 Stopping voice recognition');
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
            setIsListening(false);
            setStatus('Stopped');
        }
    };

    const toggleVoice = () => {
        console.log('🎤 Toggle voice clicked, current state:', isListening);
        if (isListening) {
            stopListening();
            speak('Voice off');
        } else {
            setStatus('Starting...');
            startListening();
            speak('Voice on. Say hello to test.');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000
        }}>
            <button
                onClick={toggleVoice}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: isListening ? '#4CAF50' : '#666',
                    color: 'white',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
            >
                {isListening ? '🎤' : '🔇'}
            </button>

            <div style={{
                position: 'absolute',
                bottom: '70px',
                right: '0',
                background: isListening ? '#e8f5e9' : 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                maxWidth: '200px',
                border: isListening ? '2px solid #4CAF50' : '2px solid #ccc'
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {status}
                </div>
                {lastCommand && (
                    <div style={{ fontSize: '11px', color: '#666' }}>
                        Last: "{lastCommand}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default UltraSimpleVoice;
