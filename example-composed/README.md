# Example Composed Storybook

This is an example Storybook that demonstrates how to set up a Storybook for composition with the live code editor addon.

## Setup for Composition

### In this Storybook (the one being composed)

The key setup is in `.storybook/preview.ts`:

```ts
import { registerAvailableImports } from 'storybook-addon-code-editor';
import * as ComposedLibrary from '../src/index';

// Register imports for composition support
registerAvailableImports({
  'composed-library': ComposedLibrary,
});
```

This registers the imports that should be available when this Storybook is embedded in another Storybook.

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
