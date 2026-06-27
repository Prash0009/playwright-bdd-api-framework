import { createBdd } from 'playwright-bdd';
import { test } from './fixtures.js';

const { Before, After, BeforeAll, AfterAll } = createBdd(test);

/** Safely attach a payload to the Allure/Playwright report. */
async function attach(name, payload) {
  try {
    const info = test.info();
    await info.attach(name, {
      body: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2),
      contentType: 'application/json',
    });
  } catch {
    /* test.info() unavailable outside a running test — ignore */
  }
}

/**
 * Lifecycle hooks. playwright-bdd maps these onto Playwright's worker/test scope.
 */
BeforeAll(async () => {
  // Place for one-time setup: auth token generation, seeding, etc.
  // (reqres.in needs none beyond the API key handled in config.)
});

Before(async ({ log }) => {
  const title = test.info().title;
  log.info(`========== START: ${title} ==========`);
});

After(async ({ log, world }) => {
  const title = test.info().title;
  // Attach the last response to the Allure/Playwright report for debugging.
  if (world?.response) {
    const { status, responseTimeMs, body } = world.response;
    log.info(`Last response: ${status} (${responseTimeMs} ms)`);
    await attach('response.json', { status, responseTimeMs, body });
  }
  if (world?.context?.lastRequest) {
    await attach('request.json', world.context.lastRequest);
  }
  log.info(`========== END:   ${title} ==========`);
});

AfterAll(async () => {
  // Place for global teardown.
});
