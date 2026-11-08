import { defineMain } from '@storybook/react-vite/node';
import { fileURLToPath } from 'node:url';
import { getCodeEditorStaticDirs } from 'storybook-addon-code-editor/getStaticDirs';

const __filename = fileURLToPath(import.meta.url);

export default defineMain({
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  staticDirs: [
    // monaco-editor needs static files to be available at runtime.
    ...getCodeEditorStaticDirs(__filename),

    // Extra static files can be added like below.
    // getExtraStaticDir('monaco-editor/esm'),
  ],
  addons: ['@storybook/addon-docs', 'storybook-addon-code-editor'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
});
