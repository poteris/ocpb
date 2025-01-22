import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { markdownStyles } from "@/utils/markdownStyles";
import { Persona } from "@/types/persona";
import { Loader, RefreshCw } from "react-feather";

interface PersonaDetailsProps {
  isGenerating: boolean;
  onGenerate: () => void;
  persona: Persona | null;
}

const PersonaDetails: React.FC<PersonaDetailsProps> = React.memo(({ persona, isGenerating, onGenerate }) => {
  // const [persona] = useAtom(selectedPersonaAtom);

  const renderPersonaSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-4/5 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );

  PersonaDetails.displayName = "PersonaDetails";

  const renderPersonaDetails = (persona: Persona) => {
    return `
### Personal Background
${persona.name} is a **${persona.age}-year-old ${persona.gender.toLowerCase()}** who works as a **${
      persona.job
    }** at **${persona.workplace}**. They're **${persona.family_status.toLowerCase()}** and are segmented as a **${
      persona.segment
    }**.

### Work & Political Context
* **Workplace Role:** ${persona.job}
* **Busyness Level:** ${persona.busyness_level}
* **Political Affiliation:** ${persona.uk_party_affiliation}

### Personality & Workplace Issues
${persona.name}'s personality can be characterised as **${persona.personality_traits.toLowerCase()}**. 

At work, they face several challenges:
${persona.major_issues_in_workplace}

### Union Perspective
Their emotional conditions for supporting the union are:
${persona.emotional_conditions}
      `.trim();
  };

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}>
      <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Chatbot Persona</h2>
      {isGenerating ? (
        renderPersonaSkeleton()
      ) : persona ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8">
          <h3 className="font-semibold text-2xl text-gray-900 dark:text-gray-100 mb-6 text-center">{persona.name}</h3>
          <div className="text-lg text-gray-700 dark:text-gray-300">
            <ReactMarkdown components={markdownStyles}>{renderPersonaDetails(persona)}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-8 text-center">
          <Loader className="animate-spin inline-block mb-4" size={32} />
          <p className="text-lg text-gray-700 dark:text-gray-300">Generating persona...</p>
        </div>
      )}
      <Button onClick={onGenerate} className="w-full text-lg py-3" disabled={isGenerating}>
        <RefreshCw className={`mr-2 ${isGenerating ? "animate-spin" : ""}`} size={24} />
        {isGenerating ? "Generating..." : "Generate New Persona"}
      </Button>
    </motion.section>
  );
});

export default PersonaDetails;
