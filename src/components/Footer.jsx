import React, { useState } from 'react';

function Footer() {
  const [autoRun, setAutoRun] = useState(false);
  
  return (
    <footer className="cublica-footer">
      <div className="auto-run-container">
        <label htmlFor="auto-run-toggle">Auto run code as I type</label>
        <div 
          className={`toggle-switch ${autoRun ? 'active' : ''}`}
          onClick={() => setAutoRun(!autoRun)}
        >
          <div className="toggle-switch-handle"></div>
        </div>
      </div>
      <div className="footer-status">Ready</div>
    </footer>
  );
}

export default Footer;
