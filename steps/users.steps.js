import { createBdd } from 'playwright-bdd';
import { test, expect } from '../hooks/fixtures.js';
import { DataManager } from '../utils/dataManager.js';
import { validateSchema } from '../utils/schemaValidator.js';

const { When, Then } = createBdd(test);

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */
function getByPath(obj, keyPath) {
  return keyPath.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

/* ------------------------------------------------------------------ *
 * WHEN — actions (GET / POST / PUT / DELETE)
 * ------------------------------------------------------------------ */
When('I request the user with id {int}', async ({ usersClient, world }, id) => {
  world.context.lastRequest = { method: 'GET', endpoint: `/users/${id}` };
  world.response = await usersClient.getUser(id);
});

When('I request the users list for page {int}', async ({ usersClient, world }, page) => {
  world.context.lastRequest = { method: 'GET', endpoint: `/users?page=${page}` };
  world.response = await usersClient.listUsers(page);
});

When('I create a user using the {string} payload', async ({ usersClient, world }, key) => {
  const payload = DataManager.get('users', `${key}.payload`);
  world.context.lastRequest = { method: 'POST', endpoint: '/users', body: payload };
  world.response = await usersClient.createUser(payload);
});

When(
  'I create a user with name {string} and job {string}',
  async ({ usersClient, world }, name, job) => {
    const payload = { name, job };
    world.context.lastRequest = { method: 'POST', endpoint: '/users', body: payload };
    world.response = await usersClient.createUser(payload);
  }
);

When(
  'I update the user with id {int} using the {string} payload',
  async ({ usersClient, world }, id, key) => {
    const payload = DataManager.get('users', `${key}.payload`);
    world.context.lastRequest = { method: 'PUT', endpoint: `/users/${id}`, body: payload };
    world.response = await usersClient.updateUser(id, payload);
  }
);

When('I delete the user with id {int}', async ({ usersClient, world }, id) => {
  world.context.lastRequest = { method: 'DELETE', endpoint: `/users/${id}` };
  world.response = await usersClient.deleteUser(id);
});

/* ------------------------------------------------------------------ *
 * THEN — assertions
 * ------------------------------------------------------------------ */
Then('the response status should be {int}', async ({ world }, expected) => {
  expect(world.response.status).toBe(expected);
});

Then('the response should match the {string} schema', async ({ world }, schemaName) => {
  expect(() => validateSchema(world.response.body, schemaName)).not.toThrow();
});

Then('the response time should be under {int} ms', async ({ world }, max) => {
  expect(world.response.responseTimeMs).toBeLessThan(max);
});

Then('the user {string} should be {string}', async ({ world }, path, expected) => {
  expect(String(getByPath(world.response.body, path))).toBe(expected);
});

Then('the response field {string} should be present', async ({ world }, field) => {
  expect(world.response.body).toHaveProperty(field);
  expect(world.response.body[field]).toBeTruthy();
});

Then('the user list should not be empty', async ({ world }) => {
  expect(Array.isArray(world.response.body)).toBe(true);
  expect(world.response.body.length).toBeGreaterThan(0);
});

Then('the user list should contain {int} users', async ({ world }, count) => {
  expect(Array.isArray(world.response.body)).toBe(true);
  expect(world.response.body.length).toBe(count);
});

Then('the created user should echo the name from the {string} payload', async ({ world }, key) => {
  const expected = DataManager.get('users', `${key}.payload`).name;
  expect(world.response.body.name).toBe(expected);
});

Then('the created user should echo the name {string}', async ({ world }, name) => {
  expect(world.response.body.name).toBe(name);
});

Then('the updated user should echo the job from the {string} payload', async ({ world }, key) => {
  const expected = DataManager.get('users', `${key}.payload`).job;
  expect(world.response.body.job).toBe(expected);
});

Then('the response body should be empty', async ({ world }) => {
  const body = world.response.body;
  expect(body === null || body === '' || (typeof body === 'object' && Object.keys(body).length === 0)).toBe(true);
});
