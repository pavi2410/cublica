import React, { useEffect, useState } from 'react';

/**
 * MessageDisplay component for showing success/error messages
 * @param {Object} message - Message object with type and text
 */
function MessageDisplay({ message }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (message) {
      setVisible(true);
      
      // Auto-hide success messages after 5 seconds
      if (message.type === 'success') {
        const timer = setTimeout(() => {
          setVisible(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [message]);
  
  if (!message || !visible) return null;
  
  return (
    <div className={`message-display ${message.type}`}>
      <div className="message-content">
        {message.text}
        {message.type === 'error' && (
          <button className="close-button" onClick={() => setVisible(false)}>
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default MessageDisplay;
