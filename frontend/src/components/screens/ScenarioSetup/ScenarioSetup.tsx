"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Header } from "../../Header";
// import { getScenarios, Scenario } from '@/utils/supabaseQueries';

import { Loader } from "react-feather";

import { Skeleton } from "../../ui/Skeleton";
import { Persona } from "@/types/persona";
import axios from "axios";
import ScenarioDescription from "./ScenarioDescription";
import { useAtom } from "jotai";
import { scenarioAtom, selectedPersonaAtom } from "@/store";

import PersonaDetails from "./PersonaDetails";

interface ScenarioSetupProps {
  scenarioId: string;
}

async function generatePersona(): Promise<Persona> {
  const persona = await axios.get<Persona>("/api/persona/generate-new-persona");

  return persona.data;
}

// async function getScenarios() {
//   const scenarios = await axios.get<TrainingScenario[]>("/api/scenarios/get-scenarios");
//   return scenarios.data;
// }

export const ScenarioSetup: React.FC<ScenarioSetupProps> = () => {
  const router = useRouter();
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [scenario] = useAtom(scenarioAtom);
  const [selectedPersona, setSelectedPersona] = useAtom(selectedPersonaAtom);

  useEffect(() => {
    const initializePersonas = async () => {
      setIsLoading(true);
      try {
        if (!currentPersona) {
          const newPersona = await generatePersona();
          if (newPersona) {
            // setCurrentPersona(newPersona);
            setSelectedPersona(newPersona);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializePersonas();
  }, [scenario, currentPersona, setSelectedPersona]);

  const handleGenerateNewPersona = async () => {
    setIsGeneratingPersona(true);
    try {
      const newPersona = await generatePersona();
      if (newPersona) {
        setCurrentPersona(newPersona);
      }
    } catch (error) {
      console.error("Error generating persona:", error);
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  const navigateTo = useCallback(
    async (screen: string) => {
      if (!currentPersona) return;

      setIsNavigating(!isNavigating);

      try {
        setSelectedPersona(currentPersona);
        // Wait for exit animation
        await new Promise((resolve) => setTimeout(resolve, 300));
        router.push(`/${screen}?scenarioId=${scenario?.id}`);
      } catch (error) {
        console.error("Error navigating:", error);
        setIsNavigating(!isNavigating);
        setIsExiting(!isExiting);
      }
    },
    [currentPersona, router, scenario?.id, setSelectedPersona, isExiting, isNavigating]
  );

  const renderSkeleton = useMemo(
    () => (
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
    ),
    []
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header title={scenario?.title || "Loading..."} variant="default" />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <div className="max-w-4xl mx-auto py-12 sm:py-20">
          <div>
            <Button onClick={() => router.back()} className="mb-8">
              Back to Scenarios
            </Button>
          </div>

          {isLoading ? (
            renderSkeleton
          ) : (
            <div className="grid gap-12 lg:grid-cols-2">
              {scenario && <ScenarioDescription scenario={scenario} />}
              <PersonaDetails
                persona={selectedPersona}
                isGenerating={isGeneratingPersona}
                onGenerate={handleGenerateNewPersona}
              />
            </div>
          )}
        </div>
      </main>
      <footer className="bg-pcsprimary02-light dark:bg-pcsprimary-05 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="max-w-md mx-auto">
            <Button
              onClick={() => navigateTo("initiate-chat")}
              className="w-full py-3"
              disabled={isLoading || !currentPersona || isNavigating}>
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
