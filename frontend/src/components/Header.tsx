import React from 'react';
import Image from 'next/image';
import { Info } from 'react-feather';

interface HeaderProps {
  title?: string;
  variant?: 'default' | 'alt';
  showInfoIcon?: boolean;
  onInfoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = "Union Training Bot", 
  variant = 'default',
  showInfoIcon = false,
  onInfoClick
}) => {
  const bgColor = variant === 'alt' ? 'bg-pcsprimary-02' : 'bg-pcsprimary01-light';
  const textColor = variant === 'alt' ? 'text-white' : 'text-pcsprimary-03';

  return (
    <header className={`${bgColor} p-4 flex items-center justify-between`}>
      <div className="flex items-center">
        <Image
          width={42}
          height={42}
          className="rounded-full"
          alt="Bot Avatar"
          src="/images/bot-avatar.svg"
        />
        <div className="ml-4">
          <h1 className={`font-medium ${textColor} text-base`}>{title}</h1>
        </div>
      </div>
      {showInfoIcon && (
        <button 
          onClick={onInfoClick} 
          className="bg-transparent border-none cursor-pointer text-pcsprimary-03 hover:text-pcsprimary-02 transition-colors"
          aria-label="Show information"
        >
          <Info size={18} />
        </button>
      )}
    </header>
  );
};
