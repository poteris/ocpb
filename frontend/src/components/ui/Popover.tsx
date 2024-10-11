import React from 'react';
import { X } from 'react-feather';

interface InfoPopoverProps {
  onClose: () => void;
}

export const InfoPopover: React.FC<InfoPopoverProps> = ({ onClose }) => {
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
          <h2 className="text-pcsprimary-03 text-xl font-medium mb-4">Information</h2>
          <p className="text-pcsprimary-04 mb-4">
            This is the information popover. You can add any relevant details about the chat or scenario here.
          </p>
          {/* Add more content as needed */}
        </div>
      </div>
    </div>
  );
};