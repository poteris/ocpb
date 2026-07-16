import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const PARTICIPANT_ID_KEY = "convo-coach:participant-id";
const PARTICIPANT_NAME_KEY = "convo-coach:participant-name";

export class ParticipantNameTakenError extends Error {
  constructor() {
    super("That display name is already taken");
    this.name = "ParticipantNameTakenError";
  }
}

const isBrowser = (): boolean => typeof window !== "undefined";

export function getStoredParticipantId(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(PARTICIPANT_ID_KEY);
}

export function getOrCreateParticipantId(): string {
  const existingId = getStoredParticipantId();
  if (existingId) return existingId;

  const newId = uuidv4();
  if (isBrowser()) {
    window.localStorage.setItem(PARTICIPANT_ID_KEY, newId);
  }
  return newId;
}

export function getStoredParticipantName(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(PARTICIPANT_NAME_KEY);
}

export function storeParticipantName(name: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(PARTICIPANT_NAME_KEY, name.trim());
}

// Idempotently upserts the participant's users row. Safe to call on every chat
// start: a returning browser can hold an id+name in localStorage while the server
// has no matching row (e.g. after a DB reset), which silently hides the user from
// the leaderboard's inner join. Re-registering heals that. A 409 means another
// participant already owns the name.
export async function registerParticipant(userId: string, displayName: string): Promise<void> {
  try {
    await axios.post("/api/users", { userId, displayName });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      throw new ParticipantNameTakenError();
    }
    throw error;
  }
}
