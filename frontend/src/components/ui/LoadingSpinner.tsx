import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3'
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`
          animate-spin
          rounded-full
          border-solid
          border-gray-200
          border-t-blue-600
          ${sizeClasses[size]}
          ${className}
        `}
      />
    </div>
  );
};

// Add to index.ts export
export * from './LoadingSpinner'; 