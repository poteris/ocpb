import React from "react";
import { Persona } from "@/types/persona";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { User } from "lucide-react";

interface ChatPersonaCardProps {
  persona: Persona | null;
  isLoading?: boolean;
}

const ChatPersonaCard: React.FC<ChatPersonaCardProps> = ({ 
  persona,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="mb-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm">
        <div className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
            <div className="w-32 h-4 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!persona) {
    return null;
  }

  return (
    <div className="mb-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md" data-testid="persona-card">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="persona" className="border-none">
          <AccordionTrigger className="px-3 py-2 hover:no-underline text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors" data-testid="persona-card-trigger">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span>Talking to {persona.name}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3" data-testid="persona-card-content">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-gray-800 mb-2">
                  <span className="font-medium">{persona.name}</span> is a {persona.age}-year-old {persona.gender} 
                  working as a {persona.job} at {persona.workplace}.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium text-gray-700">Status:</span> {persona.family_status}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Busyness:</span> {persona.busyness_level}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="font-medium text-gray-700 mb-1">Personality</div>
                <p className="text-xs leading-relaxed">{persona.personality_traits}</p>
              </div>
              
              <div>
                <div className="font-medium text-gray-700 mb-1">Main workplace concerns</div>
                <p className="text-xs leading-relaxed">{persona.major_issues_in_workplace}</p>
              </div>
              
              {persona.emotional_conditions && (
                <div>
                  <div className="font-medium text-gray-700 mb-1">Union perspective</div>
                  <p className="text-xs leading-relaxed">{persona.emotional_conditions}</p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ChatPersonaCard;
