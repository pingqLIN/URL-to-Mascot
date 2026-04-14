import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.platform === 'linux') {
  process.env.TMPDIR = '/tmp';
  process.env.TMP = '/tmp';
  process.env.TEMP = '/tmp';
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const vitestEntry = path.resolve(scriptDir, '../node_modules/vitest/vitest.mjs');
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [vitestEntry, ...args], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
