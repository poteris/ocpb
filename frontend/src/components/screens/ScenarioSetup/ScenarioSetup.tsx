"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Header } from "../../Header";
import { Loader } from "react-feather";
import { Skeleton } from "../../ui/Skeleton";
import axios from "axios";
import ScenarioDescription from "./ScenarioDescription";
import { useAtom } from "jotai";
import { scenarioAtom, selectedPersonaAtom } from "@/store";
import PersonaDetails from "./PersonaDetails";
import { useState } from "react";

async function generatePersona() {
  try {
    const response = await axios.get("/api/persona/generate-new-persona");
    return response.data;
  } catch (error) {
    console.error("Error generating persona:", error);
    return null;
  }
}

interface ScenarioSetupProps {
  scenarioId: string;
}

export const ScenarioSetup = ({ scenarioId }: ScenarioSetupProps) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [scenario, setScenario] = useAtom(scenarioAtom);
  const [selectedPersona, setSelectedPersona] = useAtom(selectedPersonaAtom);
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);

  const getSelectedScenario = useCallback(
    async (scenarioId: string) => {
      try {
        const response = await axios.get(`/api/scenarios/${scenarioId}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching scenario:", error);
        router.push("/");
        return null;
      }
    },
    [router]
  );

  useEffect(() => {
    if (scenarioId && (!scenario || scenario.id !== scenarioId)) {
      getSelectedScenario(scenarioId).then((fetchedScenario) => {
        if (fetchedScenario) {
          setScenario(fetchedScenario);
        }
      });
    }
  }, [scenarioId, scenario, getSelectedScenario, setScenario]);

  useEffect(() => {
    if (!selectedPersona && !isGeneratingPersona) {
      generatePersona().then((newPersona) => {
        if (newPersona) {
          setSelectedPersona(newPersona);
        }
      });
    }
  }, [selectedPersona, setSelectedPersona, isGeneratingPersona]);

  const handleGenerateNewPersona = async () => {
    setIsGeneratingPersona(true);
    try {
      const newPersona = await generatePersona();
      if (newPersona) {
        setSelectedPersona(newPersona);
        setIsGeneratingPersona(false);
      }
    } catch (error) {
      console.error("Error generating persona:", error);
      setIsGeneratingPersona(false);
    }
  };

  const navigateToChat = useCallback(async () => {
    if (!selectedPersona || !scenario) return;

    setIsNavigating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      router.push(`/initiate-chat?scenarioId=${scenario.id}`);
    } catch (error) {
      console.error("Error navigating:", error);
      setIsNavigating(false);
    }
  }, [selectedPersona, scenario, router]);

  const renderSkeleton = (
    <div className="grid gap-12 lg:grid-cols-2">
      <div>
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
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header title={scenario?.title || "Loading..."} variant="default" />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <div className="max-w-4xl mx-auto py-12 sm:py-20">
          <Button onClick={() => router.back()} className="mb-8">
            Back to Scenarios
          </Button>

          {!scenario ? (
            renderSkeleton
          ) : (
            <div className="grid gap-12 lg:grid-cols-2">
              <ScenarioDescription scenario={scenario} />
              {isGeneratingPersona ? (
                <div className="flex justify-center items-center">
                  <Loader className="animate-spin" size={32} />
                </div>
              ) : (
                <PersonaDetails
                  persona={selectedPersona}
                  isGenerating={!selectedPersona}
                  onGenerate={handleGenerateNewPersona}
                />
              )}
            </div>
          )}
        </div>
      </main>
      <footer className="bg-pcsprimary02-light dark:bg-pcsprimary-05 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <div className="max-w-md mx-auto">
            <Button
              onClick={navigateToChat}
              className="w-full py-3"
              disabled={!selectedPersona || !scenario || isNavigating || isGeneratingPersona}>
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
