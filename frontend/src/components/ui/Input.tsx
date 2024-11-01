import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  type?: 'text' | 'textarea' | 'password' | 'email';
  error?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  error,
  className = '',
  ...props
}) => {
  const baseClasses = `
    w-full
    px-3
    py-2
    bg-white
    dark:bg-gray-800
    border
    rounded-md
    outline-none
    focus:ring-2
    focus:ring-blue-500
    dark:focus:ring-blue-400
    ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
    ${className}
  `;

  if (type === 'textarea') {
    return (
      <textarea
        className={`${baseClasses} h-full`}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  }

  return (
    <input
      type={type}
      className={baseClasses}
      {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
    />
  );
};
