import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  type?: 'text' | 'textarea';
  label?: string;
  error?: string;
  rows?: number;
}

export const Input: React.FC<InputProps> = ({ 
  type = 'text', 
  label, 
  error, 
  className = '', 
  rows = 3,
  ...props 
}) => {
  const inputClasses = `w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none ${
    error ? 'border-red-500' : 'border-gray-300'
  } ${className}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          className={inputClasses}
          rows={rows}
          {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
        />
      );
    }
    return (
      <input
        type={type}
        className={inputClasses}
        {...props as React.InputHTMLAttributes<HTMLInputElement>}
      />
    );
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-2 text-sm font-bold text-gray-700">
          {label}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};
