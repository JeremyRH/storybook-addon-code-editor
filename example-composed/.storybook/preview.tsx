import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { registerLiveEditPreview } from 'storybook-addon-code-editor';
import * as ComposedLibrary from '../src/index';

// Register imports for live code editing.
// The preview frame handles all compilation - no setup needed in the host Storybook!
registerLiveEditPreview({
  imports: {
    'composed-library': ComposedLibrary,
    react: React,
  },
  // Optional: provide type definitions for editor intellisense
  // These will be sent to the host Storybook automatically
  typeDefinitions: {
    'composed-library': `
      export interface CardProps {
        title: string;
        children?: React.ReactNode;
        variant?: 'default' | 'outlined' | 'elevated';
      }
      
      export declare const Card: React.FC<CardProps>;
    `,
  },
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
