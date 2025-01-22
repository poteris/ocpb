'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui';
import { useRouter } from 'next/navigation';
import { Header } from '../Header';
import { useScenario } from '@/context/ScenarioContext';
import { getScenarios, Scenario } from '@/utils/supabaseQueries';
import { generatePersona, Persona } from '@/utils/api';
import { Loader, RefreshCw } from 'react-feather';
import ReactMarkdown from 'react-markdown';
import { markdownStyles } from '@/utils/markdownStyles';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';

interface ScenarioSetupProps {
  scenarioId: string;
  onBack: () => void;
}

const ScenarioDescription = React.memo(function ScenarioDescription({ scenario }: { scenario: Scenario | null }) {
  return (
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
  );
});

const PersonaDetails = React.memo(function PersonaDetails({ 
  persona, 
  isGenerating, 
  onGenerate 
}: {
  persona: Persona | null;
  isGenerating: boolean;
  onGenerate: () => void;
}) {
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

  const renderPersonaDetails = (persona: Persona) => {
    return `
### Personal Background
${persona.name} is a **${persona.age}-year-old ${persona.gender.toLowerCase()}** who works as a **${persona.job}** at **${persona.workplace}**. They're **${persona.family_status.toLowerCase()}** and are segmented as a **${persona.segment}**.

### Work & Political Context
* **Workplace Role:** ${persona.job}
* **Busyness Level:** ${persona.busyness_level}
* **Political Affiliation:** ${persona.uk_party_affiliation}

### Personality & Workplace Issues
${persona.name}'s personality can be characterised as **${persona.personality_traits.toLowerCase()}**. 

At work, they face several challenges:
${persona.major_issues_in_workplace}

### Union Perspective
Their emotional conditions for supporting the union are:
${persona.emotional_conditions}
  `.trim();
  };

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Chatbot Persona</h2>
      {isGenerating ? (
        renderPersonaSkeleton()
      ) : persona ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
          <h3 className="font-semibold text-2xl text-gray-900 dark:text-gray-100 mb-6 text-center">
            {persona.name}
          </h3>
          <div className="text-lg text-gray-700 dark:text-gray-300">
            <ReactMarkdown components={markdownStyles}>
              {renderPersonaDetails(persona)}
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
        onClick={onGenerate}
        className="w-full text-lg py-3"
        disabled={isGenerating}
      >
        <RefreshCw className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`} size={24} />
        {isGenerating ? "Generating..." : "Generate New Persona"}
      </Button>
    </motion.section>
  );
});

export const ScenarioSetup: React.FC<ScenarioSetupProps> = ({ scenarioId, onBack }) => {
  const router = useRouter();
  const { setScenarioInfo } = useScenario();
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const fetchScenario = useCallback(async () => {
    const scenarios = await getScenarios();
    const foundScenario = scenarios.find(s => s.id === scenarioId);
    setScenario(foundScenario || null);
    if (foundScenario) {
      setScenarioInfo(foundScenario);
    }
  }, [scenarioId, setScenarioInfo]);

  // Simplified initialization effect
  useEffect(() => {
    const initializePersonas = async () => {
      setIsLoading(true);
      try {
        await fetchScenario();
        
        // Only get the most recent persona for this scenario
        const storedPersonaStr = localStorage.getItem(`currentPersona_${scenarioId}`);
        const storedPersona: Persona | null = storedPersonaStr ? JSON.parse(storedPersonaStr) : null;
        
        if (storedPersona) {
          setCurrentPersona(storedPersona);
        } else {
          const newPersona = await generatePersona();
          if (newPersona) {
            setCurrentPersona(newPersona);
            localStorage.setItem(`currentPersona_${scenarioId}`, JSON.stringify(newPersona));
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializePersonas();
  }, [fetchScenario, scenarioId]);

  // Wrap the raw generate function in useCallback
  const generatePersonaRaw = useCallback(async () => {
    setIsGeneratingPersona(true);
    try {
      const newPersona = await generatePersona();
      if (newPersona) {
        setCurrentPersona(newPersona);
        localStorage.setItem(`currentPersona_${scenarioId}`, JSON.stringify(newPersona));
      }
    } catch (error) {
      console.error('Error generating persona:', error);
    } finally {
      setIsGeneratingPersona(false);
    }
  }, [scenarioId]);

  // Create debounced version
  const generateNewPersona = useDebounce(generatePersonaRaw, 500);

  const handleBack = () => {
    // Clear stored current persona but keep generated personas
    localStorage.removeItem('selectedPersona');
    onBack();
  };

  const navigateTo = useCallback(async (screen: string) => {
    if (!currentPersona) return;
    
    setIsNavigating(true);
    setIsExiting(true);
    
    try {
      // Store current persona in localStorage
      localStorage.setItem('selectedPersona', JSON.stringify(currentPersona));
      // Wait for exit animation
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push(`/${screen}?scenarioId=${scenarioId}`);
    } catch (error) {
      console.error('Error navigating:', error);
      setIsNavigating(false);
      setIsExiting(false);
    }
  }, [currentPersona, router, scenarioId]);

  const renderSkeleton = useMemo(() => (
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
  ), []);

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
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
                onClick={handleBack}
                className="mb-8"
              >
                Back to Scenarios
              </Button>
            </motion.div>
            
            {isLoading ? renderSkeleton : (
              <div className="grid gap-12 lg:grid-cols-2">
                <ScenarioDescription scenario={scenario} />
                <PersonaDetails
                  persona={currentPersona}
                  isGenerating={isGeneratingPersona}
                  onGenerate={generateNewPersona}
                />
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
      </motion.div>
    </AnimatePresence>
  );
};
