import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');

/**
 * DataManager — externalised test-data loader.
 *
 * Supports BOTH:
 *  - structured JSON objects   -> load('users')           => { ... }
 *  - plain strings / arrays    -> load('endpoints').list  => "/api/users"
 *
 * It also supports environment-scoped data: if the active TEST_ENV has a matching
 * key inside the file (e.g. { "qa": {...}, "prod": {...} }) that branch is returned,
 * otherwise the whole file is returned.
 */
export class DataManager {
  static cache = new Map();

  /** Read & parse a JSON fixture by name (without extension). */
  static load(name) {
    if (DataManager.cache.has(name)) return DataManager.cache.get(name);

    const file = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(file)) {
      throw new Error(`Test data file not found: ${file}`);
    }
    const raw = fs.readFileSync(file, 'utf-8');
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new Error(`Invalid JSON in data file "${name}": ${err.message}`);
    }

    const env = (process.env.TEST_ENV || 'qa').toLowerCase();
    const resolved =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed[env]
        ? parsed[env]
        : parsed;

    DataManager.cache.set(name, resolved);
    return resolved;
  }

  /**
   * Fetch a nested value via dot-path, e.g. get('users', 'create.payload').
   * Returns the whole file when `keyPath` is omitted.
   * Works for objects, arrays and primitive (string) leaves.
   */
  static get(name, keyPath) {
    const data = DataManager.load(name);
    if (!keyPath) return data;
    return keyPath.split('.').reduce((acc, key) => {
      if (acc === undefined || acc === null) {
        throw new Error(`Key path "${keyPath}" not found in data file "${name}"`);
      }
      return acc[key];
    }, data);
  }

  /** Clear cache (used between isolated runs/tests if ever needed). */
  static reset() {
    DataManager.cache.clear();
  }
}

export default DataManager;
