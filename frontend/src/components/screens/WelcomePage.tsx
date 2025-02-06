"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
      <Header title="Rep Help" variant="alt" />
      <h1 className="text-4xl font-light ml-14">Rep Coach</h1>

      <div>
        <div className="grid grid-cols-3 h-screen">
          <div className="p-12  col-span-1 flex flex-col items-center ml-12 w-full">
            {" "}
            <Card className="border-none rounded-lg bg-slate-50 p-8">
              <CardHeader>
                <CardTitle>Welcome</CardTitle>
                <CardDescription>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam laoreet massa a tempus vehicula.
                  Suspendisse potenti. In efficitur sapien non odio feugiat vehicula. Donec vitae nisl lacinia dolor
                  sollicitudin bibendum et vitae sem. Proin eu tortor faucibus, efficitur sapien ullamcorper, sodales
                  risus. In augue turpis, elementum vel tempus in, vehicula at purus. Pellentesque vestibulum, lectus
                  vel elementum commodo, diam dolor pulvinar mi, pulvinar venenatis ligula eros id elit. Curabitur vel
                  euismod elit, eget consectetur ipsum. Cras ut erat faucibus, tempus diam vitae, suscipit turpis.
                  Vestibulum lobortis tortor ac tortor aliquam elementum. Morbi at erat consequat, dapibus enim vel,
                  porttitor nulla. Mauris sed tincidunt neque, vel facilisis eros. Duis eget porta nisi, non volutpat
                  tellus. Pellentesque tempus rhoncus odio, eget sollicitudin eros efficitur quis. Nullam aliquam odio
                  sapien, quis malesuada augue pulvinar eu. Maecenas orci arcu, bibendum iaculis posuere quis,
                  pellentesque a urna.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <div className="p-12 col-span-2 flex flex-col items-center">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className="border-none rounded-2xl bg-card p-8 w-2/3">
                <CardHeader>
                  <CardTitle>{scenario.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-row gap-2">
                    <div className="w-2/3 flex flex-row">
                      <div className="bg-slate-200 rounded-full w-10 h-10 mr-4"></div>
                      <CardDescription>{scenario.description}</CardDescription>
                    </div>
                    <div className="w-1/2 flex justify-end">
                      <Button onClick={() => handleScenarioSelect(scenario.id)} className="w-28 py-3">
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
