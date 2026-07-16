import { test, expect, type Page, type BrowserContext, type Browser } from '@playwright/test';
import dotenv from 'dotenv';
import { goToInitiateChat, startChatFromInitiate, endChatToFeedback } from './helpers/journey';
import { uniqueName, seedParticipantIdentity } from './helpers/participant';

dotenv.config({ path: '../.env' });

const baseUrl = process.env.E2E_TEST_BASE_URL;
const SCENARIO_ID = 'member-recruitment';

// Regression for the leaderboard-invisibility bug. A returning browser can hold an
// id + name in localStorage while the server has NO matching users row (e.g. after a
// DB reset). Before the self-heal fix, /api/users was only ever called from the name
// dialog — which never reopens once a name is stored — so the participant completed a
// conversation but never surfaced on the leaderboard's inner join.
test.describe.configure({ mode: 'serial' });

let context: BrowserContext;
let page: Page;
const playerName = uniqueName('SelfHeal');
let playerId: string;

test.beforeAll(async ({ browser }: { browser: Browser }) => {
  context = await browser.newContext();
  page = await context.newPage();
  // Seed identity WITHOUT POSTing /api/users — exactly the divergent state the bug needs.
  playerId = await seedParticipantIdentity(page, playerName);
});

test.afterAll(async () => {
  await context.close();
});

test('A returning participant with no users row self-registers and appears on the leaderboard', async () => {
  test.setTimeout(120_000); // real-LLM latency: persona generation + first-message reply

  await goToInitiateChat(page, baseUrl!);
  // The name is already in localStorage, so the dialog must not appear.
  await expect(page.getByTestId('participantNameInput')).toHaveCount(0);

  await startChatFromInitiate(page, baseUrl!);
  await endChatToFeedback(page, baseUrl!);

  await expect(page.getByRole('heading', { name: 'Feedback' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('viewLeaderboardButton')).toBeVisible();
  await page.getByTestId('viewLeaderboardButton').click();

  await expect(page).toHaveURL(`${baseUrl}/leaderboard?scenarioId=${SCENARIO_ID}`);

  // The row only exists if the conversation's user_id gained a users row — i.e. the
  // self-heal registered the participant at chat start.
  const myRow = page.locator(`[data-testid="leaderboardRow"][data-user-id="${playerId}"]`);
  await expect(myRow).toBeVisible({ timeout: 10_000 });
  await expect(myRow.getByTestId('leaderboardName')).toContainText(playerName);
  await expect(myRow.getByTestId('leaderboardYouBadge')).toBeVisible();
});
