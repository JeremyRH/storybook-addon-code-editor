// @ts-check

import path from 'node:path';
import fs from 'node:fs';
import { createChildProcess } from './createChildProcess.js';
import pkgJson from '../package.json' with { type: 'json' };

const repoRoot = path.resolve(import.meta.dirname, '..');

function exec(command) {
  console.log(command);
  const [cmd, ...args] = command.split(' ');
  return createChildProcess(cmd, args, { stdio: 'inherit', cwd: repoRoot }).promise;
}

(async () => {
  // .js files that are commonjs need a package.json with type: "commonjs"
  await fs.promises.writeFile(
    path.join(repoRoot, 'dist', 'cjs', 'package.json'),
    '{ "type": "commonjs" }',
  ),

  // Create a .tgz file for the package to test it thoroughly in /example.
  // Set the version to 0.0.0 before packing, then set it back to the original version
  // to allow /example to always use the latest build of the package.
  await exec('npm pkg set version=0.0.0');
  await exec('npm pack');
})().finally(() => exec(`npm pkg set version=${pkgJson.version}`));
