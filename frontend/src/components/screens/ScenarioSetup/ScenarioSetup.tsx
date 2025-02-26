import { useAtom } from "jotai";
import { scenarioAtom, selectedPersonaAtom } from "@/store";
import axios from "axios";
import { useEffect, useState } from "react";

import PersonaDetailsComponent from "./PersonaDetails";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { TrainingScenario } from "@/types/scenarios";
import { Persona } from "@/types/persona";
import ScenarioObjectives from "./ScenarioObjectives";
import ScenarioDescription from "./ScenarioDescription";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonBlock } from "./SkeletonBlock";

interface ScenarioSetupComponentProps {
    readonly scenarioId: string;
}

const ScenarioSetupSkeleton = () => {
    return (
        <>
            {/* Skeleton Header */}
            <div className="flex flex-row items-center gap-2 mt-4 md:mt-8 mx-4 md:ml-14">
                <ChevronLeft
                    className="w-4 h-4 text-gray-900  hover:cursor-pointer"
                />
                <Skeleton className="h-8 w-48" />
            </div>

            <div className="flex flex-col gap-3 md:gap-4 mx-4 md:m-14 min-h-screen relative pb-28 md:pb-24">
                {/* Description Card Skeleton */}
                <SkeletonBlock />

                {/* Objectives Card Skeleton */}
                <SkeletonBlock />

                {/* Persona Card Skeleton */}
                <SkeletonBlock />

                {/* Fixed Bottom Button Skeleton */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-card-alt border-t">
                    <div className="max-w-full md:max-w-[calc(100%-7rem)] mx-auto flex justify-end">
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
            </div>
        </>
    );
};

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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [scenarioData, personaData] = await Promise.all([
                    getSelectedScenario(scenarioId),
                    generatePersona()
                ]);

                if (scenarioData) {
                    setScenario(scenarioData);
                    setSelectedScenario(scenarioData);
                }

                if (personaData) {
                    setPersona(personaData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [scenarioId, setScenario, setPersona]);

    if (isLoading) {
        return <ScenarioSetupSkeleton />;
    }

    function handleStartChat() {
        if (!selectedScenario || !persona) return;
        router.push(`/initiate-chat?scenarioId=${selectedScenario.id}&personaId=${persona.id}`);
    }

    return (
        <>
            {/* Scenario Header */}
            <div className="flex flex-row items-center gap-2 mt-4 md:mt-8 mx-4 md:ml-14">
                <ChevronLeft
                    data-testid="backButton"
                    className="w-4 h-4 text-gray-900 hover:cursor-pointer"
                    onClick={() => router.back()}
                />
                <h1 className="text-xl md:text-2xl font-regular text-gray-900 ">
                    {selectedScenario?.title}
                </h1>
            </div>

            <div className="flex flex-col gap-3 md:gap-4 mx-4 md:m-14 min-h-screen relative pb-28 md:pb-24">
                {selectedScenario && (
                    <>
                        <ScenarioDescription selectedScenario={selectedScenario} />
                        <ScenarioObjectives selectedScenario={selectedScenario} />
                        <PersonaDetailsComponent persona={persona} />
                    </>
                )}

                {/* Fixed Bottom Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-card-alt border-t">
                    <div className="max-w-full md:max-w-[calc(100%-7rem)] mx-auto flex justify-end">
                        <Button
                            onClick={handleStartChat}
                            className="w-full md:w-auto"
                            data-testid="startChatButton"
                        >
                            Start Chat
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
