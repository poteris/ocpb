import { randomUUID } from 'crypto';
import { type Page } from '@playwright/test';

// Keys duplicated from src/lib/participant.ts — specs run under a different
// tsconfig/module context and do not import app source.
const PARTICIPANT_ID_KEY = 'convo-coach:participant-id';
const PARTICIPANT_NAME_KEY = 'convo-coach:participant-name';

// Unique per run so tests never collide on a shared/dirty DB. The `E2E ` prefix
// makes rows identifiable for later cleanup. Kept <= 40 chars (the /api/users max).
export function uniqueName(label: string): string {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
  return `E2E ${label} ${suffix}`.slice(0, 40);
}

// Pre-seeds a participant identity into localStorage before any page load, so
// the name dialog does not appear. Does NOT POST /api/users: conversations.user_id
// has no FK, and an unregistered id simply never surfaces on the leaderboard view.
//
// The default name MUST be unique per call: chat start now registers the participant
// (self-heal), and display names are unique per organisation. A fixed name would 409
// on the second id to claim it — across runs, across browser projects, and across
// specs — which reopens the name dialog and blocks the chat from ever starting.
export async function seedParticipantIdentity(page: Page, name = uniqueName('Seeded')): Promise<string> {
  const id = randomUUID();
  await page.addInitScript(
    ({ idKey, nameKey, participantId, participantName }) => {
      window.localStorage.setItem(idKey, participantId);
      window.localStorage.setItem(nameKey, participantName);
    },
    { idKey: PARTICIPANT_ID_KEY, nameKey: PARTICIPANT_NAME_KEY, participantId: id, participantName: name }
  );
  return id;
}

export { PARTICIPANT_ID_KEY, PARTICIPANT_NAME_KEY };
