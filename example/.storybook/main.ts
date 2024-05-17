import type { StorybookConfig } from '@storybook/react-vite';
import {
  getCodeEditorStaticDirs,
  getExtraStaticDir,
} from 'storybook-addon-code-editor/getStaticDirs';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  staticDirs: [
    // monaco-editor needs static files to be available at runtime.
    ...getCodeEditorStaticDirs(__filename),

    // Extra static files can be added like below.
    // getExtraStaticDir('monaco-editor/esm'),
  ],
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: {
        actions: false,
      },
    },
    'storybook-addon-code-editor',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
