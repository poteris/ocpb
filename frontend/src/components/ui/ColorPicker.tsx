import React, { useState } from 'react';
import { Input } from './input';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  disabled = false
}) => {
  const [isValidColor, setIsValidColor] = useState(true);

  const validateColor = (color: string) => {
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    return hexColorRegex.test(color);
  };

  const handleColorChange = (newColor: string) => {
    const isValid = validateColor(newColor);
    setIsValidColor(isValid);
    
    if (isValid) {
      onChange(newColor);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <div 
          className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer"
          style={{ backgroundColor: isValidColor ? value : '#e5e7eb' }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = value;
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              handleColorChange(target.value);
            };
            input.click();
          }}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => handleColorChange(e.target.value)}
          placeholder="#000000"
          className={`flex-1 ${!isValidColor ? 'border-red-500' : ''}`}
          disabled={disabled}
        />
      </div>
      {!isValidColor && (
        <p className="text-sm text-red-600">
          Please enter a valid hex color (e.g., #FF0000)
        </p>
      )}
    </div>
  );
};


