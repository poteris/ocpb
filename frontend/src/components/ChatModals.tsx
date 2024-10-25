'use client';

import React from 'react';
import { Modal, InfoPopover, Button } from '@/components/ui';
import { FeedbackPopover } from './screens/FeedbackScreen';
import { ScenarioInfo } from '@/context/ScenarioContext';
import { Persona } from '@/utils/api';

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
        {persona && (
          <>
            <h3 className="text-pcsprimary-03 dark:text-pcsprimary-02 text-lg font-medium mb-2">Bot Persona:</h3>
            <ul className="text-pcsprimary-04 dark:text-gray-300 space-y-1">
              <li><strong>Name:</strong> {persona.name}</li>
              <li><strong>Age:</strong> {persona.age}</li>
              <li><strong>Gender:</strong> {persona.gender}</li>
              <li><strong>Job:</strong> {persona.job}</li>
              <li><strong>Workplace:</strong> {persona.workplace}</li>
              <li><strong>Busyness Level:</strong> {persona.busyness_level}</li>
              <li><strong>Family Status:</strong> {persona.family_status}</li>
              <li><strong>Political Leanings:</strong> {persona.uk_party_affiliation}</li>
              <li><strong>Union Support:</strong> {persona.emotional_conditions_for_supporting_the_union}</li>
              <li><strong>Personality Traits:</strong> {persona.personality_traits}</li>
              <li><strong>Major Workplace Issues:</strong> {persona.major_issues_in_workplace}</li>
            </ul>
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
