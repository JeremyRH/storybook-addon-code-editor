import path from 'path';
import fs from 'fs';
import CopyPlugin from 'copy-webpack-plugin';
import { DefinePlugin } from 'webpack';

function getPackageDir(packageName: string) {
  let packageDir = '';
  try {
    packageDir = path.dirname(require.resolve(`${packageName}/package.json`));
  } catch (err) {}
  return packageDir;
}

const monacoDir = getPackageDir('monaco-editor');
const reactTypesDir = getPackageDir('@types/react');

export function webpackFinal(config: any) {
  config.plugins = [
    ...config.plugins,
    // Copy Monaco's files to a "vs" directory so the Monaco loader can find them.
    new CopyPlugin({
      patterns: [{ from: `${monacoDir}/min/vs/`, to: 'vs/' }],
    }),
    reactTypesDir &&
      new DefinePlugin({
        // @types/react/index.d.ts can't be imported as a raw string so it's exposed using
        // DefinePlugin. Consumers have to reference REACT_TYPES in their code for it to exist in
        // their bundle.
        REACT_TYPES: JSON.stringify(
          fs.readFileSync(path.join(reactTypesDir, 'index.d.ts'), { encoding: 'utf-8' })
        ),
      }),
  ].filter(Boolean);

  config.module.rules = [
    {
      oneOf: [
        {
          resourceQuery: /raw$/,
          use: 'raw-loader',
        },
        // Nest default rules so "raw" resource query has priority.
        {
          rules: config.module.rules,
        },
      ],
    },
  ];

  return config;
}
