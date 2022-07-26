import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';

const monacoDir = path.dirname(require.resolve('monaco-editor/package.json'));

export function webpack(config: any = {}) {
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      new CopyPlugin({
        patterns: [
          {
            from: `${monacoDir}/min/vs/`,
            to: 'vs/',
          },
        ],
      }),
    ],
  };
}
