import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { TrainingScenario } from "@/types/scenario";

interface ScenarioDescriptionProps {
    selectedScenario: TrainingScenario;
}

const ScenarioDescription: React.FC<ScenarioDescriptionProps> = ({ selectedScenario }) => {
    return (
        <div className="border-none rounded-[16px] md:rounded-[20px] bg-card p-2 bg-card-alt shadow-md">
            <CardHeader className="p-3 md:p-4">
                <CardTitle className="font-normal capitalize text-[20px] md:text-[24px]">
                    Description
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4">
                <CardDescription className="text-sm md:text-base">
                    {selectedScenario?.description}
                </CardDescription>
            </CardContent>
        </div>
    );
};

export default ScenarioDescription;