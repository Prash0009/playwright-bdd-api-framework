import dotenv from 'dotenv';

dotenv.config();

/**
 * Per-environment configuration.
 * Select the active environment via the TEST_ENV variable (dev | qa | prod).
 * Any value can be overridden by an environment variable (handy for CI / secrets).
 */
const environments = {
  dev: {
    baseURL: 'https://jsonplaceholder.typicode.com',
    apiPrefix: '',
  },
  qa: {
    baseURL: 'https://jsonplaceholder.typicode.com',
    apiPrefix: '',
  },
  prod: {
    baseURL: 'https://jsonplaceholder.typicode.com',
    apiPrefix: '',
  },
};

const activeEnv = (process.env.TEST_ENV || 'qa').toLowerCase();
const selected = environments[activeEnv] || environments.qa;

export const config = {
  env: activeEnv,
  baseURL: process.env.BASE_URL || selected.baseURL,
  apiPrefix: process.env.API_PREFIX ?? selected.apiPrefix,
  // Optional bearer token (JSONPlaceholder needs none; kept to show the pattern).
  apiKey: process.env.API_KEY || '',
  timeout: Number(process.env.API_TIMEOUT || 30000),
  logLevel: process.env.LOG_LEVEL || 'info',
};

/** Default headers applied to every request. */
export const defaultHeaders = {
  'Content-Type': 'application/json',
  ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
};

export default config;
