'use client';

import { RouterProvider, useRouter } from "@/utils/router";
import { Welcome } from '@/components/screens/WelcomePage';
import { ScenarioSetup } from '@/components/screens/ScenarioSetup';
import { InitiateChat } from '@/components/screens/InitiateChat';
import { ChatScreen } from '@/components/screens/ChatScreen';
import { HistoryScreen } from '@/components/screens/History';

function AppContent() {
  const { currentScreen } = useRouter();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <Welcome />;
      case 'scenario-setup':
        return <ScenarioSetup />;
      case 'initiate-chat':
        return <InitiateChat />;
      case 'chat':
        return <ChatScreen />;
      case 'history':
        return <HistoryScreen />;
      default:
        return <Welcome />;
    }
  };

  return renderScreen();
}

export default function Home() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
