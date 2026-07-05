/**
 * Verifies EN and KIN translation files have matching key sets.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const en = JSON.parse(readFileSync(join(__dirname, '../src/i18n/en.json'), 'utf8'));
const rw = JSON.parse(readFileSync(join(__dirname, '../src/i18n/rw.json'), 'utf8'));

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flatten(value, path);
    }
    return [path];
  });
}

const enKeys = new Set(flatten(en));
const rwKeys = new Set(flatten(rw));

const missingInRw = [...enKeys].filter((k) => !rwKeys.has(k));
const missingInEn = [...rwKeys].filter((k) => !enKeys.has(k));

if (missingInRw.length || missingInEn.length) {
  if (missingInRw.length) {
    console.error('Missing in rw.json:', missingInRw.join(', '));
  }
  if (missingInEn.length) {
    console.error('Missing in en.json:', missingInEn.join(', '));
  }
  process.exit(1);
}

console.log(`i18n parity OK (${enKeys.size} keys)`);
