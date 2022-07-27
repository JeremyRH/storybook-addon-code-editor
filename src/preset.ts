import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';

const monacoDir = path.dirname(require.resolve('monaco-editor/package.json'));

export function webpackFinal(config: any) {
  config.plugins.push(
    new CopyPlugin({
      patterns: [{ from: `${monacoDir}/min/vs/`, to: 'vs/' }],
    })
  );

  config.module.rules = [
    {
      oneOf: [
        {
          resourceQuery: /raw$/,
          use: 'raw-loader',
        },
        {
          rules: config.module.rules,
        },
      ],
    },
  ];

  return config;
}
