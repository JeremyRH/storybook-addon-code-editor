import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';
import { getCodeEditorStaticDirs } from 'storybook-addon-code-editor/getStaticDirs';

const __filename = fileURLToPath(import.meta.url);

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  staticDirs: [...getCodeEditorStaticDirs(__filename)],
  addons: ['@storybook/addon-docs', 'storybook-addon-code-editor'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
