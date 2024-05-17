// @ts-check

import fs from 'node:fs';
import path from 'node:path';

const dirToDelete = path.resolve(process.argv[2]);

fs.promises.rm(dirToDelete, { recursive: true, force: true });
