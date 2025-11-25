import { useState } from 'react';
import './Controls.css';

const Controls = ({ onFake, onReal }) => {
  return (
    <div className="controls-container">
      <button className="control-btn btn-fake" onClick={onFake}>
        <span className="icon">✕</span>
        <span>Fake</span>
      </button>
      <button className="control-btn btn-real" onClick={onReal}>
        <span className="icon">✓</span>
        <span>Real</span>
      </button>
    </div>
  );
};

export default Controls;
