import React from 'react';
import Image from 'next/image';
import { Info } from 'react-feather';
import Link from 'next/link';

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
    <header className={`${bgColor} py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10`}>
      <div className="flex items-center justify-between flex-grow max-w-screen-xl mx-auto w-full">
        <Link 
          href="/"
          className="flex-shrink-0 flex items-center cursor-pointer"
        >
          <Image
            width={48}
            height={48}
            className="rounded-full w-10 h-10 sm:w-12 sm:h-12"
            alt="Bot Avatar"
            src="/images/bot-avatar.svg"
          />
          <div className="ml-3 sm:ml-4">
            <h1 className={`font-semibold ${textColor} text-lg sm:text-xl md:text-2xl truncate`}>{title}</h1>
          </div>
        </Link>
        {showInfoIcon && (
          <button 
            onClick={onInfoClick} 
            className="bg-transparent border-none cursor-pointer text-pcsprimary-03 hover:text-pcsprimary-02 transition-colors ml-2 p-2"
            aria-label="Show information"
          >
            <Info size={24} />
          </button>
        )}
      </div>
    </header>
  );
};
