'use client';

import React, { createContext, useContext, useState } from 'react';

type Screen = 'welcome' | 'scenario-setup' | 'initiate-chat' | 'chat' | 'history';

interface RouterParams {
  [key: string]: string | number | boolean;
}

interface RouterContextType {
  currentScreen: Screen;
  params: RouterParams;
  navigateTo: (screen: Screen, params?: RouterParams) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [params, setParams] = useState<RouterParams>({});

  const navigateTo = (screen: Screen, newParams?: RouterParams) => {
    setCurrentScreen(screen);
    if (newParams) {
      setParams(newParams);
    } else {
      setParams({});
    }
  };

  return (
    <RouterContext.Provider value={{ currentScreen, navigateTo, params }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};