import React, { useCallback } from 'react';
import { X } from 'react-feather';

interface InfoPopoverProps {
  onClose: () => void;
  children: React.ReactNode;
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({ onClose, children }) => {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/50  z-50 flex justify-end"
      onClick={handleBackdropClick} // Add click handler to backdrop
    >
      <div className="bg-white  w-full sm:w-[600px] lg:w-[800px] max-w-[90%] h-full 
        flex flex-col rounded-l-2xl shadow-lg transition-all">
        <div className="p-4 flex justify-end border-b border-gray-200 ">
          <button 
            onClick={onClose} 
            className="text-gray-600 hover:text-gray-900 
              transition-colors p-2 rounded-full hover:bg-gray-100 "
            aria-label="Close info popover"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto bg-gray-50 ">
          {children}
        </div>
      </div>
    </div>
  );
};
