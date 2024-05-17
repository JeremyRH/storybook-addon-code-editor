// @ts-check

import path from 'node:path';
import { createChildProcess } from './createChildProcess.js';
import pkgJson from '../package.json' with { type: 'json' };

const repoRoot = path.resolve(import.meta.dirname, '..');

function exec(command) {
  console.log(command);
  const [cmd, ...args] = command.split(' ');
  return createChildProcess(cmd, args, { stdio: 'inherit', cwd: repoRoot }).promise;
}

(async () => {
  await exec('npm pkg set version=0.0.0');
  await exec('npm pack');
})().finally(() => exec(`npm pkg set version=${pkgJson.version}`));
