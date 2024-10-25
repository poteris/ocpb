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

  const selectRandomPersona = useCallback(async () => {
    const selectedPersona = await generatePersona();
    console.log('Generated Persona:', selectedPersona);
    if (selectedPersona) {
      setPersona(selectedPersona);
      setCurrentPersona(selectedPersona);
    }
  }, [setPersona]);

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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <Header title={scenario.title} variant="default" />
      <div className="flex-grow max-w-md mx-auto p-6 overflow-y-auto">
        <Button
          variant="options"
          onClick={onBack}
          className="mb-4"
        >
          Back to Scenarios
        </Button>
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
          {currentPersona ? (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <Button 
                  variant="options"
                  onClick={() => navigatePersona('prev')} 
                  disabled={generatedPersonas.length <= 1}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </Button>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
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
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Age:</strong> {currentPersona.age}</li>
                <li><strong>Gender:</strong> {currentPersona.gender}</li>
                <li><strong>Job:</strong> {currentPersona.job}</li>
                <li><strong>Workplace:</strong> {currentPersona.workplace}</li>
                <li><strong>Busyness Level:</strong> {currentPersona.busyness_level}</li>
                <li><strong>Family Status:</strong> {currentPersona.family_status}</li>
                <li><strong>Political Leanings:</strong> {currentPersona.uk_party_affiliation}</li>
                <li><strong>Union Support:</strong> {currentPersona.emotional_conditions_for_supporting_the_union}</li>
                <li><strong>Personality Traits:</strong> {currentPersona.personality_traits}</li>
                <li><strong>Major Workplace Issues:</strong> {currentPersona.major_issues_in_workplace}</li>
              </ul>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 text-center">
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
      <footer className="bg-pcsprimary02-light dark:bg-pcsprimary-05 p-4">
        <div className="max-w-md mx-auto">
          <Button
            variant="progress"
            onClick={() => navigateTo('initiate-chat')}
            className="w-full"
          >
            Start Chat with Current Persona
          </Button>
        </div>
      </footer>
    </div>
  );
};
