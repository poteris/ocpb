"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { TrainingScenario } from "@/types/scenarios";
import axios from "axios";
import Link from "next/link";

export const Welcome = () => {
  const [scenarios, setScenarios] = useState<TrainingScenario[]>([]);
  useEffect(() => {
    async function fetchScenarios() {
      try {
        const response = await axios.get<TrainingScenario[]>("/api/scenarios");
        setScenarios(response.data);
      } catch (error) {
        console.error("Failed to fetch scenarios:", error);
      }
    }
    fetchScenarios();
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header title="Union Training Bot" variant="alt" />
      <div className="flex flex-col flex-grow">
        <div>
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
            <div className="max-w-4xl mx-auto py-12 sm:py-20">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
                Welcome to the Union Training Bot
              </h1>
              <p className="mb-12 text-xl sm:text-2xl text-gray-700 dark:text-gray-300 text-center">
                Select a training scenario to begin your interactive learning experience:
              </p>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">{scenario.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{scenario.description}</p>
                    <Link href={`/scenario-setup?scenarioId=${scenario.id}`}>
                      <Button className="w-full py-3">Start Scenario</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
