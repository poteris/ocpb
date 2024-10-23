'use client';

import React from 'react';
import { Modal, InfoPopover, Button } from '@/components/ui';
import { FeedbackPopover } from './screens/FeedbackScreen';
import { ScenarioInfo, PersonaInfo } from '@/context/ScenarioContext';

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
  personaInfo: PersonaInfo | null;
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
  personaInfo
}) => (
  <>
    <Modal
      isOpen={showEndChatModal}
      onClose={() => setShowEndChatModal(false)}
      title="End Chat"
      footer={
        <div className="flex justify-end space-x-2">
          <Button variant="default" text="Cancel" onClick={() => setShowEndChatModal(false)} />
          <Button variant="destructive" text="End Chat" onClick={confirmEndChat} />
        </div>
      }
    >
      <p className="text-gray-700 dark:text-gray-500">Are you sure you want to end this chat?</p>
    </Modal>

    {showInfoPopover && scenarioInfo && (
      <InfoPopover onClose={() => setShowInfoPopover(false)}>
        <h2 className="text-pcsprimary-03 dark:text-pcsprimary-02 text-xl font-medium mb-4">{scenarioInfo.title}</h2>
        <p className="text-pcsprimary-04 dark:text-gray-300 mb-4">{scenarioInfo.description}</p>
        <h3 className="text-pcsprimary-03 dark:text-pcsprimary-02 text-lg font-medium mb-2">Objectives:</h3>
        <ul className="list-disc list-inside text-pcsprimary-04 dark:text-gray-300 mb-4">
          {scenarioInfo.objectives.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
        {personaInfo && (
          <>
            <h3 className="text-pcsprimary-03 dark:text-pcsprimary-02 text-lg font-medium mb-2">Bot Persona:</h3>
            <p className="text-pcsprimary-04 dark:text-gray-300"><strong>Character Type:</strong> {personaInfo.characterType}</p>
            <p className="text-pcsprimary-04 dark:text-gray-300"><strong>Mood:</strong> {personaInfo.mood}</p>
            <p className="text-pcsprimary-04 dark:text-gray-300"><strong>Age Range:</strong> {personaInfo.ageRange}</p>
            <p className="text-pcsprimary-04 dark:text-gray-300"><strong>Context:</strong> {personaInfo.context}</p>
          </>
        )}
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
