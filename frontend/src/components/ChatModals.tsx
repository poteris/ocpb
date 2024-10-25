'use client';

import React from 'react';
import { Modal, InfoPopover, Button } from '@/components/ui';
import { FeedbackPopover } from './screens/FeedbackScreen';
import { ScenarioInfo } from '@/context/ScenarioContext';
import { Persona } from '@/utils/api';
import ReactMarkdown from 'react-markdown';
import { markdownStyles } from '@/utils/markdownStyles';

interface ChatModalsProps {
  showEndChatModal: boolean;
  setShowEndChatModal: (show: boolean) => void;
  confirmEndChat: () => void;
  showInfoPopover: boolean;
  setShowInfoPopover: (show: boolean) => void;
  showFeedbackPopover: boolean;
  setShowFeedbackPopover: (show: boolean) => void;
  handleFeedbackClose: () => void;
  scenarioInfo: ScenarioInfo | null;
  persona: Persona | null;
}

export const ChatModals: React.FC<ChatModalsProps> = ({
  showEndChatModal,
  setShowEndChatModal,
  confirmEndChat,
  showInfoPopover,
  setShowInfoPopover,
  showFeedbackPopover,
  setShowFeedbackPopover,
  scenarioInfo,
  persona
}) => {
  const renderPersonaDetails = (persona: Persona) => {
    return `
### Persona Details

- **Name:** ${persona.name}
- **Age:** ${persona.age}
- **Gender:** ${persona.gender}
- **Job:** ${persona.job}
- **Workplace:** ${persona.workplace}
- **Busyness Level:** ${persona.busyness_level}
- **Family Status:** ${persona.family_status}
- **Political Leanings:** ${persona.uk_party_affiliation}
- **Union Support:** ${persona.emotional_conditions_for_supporting_the_union}
- **Personality Traits:** ${persona.personality_traits}
- **Major Workplace Issues:** ${persona.major_issues_in_workplace}
    `.trim();
  };

  const formatObjectives = (objectives: string[]) => {
    return objectives.map(objective => `- ${objective}`).join('\n');
  };

  return (
    <>
      <Modal
        isOpen={showEndChatModal}
        onClose={() => setShowEndChatModal(false)}
        title="End Chat"
        footer={
          <div className="flex justify-end space-x-4">
            <Button variant="default" text="Cancel" onClick={() => setShowEndChatModal(false)} />
            <Button variant="destructive" text="End Chat" onClick={confirmEndChat} />
          </div>
        }
      >
        <p className="text-lg text-gray-700 dark:text-gray-300">Are you sure you want to end this chat?</p>
      </Modal>

      {showInfoPopover && scenarioInfo && (
        <InfoPopover onClose={() => setShowInfoPopover(false)}>
          <div className="max-w-2xl mx-auto">
            <ReactMarkdown components={markdownStyles}>
              {`
# ${scenarioInfo.title}

${scenarioInfo.description}

## Objectives:

${formatObjectives(scenarioInfo.objectives)}

${persona ? renderPersonaDetails(persona) : ''}
              `.trim()}
            </ReactMarkdown>
          </div>
        </InfoPopover>
      )}

      {showFeedbackPopover && (
        <FeedbackPopover
          onClose={() => setShowFeedbackPopover(false)}
          score={3}
        />
      )}
    </>
  );
};
