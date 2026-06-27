import { test as base } from 'playwright-bdd';
import { UsersClient } from '../clients/users.client.js';
import { logger } from '../utils/logger.js';

/**
 * Custom Playwright-BDD fixtures.
 *
 * - `log`         : a Winston child logger tagged with the current scenario title.
 * - `usersClient` : ready-to-use UsersClient bound to Playwright's request context.
 * - `world`       : a per-scenario scratchpad to share state between steps
 *                   (e.g. the last response, a created user id).
 *
 * Steps import { test } from here and build Given/When/Then via createBdd(test).
 */
export const test = base.extend({
  log: async ({}, use, testInfo) => {
    const child = logger.child({ scenario: testInfo.title });
    await use(child);
  },

  usersClient: async ({ request, log }, use) => {
    await use(new UsersClient(request, log));
  },

  world: async ({}, use) => {
    await use({ response: null, context: {} });
  },
});

export { expect } from '@playwright/test';
