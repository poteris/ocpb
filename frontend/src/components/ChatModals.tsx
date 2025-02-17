"use client";

import React from "react";
import { Modal, InfoPopover } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Persona } from "@/types/persona";
import { TrainingScenario } from "@/types/scenarios";

interface ChatModalsProps {
  showEndChatModal: boolean;
  setShowEndChatModal: (show: boolean) => void;
  showInfoPopover: boolean;
  setShowInfoPopover: (show: boolean) => void;
  conversationId: string | null;
  scenarioInfo: TrainingScenario | null;
  persona: Persona | null;
}


export const ChatModals: React.FC<ChatModalsProps> = ({
  showEndChatModal,
  setShowEndChatModal,
  showInfoPopover,
  setShowInfoPopover,
  conversationId,
  scenarioInfo,
}) => {


 

  const handleEndChat = async () => {
    if (!conversationId) {
      console.error("No conversation ID available");
      return;
    }

    setShowEndChatModal(false);


  };

  return (
    <>
      <Modal
        isOpen={showEndChatModal}
        onClose={() => setShowEndChatModal(false)}
        title="End Chat"
        footer={
          <div className="flex justify-end space-x-4">
            <Button onClick={() => setShowEndChatModal(false)}>Cancel</Button>
            <Button onClick={handleEndChat}>End Chat</Button>
          </div>
        }>
        <p className="text-lg text-gray-700 dark:text-gray-300">Are you sure you want to end this chat?</p>
      </Modal>

      {showInfoPopover && scenarioInfo && (
        <InfoPopover onClose={() => setShowInfoPopover(false)}>
          <div className="max-w-2xl mx-auto">

          </div>
        </InfoPopover>
      )}
    </>
  );
};
