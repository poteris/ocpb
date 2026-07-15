import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

// The dev server compiles pages and API routes on first hit. Two browser
// projects running the serial suites in parallel can both land on an
// uncompiled route and blow the expect timeout, so compile everything once
// before any test starts.
const WARMUP_PATHS = [
  '/',
  '/leaderboard',
  '/scenario-setup?scenarioId=member-recruitment',
  '/initiate-chat',
  '/chat-screen',
  '/feedback',
  '/api/scenarios',
  '/api/persona/generate-new-persona',
  '/api/leaderboard?scenarioId=member-recruitment',
];

async function globalSetup(): Promise<void> {
  const baseUrl = process.env.E2E_TEST_BASE_URL;
  if (!baseUrl) {
    console.warn('global-setup: E2E_TEST_BASE_URL is not set, skipping warm-up');
    return;
  }

  for (const path of WARMUP_PATHS) {
    try {
      await fetch(`${baseUrl}${path}`);
    } catch (error) {
      console.warn(`global-setup: warm-up request to ${path} failed: ${String(error)}`);
    }
  }
}

export default globalSetup;
