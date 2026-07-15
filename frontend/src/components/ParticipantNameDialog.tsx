"use client";

import React, { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getOrCreateParticipantId, getStoredParticipantName, storeParticipantName } from "@/lib/participant";

interface ParticipantNameDialogProps {
  isOpen: boolean;
  onSaved: (displayName: string) => void;
}

async function saveParticipant(userId: string, displayName: string): Promise<void> {
  await axios.post("/api/users", { userId, displayName });
}

export const ParticipantNameDialog: React.FC<ParticipantNameDialogProps> = ({ isOpen, onSaved }) => {
  const [name, setName] = useState(getStoredParticipantName() ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0 && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await saveParticipant(getOrCreateParticipantId(), trimmedName);
      storeParticipantName(trimmedName);
      onSaved(trimmedName);
    } catch (error) {
      console.error("Error saving participant name:", error);
      setErrorMessage("Could not save your name. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="[&>button]:hidden" onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Enter your name for the leaderboard</DialogTitle>
          <DialogDescription>
            This name is shown on the scenario leaderboard once you finish a conversation.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            autoFocus
            data-testid="participantNameInput"
          />
          {errorMessage && <p className="text-sm text-red-600 mt-2">{errorMessage}</p>}

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={!canSave} data-testid="participantNameSaveButton">
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantNameDialog;
