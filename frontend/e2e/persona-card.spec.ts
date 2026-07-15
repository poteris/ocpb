import { test, expect, type Page, type Browser } from '@playwright/test';
import dotenv from 'dotenv';
import { goToInitiateChat, startChatFromInitiate } from './helpers/journey';
import { seedParticipantIdentity } from './helpers/participant';

// Load environment variables from root level .env file
dotenv.config({ path: '../.env' });

const baseUrl = process.env.E2E_TEST_BASE_URL;
const startChatText = "Hello there";

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }: { browser: Browser }) => {
  page = await browser.newPage();
  await seedParticipantIdentity(page);

  if (process.env.USE_MOCK_OPENAI === 'true') {
    console.log('Executing persona card tests using Mock OpenAI API');
  }
});

test.describe('Persona Card Feature', () => {
  test('Setup - Navigate to chat page with persona', async () => {
    // Use the shared journey helpers: goToInitiateChat waits for the persona atom
    // to be populated before clicking through, which the previous inline navigation
    // did not — clicking start-chat before the atom is set no-ops handleStartChat.
    await goToInitiateChat(page, baseUrl!);
    await startChatFromInitiate(page, baseUrl!, startChatText);
  });

  test('Persona card appears on chat page', async () => {
    // Wait for the chat page to load and persona data to be fetched
    await page.waitForResponse(/\/api\/persona\/.*/, { timeout: 10000 });
    
    // Check that persona card is visible
    const personaCard = page.getByTestId('persona-card');
    await expect(personaCard).toBeVisible({ timeout: 5000 });
    
    // Verify it shows "Talking to [Name]" text
    await expect(page.getByText(/Talking to .+/)).toBeVisible();
  });

  test('Persona card accordion can be expanded and collapsed', async () => {
    // Find the accordion trigger
    const accordionTrigger = page.getByTestId('persona-card-trigger');
    
    // Expand the accordion
    await accordionTrigger.click();
    
    // Check that content is now visible
    const personaContent = page.getByTestId('persona-card-content');
    await expect(personaContent).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('Personality').first()).toBeVisible();
    await expect(page.getByText('Main workplace concerns').first()).toBeVisible();
    
    // Collapse the accordion
    await accordionTrigger.click();
    
    // Verify content is hidden
    await expect(personaContent).not.toBeVisible();
  });

  test('Persona card displays correct information', async () => {
    // Expand the accordion to see the content
    const accordionTrigger = page.getByTestId('persona-card-trigger');
    await accordionTrigger.click();
    
    // Wait for content to be visible
    const personaContent = page.getByTestId('persona-card-content');
    await expect(personaContent).toBeVisible({ timeout: 3000 });
    
    // Check that key persona information fields are present
    await expect(page.getByText('Personality')).toBeVisible();
    await expect(page.getByText('Main workplace concerns')).toBeVisible();
    
    // Verify that persona details contain meaningful content (not just placeholder text)
    const textContent = await personaContent.textContent();
    expect(textContent).toBeTruthy();
    expect(textContent!.length).toBeGreaterThan(50); // Ensure there's substantial content
  });

  test('Chat functionality works with persona card present', async () => {
    // Ensure we can still send messages with the persona card visible
    const chatTextbox = page.getByRole('textbox', { name: 'Type your message...' });
    await expect(chatTextbox).toBeVisible();
    
    await chatTextbox.fill("Test message with persona card");
    await page.getByTestId('sendMessageButton').click();
    
    // Wait for the message to be sent
    await page.waitForResponse(`${baseUrl}/api/chat/send-user-message`);
    
    // Verify the message appears in chat
    await expect(page.getByText("Test message with persona card")).toBeVisible();
    
    // Verify persona card is still visible after sending message
    await expect(page.getByText(/Talking to .+/)).toBeVisible();
  });
});
