'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
// import { Persona } from '@/utils/api';
import { Persona } from '@/types/persona';

export interface ScenarioInfo {
  id: string;
  title: string;
  description: string;
  objectives: string[];
}

interface ScenarioContextType {
  scenarioInfo: ScenarioInfo | null;
  setScenarioInfo: (info: ScenarioInfo | null) => void;
  persona: Persona | null;
  setPersona: (info: Persona | null) => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scenarioInfo, setScenarioInfo] = useState<ScenarioInfo | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);

  return (
    <ScenarioContext.Provider value={{ scenarioInfo, setScenarioInfo, persona, setPersona }}>
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = () => {
  const context = useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
};
