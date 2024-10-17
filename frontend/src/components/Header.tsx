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
    <header className={`${bgColor} p-4 flex items-center justify-between sticky top-0 z-10`}>
      <div className="flex items-center flex-grow">
        <Image
          width={42}
          height={42}
          className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
          alt="Bot Avatar"
          src="/images/bot-avatar.svg"
        />
        <div className="ml-2 sm:ml-4 flex-grow">
          <h1 className={`font-medium ${textColor} text-sm sm:text-base truncate`}>{title}</h1>
        </div>
      </div>
      {showInfoIcon && (
        <button 
          onClick={onInfoClick} 
          className="bg-transparent border-none cursor-pointer text-pcsprimary-03 hover:text-pcsprimary-02 transition-colors ml-2"
          aria-label="Show information"
        >
          <Info size={18} />
        </button>
      )}
    </header>
  );
};
