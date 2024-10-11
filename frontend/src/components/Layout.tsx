import React from 'react';
import { Header } from './Header';
import { HeaderAlt } from './HeaderAlt';

interface LayoutProps {
  children: React.ReactNode;
  headerType?: 'default' | 'alt';
}

export const Layout: React.FC<LayoutProps> = ({ children, headerType = 'default' }) => {
  const HeaderComponent = headerType === 'alt' ? HeaderAlt : Header;

  return (
    <div className="flex flex-col h-screen">
      <HeaderComponent />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};