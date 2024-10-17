'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface ScenarioInfo {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  prompts?: string[];
}

export interface PersonaInfo {
  id: string;
  characterType: string;
  mood: string;
  ageRange: string;
  context: string;
}

interface ScenarioContextType {
  scenarioInfo: ScenarioInfo | null;
  setScenarioInfo: (info: ScenarioInfo | null) => void;
  personaInfo: PersonaInfo | null;
  setPersonaInfo: (info: PersonaInfo | null) => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scenarioInfo, setScenarioInfo] = useState<ScenarioInfo | null>(null);
  const [personaInfo, setPersonaInfo] = useState<PersonaInfo | null>(null);

  return (
    <ScenarioContext.Provider value={{ scenarioInfo, setScenarioInfo, personaInfo, setPersonaInfo }}>
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
