// Runs on `npm install` (the `prepare` script). Points git at .husky/ when this
// app is the git root or sits one level below it, which is how `dotnet new`
// lays it out. Anywhere else (CI, Docker, a deeper monorepo) it does nothing.
import { execFileSync } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

if (process.env.CI || process.env.HUSKY === '0') process.exit(0);

let gitRoot;
try {
  gitRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: appDir })
    .toString()
    .trim();
} catch {
  process.exit(0); // no git, or not a repository
}

if (gitRoot !== appDir && gitRoot !== dirname(appDir)) {
  console.log(`Skipping git hooks: ${appDir} is not at or directly under the git root.`);
  process.exit(0);
}

const { default: husky } = await import('husky');
process.chdir(gitRoot);
const message = husky(relative(gitRoot, resolve(appDir, '.husky')) || '.husky');
if (message) console.log(message);
