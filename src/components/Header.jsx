import React from 'react';

function Header({ title }) {
  return (
    <header className="cublica-header">
      <div className="cublica-logo">CUBE</div>
      <div className="cublica-title">{title}</div>
      <div className="cublica-close">×</div>
    </header>
  );
}

export default Header;
