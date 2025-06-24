import React from 'react';
import './SignUpLogin.css';

interface ErrorModalProps {
  show: boolean;
  onHide: () => void;
  message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ show, onHide, message }) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Error</h3>
        <p>{message}</p>
        <button onClick={onHide}>Close</button>
      </div>
    </div>
  );
};

export default ErrorModal;
