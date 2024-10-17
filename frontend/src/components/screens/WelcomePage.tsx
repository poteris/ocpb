'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui';
import scenarioData from '@/lib/scenarios.json';
import { ScenarioSetup } from './ScenarioSetup';

export const Welcome: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  const onScenarioSelect = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
  };

  return (
    <div className="flex flex-col h-full">
      {!selectedScenarioId && <Header title="Union Training Bot" variant="alt" />}
      <div className="flex flex-col h-full">
        {selectedScenarioId ? (
          <ScenarioSetup 
            scenarioId={selectedScenarioId} 
            onBack={() => setSelectedScenarioId(null)}
          />
        ) : (
          <>
            <div className="flex-grow max-w-md mx-auto p-6 overflow-y-auto">
              <h1 className="text-3xl font-bold mb-4">Welcome to Union Training Bot</h1>
              <p className="mb-6">
                Select a training scenario to begin your interactive learning experience:
              </p>
              <div className="space-y-4">
                {scenarioData.scenarios.map((scenario) => (
                  <div key={scenario.id} className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">{scenario.title}</h2>
                    <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                    <Button
                      variant="progress"
                      text="Start Scenario"
                      onClick={() => onScenarioSelect(scenario.id)}
                      className="w-full mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>
            <footer className="bg-pcsprimary02-light p-4">
              <div className="max-w-md mx-auto">
                <Button
                  variant="progress"
                  text="Create an Account"
                  onClick={() => {}}
                  className="w-full"
                />
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
