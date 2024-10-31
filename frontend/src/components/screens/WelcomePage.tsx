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
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    async function fetchScenarios() {
      const fetchedScenarios = await getScenarios();
      setScenarios(fetchedScenarios);
    }
    fetchScenarios();
  }, []);

  const handleScenarioSelect = async (scenarioId: string) => {
    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setSelectedScenarioId(scenarioId);
    onScenarioSelect(scenarioId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {!selectedScenarioId && <Header title="Union Training Bot" variant="alt" />}
      <div className="flex flex-col flex-grow">
        {selectedScenarioId ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-grow"
          >
            <ScenarioSetup 
              scenarioId={selectedScenarioId} 
              onBack={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setSelectedScenarioId(null);
                  setIsTransitioning(false);
                }, 300);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isTransitioning ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
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
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                  initial="hidden"
                  animate="show"
                >
                  {scenarios.map((scenario) => (
                    <motion.div 
                      key={scenario.id} 
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      }}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                        {scenario.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {scenario.description}
                      </p>
                      <Button
                        variant="progress"
                        text="Start Scenario"
                        onClick={() => handleScenarioSelect(scenario.id)}
                        className="w-full text-lg py-3"
                        disabled={isTransitioning}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </main>
          </motion.div>
        )}
      </div>
    </div>
  );
};
