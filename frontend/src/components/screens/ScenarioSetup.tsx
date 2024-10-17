'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui';
import { useRouter } from 'next/navigation';
import scenarioData from '@/lib/scenarios.json';
import personaData from '@/lib/personas.json';
import { Header } from '../Header';

interface ScenarioSetupProps {
  scenarioId: string;
  onBack: () => void;
}

interface Persona {
  id: string;
  characterType: string;
  mood: string;
  ageRange: string;
  context: string;
}

export const ScenarioSetup: React.FC<ScenarioSetupProps> = ({ scenarioId, onBack }) => {
  const router = useRouter();
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);

  const scenario = scenarioData.scenarios.find((s) => s.id === scenarioId);

  const selectRandomPersona = () => {
    const randomIndex = Math.floor(Math.random() * personaData.personas.length);
    setCurrentPersona(personaData.personas[randomIndex]);
  };

  useEffect(() => {
    selectRandomPersona();
  }, []);

  if (!scenario) {
    return <div>Scenario not found</div>;
  }

  const navigateTo = (screen: string) => {
    router.push(`/${screen}?scenarioId=${scenarioId}&scenarioTitle=${encodeURIComponent(scenario.title)}&personaId=${currentPersona?.id}`);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title={scenario.title} variant="default" />
      <div className="flex-grow max-w-md mx-auto p-6 overflow-y-auto">
        <Button
          variant="options"
          text="Back to Scenarios"
          onClick={onBack}
          className="mb-4"
        />
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Scenario Description</h2>
          <p>{scenario.description}</p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Objectives</h2>
          <ul className="list-disc list-inside">
            {scenario.objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </section>

        {currentPersona && (
          <section className="mb-6 bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Current Persona</h2>
            <p><strong>Character Type:</strong> {currentPersona.characterType}</p>
            <p><strong>Mood:</strong> {currentPersona.mood}</p>
            <p><strong>Age Range:</strong> {currentPersona.ageRange}</p>
            <p><strong>Context:</strong> {currentPersona.context}</p>
          </section>
        )}
      </div>
      <footer className="bg-pcsprimary02-light p-4">
        <div className="max-w-md mx-auto flex space-x-4">
          <Button
            variant="options"
            text="Change Persona"
            onClick={selectRandomPersona}
            className="flex-1"
          />
          <Button
            variant="progress"
            text="Start Chat"
            onClick={() => navigateTo('initiate-chat')}
            className="flex-1"
          />
        </div>
      </footer>
    </div>
  );
};
