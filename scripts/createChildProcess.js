// @ts-check

import { spawn } from 'node:child_process';

// Collect all child processes and kill them when this node process exits.
const childProcesses = new Set();
process.on('exit', () => childProcesses.forEach((child) => child.kill()));

export function createChildProcess(command, args, options = {}) {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const childP = spawn(command, args, options);

  childProcesses.add(childP);

  childP.once('error', (err) => {
    reject(err);
  });

  childP.once('close', (code) => {
    childProcesses.delete(childP);
    if (code !== 0) {
      reject(new Error(`Command "${command} ${args.join(' ')}" exited with code ${code}`));
      return;
    }
    resolve();
  });

  return {
    childProcess: childP,
    promise,
  };
}
