import { expect, type Page } from '@playwright/test';

// Drives the landing page through persona generation to the initiate-chat screen.
// Mirrors the setup flow in smoke-tests.spec.ts / persona-card.spec.ts.
export async function goToInitiateChat(page: Page, baseUrl: string): Promise<void> {
  await page.goto(`${baseUrl}`);
  await page.waitForResponse(`${baseUrl}/api/scenarios`);

  const startScenarioButton = page.getByTestId('startScenarioButton-0');
  await expect(startScenarioButton).toBeVisible();
  await startScenarioButton.click();

  await page.waitForResponse(`${baseUrl}/api/persona/generate-new-persona`);
  const startChatButton = page.getByTestId('startChatButton');
  await expect(startChatButton).toBeVisible();
  await Promise.all([
    page.waitForURL(`${baseUrl}/initiate-chat**`),
    startChatButton.click(),
  ]);
}

// Sends the first message from the initiate-chat screen and lands on the chat screen.
export async function startChatFromInitiate(page: Page, baseUrl: string, message = 'hi there'): Promise<void> {
  const startChatInput = page.getByTestId('startChatInput');
  await expect(startChatInput).toBeVisible({ timeout: 10000 });
  await startChatInput.fill(message);
  await Promise.all([
    page.waitForURL(`${baseUrl}/chat-screen**`),
    page.getByTestId('initiateSendButton').click(),
  ]);
}

// Ends the chat via the confirmation modal and lands on the feedback screen.
export async function endChatToFeedback(page: Page, baseUrl: string): Promise<void> {
  const endChatButton = page.getByTestId('endChatButton');
  await expect(endChatButton).toBeVisible();
  await endChatButton.click();

  await expect(page.getByRole('heading', { name: 'End Chat' })).toBeVisible();
  const yesButton = page.getByRole('button', { name: 'Yes' });
  await expect(yesButton).toBeVisible();

  await Promise.all([
    page.waitForURL(`${baseUrl}/feedback**`),
    page.waitForResponse(`${baseUrl}/api/feedback/generate-feedback`),
    yesButton.click(),
  ]);
}
