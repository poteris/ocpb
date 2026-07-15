import { v4 as uuidv4 } from "uuid";

const PARTICIPANT_ID_KEY = "convo-coach:participant-id";
const PARTICIPANT_NAME_KEY = "convo-coach:participant-name";

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
