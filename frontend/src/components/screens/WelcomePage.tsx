'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui';
import { ScenarioSetup } from './ScenarioSetup';
import { getScenarios, Scenario } from '@/utils/supabaseQueries';
import { motion } from 'framer-motion';

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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {!selectedScenarioId && <Header title="Union Training Bot" variant="alt" />}
      <div className="flex flex-col flex-grow">
        {selectedScenarioId ? (
          <ScenarioSetup 
            scenarioId={selectedScenarioId} 
            onBack={() => setSelectedScenarioId(null)}
          />
        ) : (
          <>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
              <div className="max-w-4xl mx-auto py-12 sm:py-20">
                <motion.h1 
                  className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Welcome to Union Training Bot
                </motion.h1>
                <motion.p 
                  className="mb-12 text-xl sm:text-2xl text-gray-700 dark:text-gray-300 text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Select a training scenario to begin your interactive learning experience:
                </motion.p>
                <motion.div 
                  className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {scenarios.map((scenario, index) => (
                    <motion.div 
                      key={scenario.id} 
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">{scenario.title}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">{scenario.description}</p>
                      <Button
                        variant="progress"
                        text="Start Scenario"
                        onClick={() => handleScenarioSelect(scenario.id)}
                        className="w-full text-lg py-3"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </main>
            <footer className="bg-pcsprimary02-light dark:bg-pcsprimary-05 py-8">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
                <div className="max-w-md mx-auto">
                  <Button
                    variant="progress"
                    text="Create an Account"
                    onClick={() => {}}
                    className="w-full text-lg py-3"
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
