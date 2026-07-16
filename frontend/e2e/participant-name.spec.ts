import { test, expect, type Page, type Browser } from '@playwright/test';
import dotenv from 'dotenv';
import { goToInitiateChat, startChatFromInitiate } from './helpers/journey';
import { uniqueName, PARTICIPANT_ID_KEY, PARTICIPANT_NAME_KEY } from './helpers/participant';

dotenv.config({ path: '../.env' });

const baseUrl = process.env.E2E_TEST_BASE_URL;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

test.describe.configure({ mode: 'serial' });

let page: Page;
const participantName = uniqueName('Name');

// Fresh context with NO seeded identity — the name dialog is the subject here.
test.beforeAll(async ({ browser }: { browser: Browser }) => {
  page = await browser.newPage();
});

test.afterAll(async () => {
  await page.close();
});

test('Name dialog appears at initiate-chat and its save is disabled while empty', async () => {
  await goToInitiateChat(page, baseUrl!);
  await expect(page.getByTestId('participantNameInput')).toBeVisible();
  await expect(page.getByTestId('participantNameSaveButton')).toBeDisabled();
});

test('Name dialog cannot be dismissed and rejects whitespace-only names', async () => {
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('participantNameInput')).toBeVisible();

  await page.getByTestId('participantNameInput').fill('   ');
  await expect(page.getByTestId('participantNameSaveButton')).toBeDisabled();
});

test('Saving a valid name closes the dialog and persists identity', async () => {
  await page.getByTestId('participantNameInput').fill(participantName);
  await Promise.all([
    page.waitForResponse((response) => response.url().endsWith('/api/users') && response.status() === 200),
    page.getByTestId('participantNameSaveButton').click(),
  ]);

  await expect(page.getByTestId('participantNameInput')).toBeHidden();

  const stored = await page.evaluate(
    ({ idKey, nameKey }) => ({
      id: window.localStorage.getItem(idKey),
      name: window.localStorage.getItem(nameKey),
    }),
    { idKey: PARTICIPANT_ID_KEY, nameKey: PARTICIPANT_NAME_KEY }
  );
  expect(stored.name).toBe(participantName);
  expect(stored.id).toMatch(UUID_REGEX);
});

test('Chat starts after naming, and revisiting shows no dialog', async () => {
  await startChatFromInitiate(page, baseUrl!);
  await expect(page).toHaveURL(new RegExp(`^${baseUrl}/chat-screen`));

  // Re-run the journey in the same context: the persona lives in an in-memory
  // jotai atom, so a direct goto to /initiate-chat would redirect to /.
  await goToInitiateChat(page, baseUrl!);
  await expect(page.getByTestId('participantNameInput')).toBeHidden();
  await expect(page.getByTestId('startChatInput')).toBeEditable();
});
