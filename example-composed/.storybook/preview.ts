import type { Preview } from '@storybook/react-vite';
import { registerAvailableImports } from 'storybook-addon-code-editor';
import * as ComposedLibrary from '../src/index';

// Register imports for composition support.
// This allows the host Storybook to access these imports when this Storybook is composed.
registerAvailableImports({
  'composed-library': ComposedLibrary,
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
