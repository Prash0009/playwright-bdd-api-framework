import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { config } from './config/env.js';

/**
 * playwright-bdd compiles the .feature files (+ steps/hooks) into a generated
 * test directory that Playwright then executes natively. Tag filtering is done
 * at generation time with `bddgen --tags "@smoke"` (see npm scripts).
 */
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.js', 'hooks/**/*.js'],
  // honour TAGS env var if provided (used by the CI workflow_dispatch input)
  tags: process.env.TAGS || undefined,
});

export default defineConfig({
  testDir,
  // Fully parallel API tests.
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  // Re-run failed tests: 2 retries in CI, 1 locally. Allure/HTML mark flaky vs failed.
  retries: process.env.CI ? 2 : 1,
  timeout: config.timeout,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: true,
        environmentInfo: {
          Environment: config.env,
          BaseURL: config.baseURL,
          Node: process.version,
          OS: process.platform,
        },
      },
    ],
  ],
  use: {
    baseURL: config.baseURL,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
    trace: 'retain-on-failure',
  },
});
