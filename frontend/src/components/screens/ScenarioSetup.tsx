'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui';
import { useRouter } from 'next/navigation';
import { Header } from '../Header';
import { useScenario, PersonaInfo } from '@/context/ScenarioContext';
import { getScenarios, getRandomPersona, Scenario } from '@/utils/supabaseQueries';

interface ScenarioSetupProps {
  scenarioId: string;
  onBack: () => void;
}

export const ScenarioSetup: React.FC<ScenarioSetupProps> = ({ scenarioId, onBack }) => {
  const router = useRouter();
  const { setScenarioInfo, setPersonaInfo } = useScenario();
  const [currentPersona, setCurrentPersona] = useState<PersonaInfo | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);

  const fetchScenario = useCallback(async () => {
    const scenarios = await getScenarios();
    const foundScenario = scenarios.find(s => s.id === scenarioId);
    setScenario(foundScenario || null);
    if (foundScenario) {
      setScenarioInfo(foundScenario);
    }
  }, [scenarioId, setScenarioInfo]);

  const selectRandomPersona = useCallback(async () => {
    const selectedPersona = await getRandomPersona();
    if (selectedPersona) {
      setPersonaInfo(selectedPersona);
      setCurrentPersona(selectedPersona);
    }
  }, [setPersonaInfo]);

  useEffect(() => {
    fetchScenario();
    selectRandomPersona();
  }, [fetchScenario, selectRandomPersona]);

  if (!scenario) {
    return <div>Loading...</div>;
  }

  const navigateTo = (screen: string) => {
    router.push(`/${screen}?scenarioId=${scenarioId}`);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <Header title={scenario.title} variant="default" />
      <div className="flex-grow max-w-md mx-auto p-6 overflow-y-auto">
        <Button
          variant="options"
          text="Back to Scenarios"
          onClick={onBack}
          className="mb-4"
        />
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Scenario Description</h2>
          <p className="text-gray-700 dark:text-gray-300">{scenario.description}</p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Objectives</h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
            {scenario.objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Chatbot Persona</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The chatbot will assume the following persona during your chat. You can change this persona if you'd like to practice with a different character.
          </p>
          {currentPersona && (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Current Chatbot Persona</h3>
              <p className="text-gray-700 dark:text-gray-300"><strong>Character Type:</strong> {currentPersona.characterType}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Mood:</strong> {currentPersona.mood}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Age Range:</strong> {currentPersona.ageRange}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Context:</strong> {currentPersona.context}</p>
            </div>
          )}
          <Button
            variant="options"
            text="Change chatbot Persona"
            onClick={selectRandomPersona}
            className="mt-4 w-full"
          />
        </section>
      </div>
      <footer className="bg-pcsprimary02-light dark:bg-pcsprimary-05 p-4">
        <div className="max-w-md mx-auto">
          <Button
            variant="progress"
            text="Start Chat with Current Persona"
            onClick={() => navigateTo('initiate-chat')}
            className="w-full"
          />
        </div>
      </footer>
    </div>
  );
};
