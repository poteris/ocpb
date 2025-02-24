import React from "react";
import { Persona } from "@/types/persona";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface PersonaDetailsComponentProps {
  persona: Persona | null;
}

const PersonaDetailsComponent: React.FC<PersonaDetailsComponentProps> = ({ persona }) => {
  if (!persona) {
    return <div>No persona data available</div>;
  }

  return (
    <div className="border-none rounded-[16px] md:rounded-[20px] bg-card p-2 bg-card-alt shadow-md">
      <Accordion type="single" collapsible defaultValue="persona" className="mb-2 md:mb-6">
        <AccordionItem value="persona" className="border-none">
          <AccordionTrigger className="font-normal capitalize text-gray-900 dark:text-gray-100 hover:no-underline text-[20px] md:text-[24px] px-3 md:px-4">
            Who you&apos;ll be talking to
          </AccordionTrigger>
          <AccordionContent className="p-4 md:p-8">
            <div className="bg-card-alt dark:bg-gray-800 px-4 md:px-6">
              <h3 className="font-semibold text-xl md:text-2xl text-gray-900 dark:text-gray-100 mb-4 md:mb-6">
                {persona.name}
              </h3>

              <div className="space-y-4 md:space-y-6 text-gray-700 dark:text-gray-300 text-sm md:text-base">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default PersonaDetailsComponent; 