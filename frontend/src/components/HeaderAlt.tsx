import React from 'react';
import Image from 'next/image';

export const HeaderAlt: React.FC = () => {
  return (
    <header className="bg-pcsprimary-02 p-4 flex items-center">
      <Image
        width={42}
        height={42}
        className="rounded-full"
        alt="Bot Avatar"
        src="/images/bot-avatar.svg"
      />
      <div className="ml-4">
        <h1 className="font-medium text-white text-base">Union Training Bot</h1>
      </div>
    </header>
  );
};