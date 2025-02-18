import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { v4 as uuidv4 } from 'uuid';
import { TrainingScenario } from '@/types/scenarios';

export default function ScenarioObjectives({ selectedScenario }: { readonly selectedScenario: TrainingScenario }) {
    return (
        <div className="border-none rounded-[16px] md:rounded-[20px] bg-card p-2 bg-card-alt shadow-md">
            <Accordion type="single" collapsible className="mb-2 md:mb-6">
                <AccordionItem value="objectives" className="border-none">
                    <AccordionTrigger className="font-normal capitalize text-gray-900 dark:text-gray-100 hover:no-underline text-[20px] md:text-[24px] px-3 md:px-4">
                        Objectives
                    </AccordionTrigger>
                    <AccordionContent className="px-3 md:px-4">
                        <ul className="list-disc pl-4 md:pl-6 text-sm md:text-base space-y-1">
                            {selectedScenario?.objectives?.map((objective: string) => (
                                <li key={uuidv4()}>{objective}</li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
