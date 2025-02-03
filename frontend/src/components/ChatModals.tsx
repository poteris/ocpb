"use client";

import React, { useState } from "react";
import { Modal, InfoPopover, Button } from "@/components/ui";
import { FeedbackPopover } from "./screens/FeedbackScreen";
import { ScenarioInfo } from "@/context/ScenarioContext";
import ReactMarkdown from "react-markdown";
import { markdownStyles } from "@/utils/markdownStyles";
import { Skeleton } from "@/components/ui";
import axios from "axios";
import { FeedbackData } from "@/types/feedback";
import { Persona } from "@/types/persona";

interface ChatModalsProps {
  showEndChatModal: boolean;
  setShowEndChatModal: (show: boolean) => void;
  showInfoPopover: boolean;
  setShowInfoPopover: (show: boolean) => void;
  showFeedbackPopover: boolean;
  setShowFeedbackPopover: (show: boolean) => void;
  handleFeedbackClose: () => void;
  scenarioInfo: ScenarioInfo | null;
  persona: Persona | null;
  conversationId: string | null;
}

async function generateFeedbackOnConversation(conversationId: string) {
  const feedbackResponse = await axios.post<FeedbackData>("/api/feedback/generate-feedback", {
    conversationId,
  });
  return feedbackResponse.data;
}

export const ChatModals: React.FC<ChatModalsProps> = ({
  showEndChatModal,
  setShowEndChatModal,
  showInfoPopover,
  setShowInfoPopover,
  showFeedbackPopover,
  setShowFeedbackPopover,
  handleFeedbackClose,
  scenarioInfo,
  persona,
  conversationId,
}) => {
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const renderPersonaDetails = (persona: Persona) => {
    return `
### Persona Details

- **Name:** ${persona.name}
- **Segment:** ${persona.segment}
- **Age:** ${persona.age}
- **Gender:** ${persona.gender}
- **Job:** ${persona.job}
- **Workplace:** ${persona.workplace}
- **Busyness Level:** ${persona.busyness_level}
- **Family Status:** ${persona.family_status}
- **Political Leanings:** ${persona.uk_party_affiliation}
- **Union Support:** ${persona.emotional_conditions}
- **Personality Traits:** ${persona.personality_traits}
- **Major Workplace Issues:** ${persona.major_issues_in_workplace}
- **Emotional Conditions:** ${persona.emotional_conditions}
    `.trim();
  };

  const formatObjectives = (objectives: string[]) => {
    return objectives
      .map((objective) => {
        const [header, ...bullets] = objective.split("\n");
        return `> ${header}\n${bullets.join("\n")}`;
      })
      .join("\n\n");
  };

  const handleEndChat = async () => {
    if (!conversationId) {
      console.error("No conversation ID available");
      return;
    }

    setShowEndChatModal(false);
    setIsLoadingFeedback(true);
    setShowFeedbackPopover(true);

    try {
      // NOTE: generating feedback on conversation
      // const feedback = await getFeedback(conversationId);
      const feedback = await generateFeedbackOnConversation(conversationId);

      setFeedbackData(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const renderFeedbackSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/5" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={showEndChatModal}
        onClose={() => setShowEndChatModal(false)}
        title="End Chat"
        footer={
          <div className="flex justify-end space-x-4">
            <Button variant="default" text="Cancel" onClick={() => setShowEndChatModal(false)} />
            <Button variant="destructive" text="End Chat" onClick={handleEndChat} />
          </div>
        }
      >
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Are you sure you want to end this chat?
        </p>
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

${persona ? renderPersonaDetails(persona) : ""}
              `.trim()}
            </ReactMarkdown>
          </div>
        </InfoPopover>
      )}

      {showFeedbackPopover && (
        <FeedbackPopover
          onClose={handleFeedbackClose}
          score={feedbackData?.score || 0}
          analysisData={feedbackData || undefined}
        >
          {isLoadingFeedback ? renderFeedbackSkeleton() : null}
        </FeedbackPopover>
      )}
    </>
  );
};
