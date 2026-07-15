import { test, expect, type Page, type BrowserContext, type Browser } from '@playwright/test';
import dotenv from 'dotenv';
import { goToInitiateChat, startChatFromInitiate, endChatToFeedback } from './helpers/journey';
import { uniqueName, seedParticipantIdentity, PARTICIPANT_ID_KEY } from './helpers/participant';

dotenv.config({ path: '../.env' });

const baseUrl = process.env.E2E_TEST_BASE_URL;
const SCENARIO_ID = 'member-recruitment';
const SCENARIO_TITLE = 'Joining the Union';

test.describe.configure({ mode: 'serial' });

// Two isolated contexts (separate localStorage): the viewer keeps the leaderboard
// open while the player completes a conversation in the other context.
let viewerContext: BrowserContext;
let playerContext: BrowserContext;
let viewerPage: Page;
let playerPage: Page;

const playerName = uniqueName('Player');
let playerId: string;

const leaderboardRowFor = (page: Page, userId: string) =>
  page.locator(`[data-testid="leaderboardRow"][data-user-id="${userId}"]`);

test.beforeAll(async ({ browser }: { browser: Browser }) => {
  viewerContext = await browser.newContext();
  viewerPage = await viewerContext.newPage();
  // Seed the viewer with a distinct identity so its id never matches the player's row.
  await seedParticipantIdentity(viewerPage, uniqueName('Viewer'));

  playerContext = await browser.newContext();
  playerPage = await playerContext.newPage();
});

test.afterAll(async () => {
  await viewerContext.close();
  await playerContext.close();
});

test('Navbar link routes to the leaderboard and shows the no-scenario state', async () => {
  await viewerPage.goto(`${baseUrl}`);
  await viewerPage.getByTestId('navbarLeaderboardLink').click();
  await expect(viewerPage).toHaveURL(`${baseUrl}/leaderboard`);
  await expect(viewerPage.getByTestId('leaderboardNoScenarioState')).toBeVisible();
});

test('Selecting a scenario loads its leaderboard', async () => {
  await viewerPage.getByTestId('leaderboardScenarioSelect').click();
  await Promise.all([
    viewerPage.waitForResponse(
      (response) => response.url().includes('/api/leaderboard') && response.url().includes(`scenarioId=${SCENARIO_ID}`)
    ),
    viewerPage.getByRole('option', { name: SCENARIO_TITLE }).click(),
  ]);

  await expect(viewerPage).toHaveURL(`${baseUrl}/leaderboard?scenarioId=${SCENARIO_ID}`);

  // Table or empty state — the shared CI DB may or may not already have rows.
  const hasTable = await viewerPage.getByTestId('leaderboardTable').isVisible();
  const hasEmpty = await viewerPage.getByTestId('leaderboardEmptyState').isVisible();
  expect(hasTable || hasEmpty).toBe(true);

  // The player has not played yet, so their name must not be present.
  await expect(viewerPage.getByTestId('leaderboardName').filter({ hasText: playerName })).toHaveCount(0);
  // Leave this page open — it is the live-update viewer for a later test.
});

test('Player names themselves and completes a conversation', async () => {
  test.setTimeout(60_000); // real-LLM latency in CI

  await goToInitiateChat(playerPage, baseUrl!);

  await expect(playerPage.getByTestId('participantNameInput')).toBeVisible();
  await playerPage.getByTestId('participantNameInput').fill(playerName);
  await Promise.all([
    playerPage.waitForResponse((response) => response.url().endsWith('/api/users') && response.status() === 200),
    playerPage.getByTestId('participantNameSaveButton').click(),
  ]);

  playerId = (await playerPage.evaluate((idKey) => window.localStorage.getItem(idKey), PARTICIPANT_ID_KEY)) as string;
  expect(playerId).toBeTruthy();

  await startChatFromInitiate(playerPage, baseUrl!);
});

test('Feedback screen offers a View Leaderboard button', async () => {
  test.setTimeout(60_000);

  await endChatToFeedback(playerPage, baseUrl!);
  // First render after feedback generation; give it headroom under parallel load.
  await expect(playerPage.getByRole('heading', { name: 'Feedback' })).toBeVisible({ timeout: 15000 });
  // The button is conditional on scenario_id coming back from generate-feedback.
  await expect(playerPage.getByTestId('viewLeaderboardButton')).toBeVisible();
});

test('Player sees their own scored row with a You badge', async () => {
  await playerPage.getByTestId('viewLeaderboardButton').click();
  await expect(playerPage).toHaveURL(`${baseUrl}/leaderboard?scenarioId=${SCENARIO_ID}`);

  const myRow = leaderboardRowFor(playerPage, playerId);
  await expect(myRow).toBeVisible({ timeout: 10_000 });
  await expect(myRow.getByTestId('leaderboardName')).toContainText(playerName);
  await expect(myRow.getByTestId('leaderboardYouBadge')).toBeVisible();
  await expect(myRow.getByTestId('leaderboardScore')).toHaveText(/^[1-5]\/5$/);
  const attempts = await myRow.getByTestId('leaderboardAttempts').textContent();
  expect(Number(attempts)).toBeGreaterThanOrEqual(1);
});

test('Viewer sees the player appear live, without reloading', async () => {
  // The viewer page has not navigated since it loaded the board (proves it is polling, not reloading).
  await expect(viewerPage).toHaveURL(`${baseUrl}/leaderboard?scenarioId=${SCENARIO_ID}`);

  const playerRow = leaderboardRowFor(viewerPage, playerId);
  await expect(playerRow).toBeVisible({ timeout: 12_000 }); // >= 2 poll cycles (5s each)
  await expect(playerRow.getByTestId('leaderboardName')).toContainText(playerName);
  // The viewer is a different participant, so no "You" badge on the player's row.
  await expect(playerRow.getByTestId('leaderboardYouBadge')).toHaveCount(0);
});

test('Unknown scenario shows the empty state', async () => {
  await viewerPage.goto(`${baseUrl}/leaderboard?scenarioId=e2e-nonexistent-${Date.now()}`);
  await expect(viewerPage.getByTestId('leaderboardEmptyState')).toBeVisible();
  await expect(viewerPage.getByTestId('leaderboardEmptyState')).toContainText('No scores yet');
});
