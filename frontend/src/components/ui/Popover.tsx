import React from 'react';
import { X } from 'react-feather';

interface InfoPopoverProps {
  onClose: () => void;
  children: React.ReactNode;
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-11/12 h-full flex flex-col rounded-l-2xl shadow-lg">
        <div className="p-4 flex justify-end">
          <button 
            onClick={onClose} 
            className="text-pcsprimary-03 hover:text-pcsprimary-02 transition-colors"
            aria-label="Close info popover"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
