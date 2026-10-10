// Fails when a translation key used in src/ is missing from a file in public/i18n/, or a file has
// a key nothing uses. Run by `npm run lint`.
//
// Keys are found as string literals in these forms, so never build a key by concatenation:
//   'key' | transloco    translate('key')    selectTranslate('key')    marker('key')
// Specs and src/testing/ are skipped, so test-only keys don't count as used.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dirname, '..');
const i18nDir = join(root, 'public', 'i18n');

const PATTERNS = [
  /(['"])(\w[\w.-]*)\1\s*\|\s*transloco\b/g,
  /\b(?:translate|selectTranslate|translateSignal|marker)(?:<[^>]*>)?\(\s*(['"])(\w[\w.-]*)\1/g,
];

function* sourceFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (path !== join(root, 'src', 'testing')) yield* sourceFiles(path);
    } else if (/\.(ts|html)$/.test(entry.name) && !entry.name.endsWith('.spec.ts')) {
      yield path;
    }
  }
}

/** `{ a: { b: 'x' } }` → `['a.b']`. */
function flatten(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) =>
    child && typeof child === 'object' ? flatten(child, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

const used = new Map();
for (const file of sourceFiles(join(root, 'src'))) {
  const text = readFileSync(file, 'utf8');
  for (const pattern of PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      if (!used.has(match[2])) used.set(match[2], relative(root, file));
    }
  }
}

const errors = [];
const languageFiles = readdirSync(i18nDir).filter((name) => name.endsWith('.json'));
if (languageFiles.length === 0) errors.push(`no translation files in ${relative(root, i18nDir)}`);

for (const name of languageFiles) {
  const keys = new Set(flatten(JSON.parse(readFileSync(join(i18nDir, name), 'utf8'))));
  for (const [key, file] of used) {
    if (!keys.has(key)) errors.push(`${name}: missing "${key}" (used in ${file})`);
  }
  for (const key of keys) {
    if (!used.has(key)) errors.push(`${name}: unused "${key}"`);
  }
}

if (errors.length > 0) {
  console.error(`i18n key check failed:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`i18n keys OK: ${used.size} keys, ${languageFiles.length} language file(s).`);
