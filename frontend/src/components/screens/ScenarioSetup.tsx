'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui';
import { useRouter } from 'next/navigation';
import { Header } from '../Header';
import { useScenario } from '@/context/ScenarioContext';
import { getScenarios, Scenario } from '@/utils/supabaseQueries';
import { generatePersona, Persona } from '@/utils/api';
import { Loader, ChevronLeft, ChevronRight, RefreshCw } from 'react-feather';
import { useDebounce } from '@/hooks/useDebounce';
import ReactMarkdown from 'react-markdown';
import { markdownStyles } from '@/utils/markdownStyles';
import { motion } from 'framer-motion';
import { Skeleton } from '../ui/Skeleton';

interface ScenarioSetupProps {
  scenarioId: string;
  onBack: () => void;
}

export const ScenarioSetup: React.FC<ScenarioSetupProps> = ({ scenarioId, onBack }) => {
  const router = useRouter();
  const { setScenarioInfo } = useScenario();
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [generatedPersonas, setGeneratedPersonas] = useState<Persona[]>([]);
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [personaIndex, setPersonaIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  const fetchScenario = useCallback(async () => {
    const scenarios = await getScenarios();
    const foundScenario = scenarios.find(s => s.id === scenarioId);
    setScenario(foundScenario || null);
    if (foundScenario) {
      setScenarioInfo(foundScenario);
    }
  }, [scenarioId, setScenarioInfo]);

  const generateNewPersona = useCallback(async () => {
    setIsGeneratingPersona(true);
    try {
      const newPersona = await generatePersona();
      if (newPersona) {
        setGeneratedPersonas(prevPersonas => [...prevPersonas, newPersona]);
        setCurrentPersona(newPersona);
        setPersonaIndex(prevIndex => prevIndex + 1);
      }
    } catch (error) {
      console.error('Error generating persona:', error);
      // Show an error message to the user
    } finally {
      setIsGeneratingPersona(false);
    }
  }, []);

  const debouncedGenerateNewPersona = useCallback(
    useDebounce(generateNewPersona, 300),
    [generateNewPersona]
  );

  const navigatePersona = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (personaIndex + 1) % generatedPersonas.length 
      : (personaIndex - 1 + generatedPersonas.length) % generatedPersonas.length;
    setPersonaIndex(newIndex);
    setCurrentPersona(generatedPersonas[newIndex]);
  };

  useEffect(() => {
    const initializeComponent = async () => {
      setIsLoading(true);
      await fetchScenario();
      await debouncedGenerateNewPersona();
      setIsLoading(false);
    };

    initializeComponent();
  }, [fetchScenario, debouncedGenerateNewPersona]);

  const renderPersonaDetails = (persona: Persona) => {
    return `
${persona.name} is a **${persona.age}-year-old ${persona.gender.toLowerCase()}** who works as a **${persona.job}** at **${persona.workplace}**. They currently have a **${persona.busyness_level.toLowerCase()}** level of busyness.

They're **${persona.family_status.toLowerCase()}**, politically lean towards **${persona.uk_party_affiliation}**, and when it comes to union support, they feel **${persona.emotional_conditions_for_supporting_the_union.toLowerCase()}**.

${persona.name}'s personality can be characterised as **${persona.personality_traits.toLowerCase()}**. 

At work, the major issues they face include **${persona.major_issues_in_workplace.toLowerCase()}**.
    `.trim();
  };

  const renderSkeleton = () => (
    <div className="grid gap-12 lg:grid-cols-2">
      <div>
        <Skeleton className="h-8 w-3/4 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-4/5 mb-8" />
        
        <Skeleton className="h-8 w-3/4 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div>
        <Skeleton className="h-8 w-3/4 mb-6" />
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
          <Skeleton className="h-6 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-4/5 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );

  const navigateTo = async (screen: string) => {
    if (!currentPersona) return;
    
    setIsNavigating(true);
    try {
      localStorage.setItem('selectedPersona', JSON.stringify(currentPersona));
      router.push(`/${screen}?scenarioId=${scenarioId}`);
    } catch (error) {
      console.error('Error navigating:', error);
      setIsNavigating(false);
    }
  };

  const renderPersonaSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-4/5 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header title={scenario?.title || 'Loading...'} variant="default" />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <div className="max-w-4xl mx-auto py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="options"
              onClick={onBack}
              className="mb-8"
            >
              Back to Scenarios
            </Button>
          </motion.div>
          
          {isLoading ? renderSkeleton() : (
            <div className="grid gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <section className="mb-12">
                  <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Scenario Description</h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300">{scenario?.description}</p>
                </section>
                
                <section>
                  <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Objectives</h2>
                  <div className="text-lg text-gray-700 dark:text-gray-300 space-y-4">
                    {scenario?.objectives.map((objective, index) => (
                      <div key={index} className="mb-4">
                        <ReactMarkdown components={markdownStyles}>
                          {objective}
                        </ReactMarkdown>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>

              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Chatbot Persona</h2>
                {isGeneratingPersona ? (
                  renderPersonaSkeleton()
                ) : currentPersona ? (
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <Button 
                        variant="options"
                        onClick={() => navigatePersona('prev')} 
                        disabled={generatedPersonas.length <= 1}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                      >
                        <ChevronLeft size={24} />
                      </Button>
                      <h3 className="font-semibold text-2xl text-gray-900 dark:text-gray-100">
                        {currentPersona.name}
                      </h3>
                      <Button 
                        variant="options"
                        onClick={() => navigatePersona('next')} 
                        disabled={generatedPersonas.length <= 1}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                      >
                        <ChevronRight size={24} />
                      </Button>
                    </div>
                    <div className="text-lg text-gray-700 dark:text-gray-300">
                      <ReactMarkdown components={markdownStyles}>
                        {renderPersonaDetails(currentPersona)}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8 text-center">
                    <Loader className="animate-spin inline-block mb-4" size={32} />
                    <p className="text-lg text-gray-700 dark:text-gray-300">Generating persona...</p>
                  </div>
                )}
                <Button
                  variant="options"
                  onClick={generateNewPersona}
                  className="w-full text-lg py-3"
                  disabled={isGeneratingPersona}
                >
                  <RefreshCw className={`mr-2 ${isGeneratingPersona ? 'animate-spin' : ''}`} size={24} />
                  {isGeneratingPersona ? "Generating..." : "Generate New Persona"}
                </Button>
              </motion.section>
            </div>
          )}
        </div>
      </main>
      <footer className="bg-pcsprimary02-light dark:bg-pcsprimary-05 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="max-w-md mx-auto">
            <Button
              variant="progress"
              onClick={() => navigateTo('initiate-chat')}
              className="w-full text-lg py-3"
              disabled={isLoading || !currentPersona || isNavigating}
            >
              {isNavigating ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Preparing Chat...
                </>
              ) : (
                "Start Chat with Current Persona"
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};
