// Network utility functions for VoiceCart

export const checkNetworkConnection = () => {
  return new Promise((resolve) => {
    if (!navigator.onLine) {
      resolve(false);
      return;
    }

    // Try to fetch a small resource to test connectivity
    const timeout = setTimeout(() => {
      resolve(false);
    }, 3000);

    fetch('/favicon.ico', { 
      method: 'HEAD',
      cache: 'no-cache'
    })
    .then(() => {
      clearTimeout(timeout);
      resolve(true);
    })
    .catch(() => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
};

export const getNetworkStatus = () => {
  return {
    online: navigator.onLine,
    connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
    effectiveType: navigator.connection?.effectiveType || 'unknown'
  };
};

export const isSlowConnection = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) return false;
  
  return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
};

// Voice-specific network requirements
export const canUseOnlineVoiceRecognition = async () => {
  const networkStatus = getNetworkStatus();
  
  if (!networkStatus.online) {
    return { canUse: false, reason: 'No internet connection' };
  }

  if (isSlowConnection()) {
    return { canUse: false, reason: 'Connection too slow for voice recognition' };
  }

  const hasConnection = await checkNetworkConnection();
  if (!hasConnection) {
    return { canUse: false, reason: 'Network connectivity issues' };
  }

  return { canUse: true, reason: 'Network suitable for voice recognition' };
};