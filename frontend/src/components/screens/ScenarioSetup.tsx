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

interface ScenarioSetupProps {
  scenarioId: string;
  onBack: () => void;
}

export const ScenarioSetup: React.FC<ScenarioSetupProps> = ({ scenarioId, onBack }) => {
  const router = useRouter();
  const { setScenarioInfo, setPersona } = useScenario();
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [generatedPersonas, setGeneratedPersonas] = useState<Persona[]>([]);
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [personaIndex, setPersonaIndex] = useState(0);

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

  const debouncedGenerateNewPersona = useDebounce(generateNewPersona, 300);

  const navigatePersona = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (personaIndex + 1) % generatedPersonas.length 
      : (personaIndex - 1 + generatedPersonas.length) % generatedPersonas.length;
    setPersonaIndex(newIndex);
    setCurrentPersona(generatedPersonas[newIndex]);
  };

  useEffect(() => {
    fetchScenario();
    debouncedGenerateNewPersona(); // Generate a persona when the component mounts
  }, [fetchScenario, debouncedGenerateNewPersona]);

  if (!scenario) {
    return <div>Loading...</div>;
  }

  const navigateTo = (screen: string) => {
    if (currentPersona) {
      localStorage.setItem('selectedPersona', JSON.stringify(currentPersona));
    }
    router.push(`/${screen}?scenarioId=${scenarioId}`);
  };

  const renderPersonaDetails = (persona: Persona) => {
    return `
${persona.name} is a **${persona.age}-year-old ${persona.gender.toLowerCase()}** who works as a **${persona.job}** at **${persona.workplace}**. They currently have a **${persona.busyness_level.toLowerCase()}** level of busyness.

They're **${persona.family_status.toLowerCase()}**, politically lean towards **${persona.uk_party_affiliation}**, and when it comes to union support, they feel **${persona.emotional_conditions_for_supporting_the_union.toLowerCase()}**.

${persona.name}'s personality can be characterised as **${persona.personality_traits.toLowerCase()}**. 

At work, the major issues they face include **${persona.major_issues_in_workplace.toLowerCase()}**.
    `.trim();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Header title={scenario.title} variant="default" />
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <div className="max-w-3xl mx-auto py-12">
          <Button
            variant="options"
            onClick={onBack}
            className="mb-6"
          >
            Back to Scenarios
          </Button>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Scenario Description</h2>
                <p className="text-gray-700 dark:text-gray-300">{scenario.description}</p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Objectives</h2>
                <div className="text-gray-700 dark:text-gray-300 space-y-4">
                  {scenario.objectives.map((objective, index) => (
                    <div key={index} className="mb-4">
                      <ReactMarkdown components={markdownStyles}>
                        {objective}
                      </ReactMarkdown>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Chatbot Persona</h2>
              {currentPersona ? (
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <Button 
                      variant="options"
                      onClick={() => navigatePersona('prev')} 
                      disabled={generatedPersonas.length <= 1}
                      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                    >
                      <ChevronLeft size={20} />
                    </Button>
                    <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                      {currentPersona.name}
                    </h3>
                    <Button 
                      variant="options"
                      onClick={() => navigatePersona('next')} 
                      disabled={generatedPersonas.length <= 1}
                      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                    >
                      <ChevronRight size={20} />
                    </Button>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <ReactMarkdown components={markdownStyles}>
                      {renderPersonaDetails(currentPersona)}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-6 text-center">
                  <Loader className="animate-spin inline-block mb-2" size={24} />
                  <p className="text-gray-700 dark:text-gray-300">Generating persona...</p>
                </div>
              )}
              <Button
                variant="options"
                onClick={debouncedGenerateNewPersona}
                className="w-full"
                disabled={isGeneratingPersona}
              >
                <RefreshCw className={`mr-2 ${isGeneratingPersona ? 'animate-spin' : ''}`} size={20} />
                {isGeneratingPersona ? "Generating..." : "Generate New Persona"}
              </Button>
            </section>
          </div>
        </div>
      </div>
      <footer className="bg-pcsprimary02-light dark:bg-pcsprimary-05 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="max-w-md mx-auto">
            <Button
              variant="progress"
              onClick={() => navigateTo('initiate-chat')}
              className="w-full"
            >
              Start Chat with Current Persona
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};
