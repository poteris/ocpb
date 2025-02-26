import { test, expect, type Page, type Browser } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const baseUrl = process.env.E2E_TEST_BASE_URL;
const startChatText = "hi there";

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }: { browser: Browser }) => {
  page = await browser.newPage();
});

test('Landing page loads and the call to action button starts the user journey for member recruitment', async () => {
  await page.goto(`${baseUrl}`);
  await expect(page.getByRole('button', { name: 'Start Chat' })).toBeVisible();
  await page.getByRole('button', { name: 'Start Chat' }).click();
  await expect(page).toHaveURL(`${baseUrl}/scenario-setup?scenarioId=member-recruitment`);
});

test('Route back to landing page from scenario setup page', async () => {
  await page.goto(`${baseUrl}/scenario-setup?scenarioId=member-recruitment`);
  await page.waitForResponse(`${baseUrl}/api/persona/generate-new-persona`);
  const backArrow = page.getByTestId('backButton');
  await expect(backArrow).toBeVisible();
  await backArrow.click();
  await expect(page).toHaveURL(`${baseUrl}`);
});

test('Persona loads on scenario page', async () => {
  await page.goto(`${baseUrl}/scenario-setup?scenarioId=member-recruitment`);
  await expect(page.getByRole('heading', { name: 'Personal Background' })).toBeVisible({ timeout: 15000 });
});

test('Start chat button is visible and starts the chat', async () => {
  await expect(page.getByRole('button', { name: 'Start Chat' })).toBeVisible();
  await Promise.all([
    page.waitForURL(`${baseUrl}/initiate-chat**`),
    page.getByRole('button', { name: 'Start Chat' }).click()
  ]);
  await expect(page).toHaveURL(new RegExp(`^${baseUrl}/initiate-chat\\?scenarioId=member-recruitment&personaId=`));
});

test('Text box is visible: Entering text and pressing CTA starts chat ', async () => {
  await expect(page.getByRole('textbox', { name: 'Start training...' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('textbox', { name: 'Start training...' }).fill(startChatText);
  
  await Promise.all([
    page.waitForURL(`${baseUrl}/chat-screen**`),
    page.getByRole('button', { name: 'Start' }).click()
  ]);
  await expect(page.url()).toEqual(expect.stringContaining(`${baseUrl}/chat-screen`));
});

test('Chat page loads and messages can be exchanged', async () => {
  await expect(page.getByText(startChatText)).toBeVisible();
  const botMessage = page.locator('.text-left');
  await botMessage.first().waitFor();
  await expect(botMessage).toHaveCount(1);
  const chatTextbox = page.getByRole('textbox', { name: 'Type your message...' });
  await expect(chatTextbox).toBeVisible();
  await chatTextbox.fill("How are you?");
  await expect(page.getByTestId('sendMessageButton')).toBeVisible();
  await page.getByTestId('sendMessageButton').click();
  await page.waitForResponse(`${baseUrl}/api/chat/send-user-message`);
  const userMessages = page.locator('.text-right');
  await expect(userMessages).toHaveCount(2);
  await expect(botMessage).toHaveCount(2);
});

test('Chat can be ended and user is routed to feedback page', async () => {
  const endChatButton = page.getByRole('button', { name: 'End Chat' });
  await expect(endChatButton).toBeVisible();
  await endChatButton.click()
  
  // End Chat modal ... [Yes]
  await expect(page.getByRole('heading', { name: 'End Chat' })).toBeVisible();
  const yesButton = page.getByRole('button', { name: 'Yes' });
  await expect(yesButton).toBeVisible();
  await expect(page.getByRole('button', { name: 'No' })).toBeVisible();
  
  // Check routing to feedback page
  await Promise.all([
    page.waitForURL(`${baseUrl}/feedback**`),
    yesButton.click()
  ]);
  await expect(page.url()).toEqual(expect.stringContaining(`${baseUrl}/feedback`));
});

test('Feedback report is presented to user', async () => {
  await page.waitForResponse(`${baseUrl}/api/feedback/generate-feedback`);
  
  // Check high level report content
  await expect(page.getByRole('heading', { name: 'Feedback' })).toBeVisible();
  
  await expect(page.getByRole('heading', { name: 'Performance Score' })).toBeVisible();
  const feedbackStars = page.locator('.lucide-star');
  await expect(feedbackStars).toHaveCount(5);

  await expect(page.getByRole('heading', { name: 'Summary' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Strengths' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Areas for Improvement' })).toBeVisible();
});
