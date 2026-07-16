import { defineConfig, devices } from '@playwright/test';


// The leaderboard feature suite is excluded from the CI smoke pipeline (set
// SKIP_LEADERBOARD_TESTS=true there). These specs still run locally by default.
const LEADERBOARD_SPECS = [
  '**/leaderboard.spec.ts',
  '**/leaderboard-api.spec.ts',
  '**/participant-name.spec.ts',
];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  testIgnore: process.env.SKIP_LEADERBOARD_TESTS === 'true' ? LEADERBOARD_SPECS : [],
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  timeout: 20000,
  /* Cold dev-server compiles under parallel load can exceed the 5s default. */
  expect: { timeout: 10000 },
  /* Warm the dev server so no test pays the first-compile cost. */
  globalSetup: './e2e/global-setup.ts',
  reporter: [
    ['line'],
    ['html', {  outputFile: 'playwright-report/results.html' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },*/

    /* Test against mobile viewports. */
     {
       name: 'Mobile Chrome',
       use: { ...devices['Pixel 5'] },
     },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ]
});
