import React from 'react';

function Header({ title }) {
  return (
    <header className="replicube-header">
      <div className="replicube-logo">CUBE</div>
      <div className="replicube-title">{title}</div>
      <div className="replicube-close">×</div>
    </header>
  );
}

export default Header;
