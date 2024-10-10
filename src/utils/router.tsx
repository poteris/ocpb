import React, { createContext, useContext, useState } from 'react';
import { Welcome } from '@/components/screens/WelcomePage';
import { ScenarioSetup } from '@/components/screens/ScenarioSetup';
import { InitiateChat } from '@/components/screens/InitiateChat';
import { ChatScreen } from '@/components/screens/ChatScreen';
import { HistoryScreen } from '@/components/screens/History';

type Screen = 'welcome' | 'scenarioSetup' | 'initiateChat' | 'activeChat' | 'feedback' | 'history';

interface RouterParams {
  [key: string]: string | number | boolean;
}

interface RouterContextType {
  currentScreen: Screen;
  navigateTo: (screen: Screen, params?: RouterParams) => void;
  params: RouterParams;
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

export const Router: React.FC = () => {
  const { currentScreen } = useRouter();

  switch (currentScreen) {
    case 'welcome':
      return <Welcome />;
    case 'scenarioSetup':
      return <ScenarioSetup />;
    case 'initiateChat':
      return <InitiateChat />;
    case 'activeChat':
      return <ChatScreen />;
    case 'history':
      return <HistoryScreen />;
    default:
      return <Welcome />;
  }
};

// Removed unused 'routes' variable