import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const baseUrl = process.env.E2E_TEST_BASE_URL;

test('Landing page loads and the call to action button starts the user journey for member recruitment', async ({ page }) => {
  test.fail(); // for debugging
  await page.goto(`${baseUrl}`);
  await expect(page.getByRole('button', { name: 'Start Scenario' })).toBeVisible();
  await page.getByRole('button', { name: 'Start Scenario' }).click();
  // Assert that the URL is the expected one
  await expect(page).toHaveURL(`${baseUrl}/scenario-setup?scenarioId=member-recruitment`);
});

test('Route back to landing page from scenario setup page', async ({ page }) => {
  await page.goto(`${baseUrl}/scenario-setup?scenarioId=member-recruitment`);
  await expect(page.getByRole('button', { name: 'Back to Scenarios' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to Scenarios' }).click();
  // Assert that the URL is the expected one
  await expect(page).toHaveURL(`${baseUrl}`);
});
