import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ButtonCommands = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const executeCommand = (command, path, message) => {
    speak(message);
    setTimeout(() => navigate(path), 500);
    setShowMenu(false);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 1000
    }}>
      {showMenu && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          left: '0',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          padding: '10px',
          minWidth: '200px'
        }}>
          <div style={{
            fontWeight: 'bold',
            padding: '10px',
            borderBottom: '2px solid #eee',
            marginBottom: '5px'
          }}>
            Quick Commands
          </div>
          
          <button
            onClick={() => executeCommand('hello', '/', 'Hello! Welcome to VoiceCart!')}
            style={buttonStyle}
          >
            👋 Say Hello
          </button>
          
          <button
            onClick={() => executeCommand('home', '/', 'Going to home page')}
            style={buttonStyle}
          >
            🏠 Go Home
          </button>
          
          <button
            onClick={() => executeCommand('cart', '/cart', 'Opening your cart')}
            style={buttonStyle}
          >
            🛒 Open Cart
          </button>
          
          <button
            onClick={() => executeCommand('health', '/category/health', 'Opening health category')}
            style={buttonStyle}
          >
            🏥 Health Products
          </button>
          
          <button
            onClick={() => executeCommand('nutrition', '/category/nutrition', 'Opening nutrition category')}
            style={buttonStyle}
          >
            🥗 Nutrition Products
          </button>
          
          <button
            onClick={() => executeCommand('wishlist', '/wishlist', 'Opening your wishlist')}
            style={buttonStyle}
          >
            ❤️ My Wishlist
          </button>
        </div>
      )}
      
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: showMenu ? '#4CAF50' : '#2196F3',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.3s'
        }}
        title="Quick Commands (Voice Alternative)"
      >
        {showMenu ? '✕' : '⚡'}
      </button>
      
      <div style={{
        position: 'absolute',
        bottom: '70px',
        left: '0',
        background: '#2196F3',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 'bold',
        whiteSpace: 'nowrap'
      }}>
        Quick Commands
      </div>
    </div>
  );
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  margin: '5px 0',
  border: 'none',
  borderRadius: '8px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  textAlign: 'left'
};

export default ButtonCommands;
