import { defaultHeaders, config } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * BaseClient — thin wrapper around Playwright's APIRequestContext.
 *
 * Responsibilities:
 *  - apply shared headers (incl. auth) and the /api prefix
 *  - log every request & response
 *  - return a normalised result: { status, ok, headers, body, responseTimeMs, raw }
 *
 * Endpoint-specific clients (e.g. UsersClient) extend this.
 */
export class BaseClient {
  /** @param {import('@playwright/test').APIRequestContext} request */
  constructor(request, log = logger) {
    this.request = request;
    this.logger = log;
  }

  _url(endpoint) {
    if (/^https?:\/\//i.test(endpoint)) return endpoint;
    const prefix = config.apiPrefix.replace(/\/$/, '');
    const suffix = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${prefix}${suffix}`;
  }

  async _send(method, endpoint, { data, params, headers } = {}) {
    const url = this._url(endpoint);
    const options = {
      headers: { ...defaultHeaders, ...headers },
      timeout: config.timeout,
    };
    if (params) options.params = params;
    if (data !== undefined) options.data = data;

    this.logger.info(`--> ${method.toUpperCase()} ${url}`);
    if (data !== undefined) this.logger.debug(`Request body: ${JSON.stringify(data)}`);

    const start = Date.now();
    const response = await this.request[method](url, options);
    const responseTimeMs = Date.now() - start;

    const status = response.status();
    const ok = response.ok();
    let body = null;
    const text = await response.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text; // non-JSON payload (e.g. empty / plain text)
      }
    }

    this.logger.info(`<-- ${status} ${method.toUpperCase()} ${url} (${responseTimeMs} ms)`);
    this.logger.debug(`Response body: ${typeof body === 'string' ? body : JSON.stringify(body)}`);

    return {
      status,
      ok,
      headers: response.headers(),
      body,
      responseTimeMs,
      raw: response,
    };
  }

  get(endpoint, opts) {
    return this._send('get', endpoint, opts);
  }

  post(endpoint, opts) {
    return this._send('post', endpoint, opts);
  }

  put(endpoint, opts) {
    return this._send('put', endpoint, opts);
  }

  patch(endpoint, opts) {
    return this._send('patch', endpoint, opts);
  }

  delete(endpoint, opts) {
    return this._send('delete', endpoint, opts);
  }
}

export default BaseClient;
