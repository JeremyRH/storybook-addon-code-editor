import { writeFileSync } from 'fs';
import { join } from 'path';

const cjsDir = join(process.cwd(), 'dist', 'cjs');

const packageJsonContent = {
  type: 'commonjs',
};

writeFileSync(join(cjsDir, 'package.json'), JSON.stringify(packageJsonContent, null, 2));
