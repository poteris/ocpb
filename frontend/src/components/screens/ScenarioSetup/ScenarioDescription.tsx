import { TrainingScenario } from "@/types/scenario";

interface ScenarioDescriptionProps {
    selectedScenario: TrainingScenario;
}

const ScenarioDescription: React.FC<ScenarioDescriptionProps> = ({ selectedScenario }) => {
    return (
        <div className="border-none rounded-[16px] md:rounded-[20px] bg-card p-2 bg-card-alt shadow-md">
            <div className="p-3 md:p-4">
                <h2 className="font-normal capitalize text-[20px] md:text-[24px]">
                    Description
                </h2>
            </div>
            <div className="p-3 md:p-4">
                <p className="text-sm md:text-base">
                    {selectedScenario?.description}
                </p>
            </div>
        </div>
    );
};

export default ScenarioDescription;