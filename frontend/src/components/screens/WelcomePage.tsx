'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui';
import { ScenarioSetup } from './ScenarioSetup';
import { getScenarios, Scenario } from '@/utils/supabaseQueries';

interface WelcomeProps {
  onScenarioSelect: (scenarioId: string) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onScenarioSelect }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    async function fetchScenarios() {
      const fetchedScenarios = await getScenarios();
      setScenarios(fetchedScenarios);
    }
    fetchScenarios();
  }, []);

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    onScenarioSelect(scenarioId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {!selectedScenarioId && <Header title="Union Training Bot" variant="alt" />}
      <div className="flex flex-col flex-grow">
        {selectedScenarioId ? (
          <ScenarioSetup 
            scenarioId={selectedScenarioId} 
            onBack={() => setSelectedScenarioId(null)}
          />
        ) : (
          <>
            <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
              <div className="max-w-3xl mx-auto py-12">
                <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">Welcome to Union Training Bot</h1>
                <p className="mb-8 text-xl text-gray-700 dark:text-gray-300">
                  Select a training scenario to begin your interactive learning experience:
                </p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">{scenario.title}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{scenario.description}</p>
                      <Button
                        variant="progress"
                        text="Start Scenario"
                        onClick={() => handleScenarioSelect(scenario.id)}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <footer className="bg-pcsprimary02-light dark:bg-pcsprimary-05 py-8">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
                <div className="max-w-md mx-auto">
                  <Button
                    variant="progress"
                    text="Create an Account"
                    onClick={() => {}}
                    className="w-full"
                  />
                </div>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
