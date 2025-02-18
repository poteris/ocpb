"use client";

import React, { useState, useEffect } from "react";
import { TrainingScenario } from "@/types/scenarios";
import axios from "axios";
import { useRouter } from "next/navigation";
import ScenarioCard, { ScenarioCardSkeleton } from "./ScenarioCard";
import WelcomeMessage from "./WelcomeMessage";
import { v4 as uuidv4 } from "uuid";


async function getScenarios() {
  try {
    const response = await axios.get<TrainingScenario[]>("/api/scenarios");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch scenarios:", error);
    return [];
  }
}





const Welcome = () => {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<TrainingScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const handleScenarioSelect = (scenarioId: string) => {
    router.push(`/chat/${scenarioId}`);
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchScenarios = async () => {
      try {
        const scenarios = await getScenarios();
        setScenarios(scenarios);
      } catch (error) {
        console.error("Failed to fetch scenarios:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScenarios();
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Main container*/}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Welcome Message */}
          <div className="w-full lg:w-1/3 mb-8 lg:mb-0">
            <WelcomeMessage />
          </div>

          {/* Scenarios */}

          <div className="w-full lg:w-2/3">
              <h1 className="text-2xl mb-6">Your Training Scenarios</h1>
            <div className="flex flex-col gap-4">
              {isLoading ? (
                // display some skeletons while loading
                Array.from({ length: 4 }).map(() => (
                  <ScenarioCardSkeleton key={uuidv4()} />
                ))
              ) : (
                scenarios.map((scenario) => (
                  <ScenarioCard 
                    key={scenario.id}
                    scenario={scenario} 
                    onSelect={handleScenarioSelect}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
