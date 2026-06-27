import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = path.resolve(__dirname, '..', 'schemas');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Validate a response body against a JSON schema stored in /schemas.
 * Throws a readable error listing every violation when invalid.
 *
 * @param {object} body        - the parsed response body
 * @param {string} schemaName  - schema file name without extension
 * @returns {true}             - when valid
 */
export function validateSchema(body, schemaName) {
  const file = path.join(SCHEMA_DIR, `${schemaName}.schema.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Schema file not found: ${file}`);
  }
  const schema = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const validate = ajv.compile(schema);
  const valid = validate(body);

  if (!valid) {
    const details = (validate.errors || [])
      .map((e) => `  - ${e.instancePath || '(root)'} ${e.message}`)
      .join('\n');
    throw new Error(`Schema validation failed for "${schemaName}":\n${details}`);
  }
  return true;
}

export default validateSchema;
