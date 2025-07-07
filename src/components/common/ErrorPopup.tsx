import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ErrorPopupProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({
  message,
  duration = 3000,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4 relative animate-fade-in">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle size={24} className="text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-red-800 mb-1">Login Failed</h3>
            <p className="text-red-600">{message}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup;