'use client';

import { useState, useEffect } from 'react';
import { Welcome } from '@/components/screens/WelcomePage';
import { ScenarioSetup } from '@/components/screens/ScenarioSetup';
import { InitiateChat } from '@/components/screens/InitiateChat';
import { ChatScreen } from '@/components/screens/ChatScreen';
import { HistoryScreen } from '@/components/screens/History';

type Screen = 'welcome' | 'scenario-setup' | 'initiate-chat' | 'chat' | 'history';

type NavigateParams = {
  firstMessage?: string;
  sessionId?: string;
};

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [chatParams, setChatParams] = useState<NavigateParams>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const navigateTo = (screen: Screen, params?: NavigateParams) => {
    setCurrentScreen(screen);
    if (params) {
      setChatParams(params);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <Welcome navigateTo={navigateTo} />;
      case 'scenario-setup':
        return <ScenarioSetup navigateTo={navigateTo} />;
      case 'initiate-chat':
        return <InitiateChat navigateTo={navigateTo} />;
      case 'chat':
        return <ChatScreen navigateTo={navigateTo} params={chatParams} />;
      case 'history':
        return <HistoryScreen navigateTo={navigateTo} />;
      default:
        return <Welcome navigateTo={navigateTo} />;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return renderScreen();
}
