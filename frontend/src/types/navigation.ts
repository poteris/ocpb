export type Screen = 'welcome' | 'scenario-setup' | 'initiate-chat' | 'chat' | 'history';

export type NavigateParams = {
  firstMessage?: string;
  sessionId?: string;
};