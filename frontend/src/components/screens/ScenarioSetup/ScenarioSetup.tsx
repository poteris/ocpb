import { useAtom } from "jotai";
import { scenarioAtom, selectedPersonaAtom } from "@/store";
import axios from "axios";
import { useEffect, useState } from "react";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import PersonaDetailsComponent from "./PersonaDetails";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { TrainingScenario } from "@/types/scenarios";
import { Persona } from "@/types/persona";
import ScenarioObjectives from "./ScenarioObjectives";
import ScenarioDescription from "./ScenarioDescription";
interface ScenarioSetupComponentProps {
    readonly scenarioId: string;
}


async function getSelectedScenario(scenarioId: string) {
    try {
        const response = await axios.get<TrainingScenario>(`/api/scenarios/${scenarioId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching scenario:", error);
        return null;
    }
}

async function generatePersona() {
    try {
        const response = await axios.get<Persona>("/api/persona/generate-new-persona");
        return response.data;
    } catch (error) {
        console.error("Error generating persona:", error);
        return null;
    }
}



export default function ScenarioSetup({ scenarioId }: ScenarioSetupComponentProps) {
    const router = useRouter();
    const [, setScenario] = useAtom(scenarioAtom);
    const [persona, setPersona] = useAtom(selectedPersonaAtom);
    const [selectedScenario, setSelectedScenario] = useState<TrainingScenario | null>(null);

    useEffect(() => {
        async function fetchScenario() {
            try {
                const scenario = await getSelectedScenario(scenarioId);
                if (scenario) {
                    setScenario(scenario);
                    setSelectedScenario(scenario);
                }
            } catch (error) {
                console.error("Error fetching scenario:", error);
            }
        }
        fetchScenario();
    }, [scenarioId, setScenario]);

    useEffect(() => {
        async function fetchPersona() {
            try {
                const persona = await generatePersona();
                if (persona) {
                    setPersona(persona);
                }
            } catch (error) {
                console.error("Error generating persona:", error);
            }
        }
        fetchPersona();
    }, [setPersona]);

    function handleStartChat() {
        if (!selectedScenario || !persona) return;
        router.push(`/initiate-chat?scenarioId=${selectedScenario.id}&personaId=${persona.id}`);
    }

    return (
        <>
            {/* Scenario Header */}
            <div className="flex flex-row items-center gap-2 mt-4 md:mt-8 mx-4 md:ml-14">
                <ChevronLeft
                    className="w-4 h-4 text-gray-900 dark:text-gray-100 hover:cursor-pointer"
                    onClick={() => router.back()}
                />
                <h1 className="text-xl md:text-2xl font-regular text-gray-900 dark:text-gray-100 ">
                    {selectedScenario?.title}
                </h1>
            </div>

            <div className="flex flex-col gap-3 md:gap-4 mx-4 md:m-14 min-h-screen relative pb-28 md:pb-24">
                {/* Scenario Description */}
                <ScenarioDescription selectedScenario={selectedScenario} />

                {/* Scenario Objectives */}
                <ScenarioObjectives selectedScenario={selectedScenario} />

                {/* Persona Details */}
                <PersonaDetailsComponent persona={persona} />


                {/* Fixed Bottom Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-card-alt border-t">
                    <div className="max-w-full md:max-w-[calc(100%-7rem)] mx-auto flex justify-end">
                        <Button
                            onClick={handleStartChat}
                            className="w-full md:w-auto"
                        >
                            Start Chat
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
