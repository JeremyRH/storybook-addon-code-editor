# Example Composed Storybook

This is an example Storybook that demonstrates how to set up a Storybook for composition with the live code editor addon.

## Setup for Composition

### In this Storybook (the one being composed)

The key setup is in `.storybook/preview.ts`:

```ts
import { registerLiveEditPreview } from 'storybook-addon-code-editor';
import * as ComposedLibrary from '../src/index';

// Register imports for live code editing
// The preview frame handles all compilation - no setup needed in the host Storybook!
registerLiveEditPreview({
  imports: {
    'composed-library': ComposedLibrary,
  },
  // Optional: provide type definitions for editor intellisense
  typeDefinitions: {
    'composed-library': `
      export interface CardProps { title: string; children?: React.ReactNode; }
      export const Card: React.FC<CardProps>;
    `,
  },
});
```

This registers the imports that should be available when this Storybook is embedded in another Storybook. The host Storybook needs no additional configuration.

## Running

```sh
npm install
npm run storybook:dev
```

This will start the Storybook on port 6007.

## Testing Composition

To test composition, run this Storybook alongside the main example Storybook:

1. Start this Storybook: `npm run storybook:dev` (runs on port 6007)
2. Start the main example: `cd ../example && npm run storybook:dev` (runs on port 6006)

The main example Storybook is configured to compose this Storybook.
