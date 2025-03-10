import React from "react";
import { Persona } from "@/types/persona";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import PersonaDetailsSkeleton from "./PersonaDetailsSkeleton";

interface PersonaDetailsComponentProps {
  persona: Persona | null;
  onRegeneratePersona: () => Promise<void>;
  isRegenerating?: boolean;
}




const PersonaDetailsComponent: React.FC<PersonaDetailsComponentProps> = ({ 
  persona, 
  onRegeneratePersona,
  isRegenerating = false
}) => {
  if (!persona) {
    return <div>No persona data available</div>;
  }

  return (
    <div className="border-none rounded-[16px] md:rounded-[20px] bg-card p-2 bg-card-alt shadow-md">
      <Accordion type="single" collapsible defaultValue="persona" className="mb-2 md:mb-6">
        <AccordionItem value="persona" className="border-none">
          <AccordionTrigger className="font-normal text-gray-900 hover:no-underline text-[20px] md:text-[24px] px-3 md:px-4">
            Who you&apos;ll be talking to 
          </AccordionTrigger>
          <AccordionContent className="p-2 md:p-4">
            {isRegenerating ? (
              <PersonaDetailsSkeleton />
            ) : (
              <div className="bg-card-alt">
                <h3 className="font-semibold text-lg md:text-lg text-gray-900 mb-4 md:mb-6">
                  {persona.name}
                </h3>

                <div className="space-y-4 md:space-y-6 text-gray-700 text-sm md:text-base">
                  <section>
                    <h4 className="font-semibold text-base md:text-lg mb-2">Personal Background</h4>
                    <p className="leading-relaxed">
                      {persona.name} is a {persona.age}-year-old {persona.gender} who works as a {persona.job} at {persona.workplace}.
                      They&apos;re {persona.family_status} and are segmented as a {persona.segment}.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-base md:text-lg mb-2">Work & Political Context</h4>
                    <ul className="list-disc pl-4 md:pl-6 space-y-1">
                      <li>Workplace Role: {persona.job}</li>
                      <li>Busyness Level: {persona.busyness_level}</li>
                      <li>Political Affiliation: {persona.uk_party_affiliation}</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-semibold text-base md:text-lg mb-2">Personality & Workplace Issues</h4>
                    <p className="mb-2 normal-case leading-relaxed">
                      {persona.name}&apos;s personality can be characterised as {persona.personality_traits}.
                    </p>
                    <div>
                      <h5 className="font-medium mb-1">Major workplace issues:</h5>
                      <p className="leading-relaxed">{persona.major_issues_in_workplace}</p>
                    </div>
                  </section>

                  <section>
                    <h4 className="font-semibold text-base md:text-lg mb-2">Union Perspective</h4>
                    <p className="leading-relaxed">{persona.emotional_conditions}</p>
                  </section>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
        <div className="flex justify-end mr-4 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200"
            onClick={onRegeneratePersona}
            disabled={isRegenerating}
            data-testid="regeneratePersonaButton"
          >
            <span>Regenerate Persona</span>
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </Accordion>
    </div>
  );
};

export default PersonaDetailsComponent; 