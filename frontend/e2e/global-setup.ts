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
  // POST-only routes: a GET returns 405 but still compiles the route module,
  // which is all the warm-up needs. create-new-chat pulls in the heavy
  // llm.ts -> handlebars chain, whose first-hit compile otherwise blows the
  // chat-start navigation timeout under parallel load.
  '/api/chat/create-new-chat',
  '/api/chat/send-user-message',
  '/api/feedback/generate-feedback',
  '/api/users',
];

async function globalSetup(): Promise<void> {
  if (process.env.USE_MOCK_OPENAI !== 'true') {
    throw new Error(
      'E2E requires USE_MOCK_OPENAI=true in the root .env (see CLAUDE.md). ' +
        `Got ${JSON.stringify(process.env.USE_MOCK_OPENAI)}. Running against the ` +
        'real OpenAI API makes persona generation slow and nondeterministic, which ' +
        'produces confusing flaky failures. Set USE_MOCK_OPENAI=true and retry.'
    );
  }

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
