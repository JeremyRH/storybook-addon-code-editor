# storybook-addon-code-editor

A Storybook add-on for live editing stories. Supports React and TypeScript.

[See it in action.](https://jeremyrh.github.io/storybook-addon-code-editor)

[See an example project using this add-on.](./example)

## What is it?

This is a [Storybook addon](https://storybook.js.org/addons) that enables live editing of React components with real-time previews.
Think of it like a lightweight [CodeSandbox](https://codesandbox.io), directly in stories or MDX pages.

It uses [Monaco Editor](https://github.com/microsoft/monaco-editor) (VS Code for the browser) for an excellent TypeScript editing experience.

## Get started

1. Install as a dev dependency:

```sh
npm install --save-dev storybook-addon-code-editor
# Or yarn:
yarn add --dev storybook-addon-code-editor
```

2. Add `storybook-addon-code-editor` in your `.storybook/main.ts` file and ensure the `staticDirs`, `addons`, and `framework` fields contain the following:

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';
import { getCodeEditorStaticDirs } from 'storybook-addon-code-editor/getStaticDirs';

const config: StorybookConfig = {
  staticDirs: [...getCodeEditorStaticDirs(__filename)],
  addons: ['storybook-addon-code-editor'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
```

<details>
<summary>About `staticDirs`</summary>

`staticDirs` sets a list of directories of static files to be loaded by Storybook.
The editor ([monaco-editor](https://github.com/microsoft/monaco-editor)) requires these extra static files to be available at runtime.

Additional static files can be added using the `getExtraStaticDir` helper from `storybook-addon-code-editor/getStaticDirs`:

```ts
// .storybook/main.ts
import {
  getCodeEditorStaticDirs,
  getExtraStaticDir,
} from 'storybook-addon-code-editor/getStaticDirs';

const config: StorybookConfig =  {
  staticDirs: [
    ...getCodeEditorStaticDirs(__filename),
    // files will be available at: /monaco-editor/esm/*
    getExtraStaticDir('monaco-editor/esm'),
```

</details>

<br />

**Important:**

`@storybook/react-vite` is the only supported framework at this time.

<br />

## API

### `Playground`

Use the `Playground` component in [MDX format](https://storybook.js.org/docs/writing-docs/mdx).

```mdx
// MyComponent.stories.mdx
import { Playground } from 'storybook-addon-code-editor'

<Playground code="export default () => <h1>Hello</h1>" />
```

<details>
<summary>More advanced example</summary>

```mdx
// MyComponent.stories.mdx
import { Playground } from 'storybook-addon-code-editor';
import \* as MyLibrary from './index';
import storyCode from './MyStory.source.tsx?raw';

// TypeScript might complain about not finding this import or
// importing things from .d.ts files wihtout `import type`.
// Ignore this, we need the string contents of this file.
// @ts-ignore
import MyLibraryTypes from '../dist/types.d.ts?raw';

<Playground
  availableImports={{ 'my-library': MyLibrary }}
  code={storyCode}
  height="560px"
  id="unique id used to save edited code until the page is reloaded"
  modifyEditor={(monaco, editor) => {
    // editor docs: https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneCodeEditor.html
    // monaco docs: https://microsoft.github.io/monaco-editor/api/modules/monaco.html
    editor.getModel().updateOptions({ tabSize: 2 });
    monaco.editor.setTheme('vs-dark');
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      MyLibraryTypes,
      'file:///node_modules/my-library/index.d.ts',
    );
  }}
/>
```

</details>

<br />

`Playground` props:

```ts
interface PlaygroundProps {
  availableImports?: {
    [importSpecifier: string]: {
      [namedImport: string]: any;
    };
  };
  code?: string;
  defaultEditorOptions?: Monaco.editor.IEditorOptions;
  height?: string;
  id?: string | number | symbol;
  modifyEditor?: (monaco: Monaco, editor: Monaco.editor.IStandaloneCodeEditor) => any;
}
```

`React` is automatically imported if `code` does not import it.
React TypeScript definitions will be automatically loaded if `@types/react` is available.

### `makeLiveEditStory`

Use the `makeLiveEditStory` function in traditional stories to show a code editor panel:

```ts
// MyComponent.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { makeLiveEditStory } from 'storybook-addon-code-editor';
import * as MyLibrary from './index';
import storyCode from './MyStory.source.tsx?raw';

const meta = {
  // Story defaults
} satisfies Meta<typeof MyLibrary.MyComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MyStory: Story = {
  // Story config
};

makeLiveEditStory(MyStory, {
  availableImports: { 'my-library': MyLibrary },
  code: storyCode,
});
```

`makeLiveEditStory` options:

```ts
interface LiveEditStoryOptions {
  availableImports?: {
    [importSpecifier: string]: {
      [namedImport: string]: any;
    };
  };
  code: string;
  modifyEditor?: (monaco: Monaco, editor: Monaco.editor.IStandaloneCodeEditor) => any;
  defaultEditorOptions?: Monaco.editor.IEditorOptions;
}
```

### `setupMonaco`

`setupMonaco` allows customization of [`monaco-editor`](https://github.com/microsoft/monaco-editor).

Use this in your `.storybook/preview.ts` to add type definitions or integrations.

Check out [examples of `monaco-editor`](https://github.com/microsoft/monaco-editor/tree/ae158a25246af016a0c56e2b47df83bd4b1c2426/samples) with different configurations.

```ts
// .storybook/preview.ts
import { setupMonaco } from 'storybook-addon-code-editor';

setupMonaco({
  // https://microsoft.github.io/monaco-editor/typedoc/interfaces/Environment.html
  monacoEnvironment: {
    getWorker(moduleId, label) {
      ...
    },
  },
  // onMonacoLoad is called when monaco is first loaded, before an editor instance is created.
  onMonacoLoad(monaco) {
    ...
  },
});
```

`setupMonaco` options:

```ts
interface MonacoSetup {
  monacoEnvironment?: Monaco.Environment;
  onMonacoLoad?: (monaco: Monaco) => any;
}
```

<br />

## Storybook Composition

This addon supports [Storybook Composition](https://storybook.js.org/docs/sharing/storybook-composition), allowing live code editing to work when embedding remote Storybooks.

### How it works

When using composition, the code editor panel in the host Storybook communicates with the preview iframe (from the composed Storybook) via Storybook's channel API. This enables real-time preview updates even across different Storybook instances.

### Setup

#### 1. In the Composed Storybook (the one being embedded)

Register the imports that should be available for live editing:

```ts
// .storybook/preview.ts
import { registerAvailableImports } from 'storybook-addon-code-editor';
import * as MyLibrary from 'my-library';

// Register imports so they're available when this Storybook is composed
registerAvailableImports({
  'my-library': MyLibrary,
});
```

#### 2. In the Host Storybook (the one doing the composing)

First, add the composition reference in your main config:

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';
import { getCodeEditorStaticDirs } from 'storybook-addon-code-editor/getStaticDirs';

const config: StorybookConfig = {
  staticDirs: [...getCodeEditorStaticDirs(__filename)],
  addons: ['storybook-addon-code-editor'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  refs: {
    'my-composed-storybook': {
      title: 'My Composed Storybook',
      url: 'https://my-composed-storybook.example.com',
    },
  },
};

export default config;
```

Then, register the same imports in the manager so the editor panel can provide them:

```ts
// .storybook/manager.ts
import { setupCompositionImports } from 'storybook-addon-code-editor/manager';
import * as MyLibrary from 'my-library';

// Register imports for composed stories
setupCompositionImports({
  'my-library': MyLibrary,
});
```

### API

#### `registerAvailableImports`

Register imports in the **preview** (composed Storybook) that will be available for live code editing.

```ts
import { registerAvailableImports } from 'storybook-addon-code-editor';

registerAvailableImports({
  'my-library': MyLibrary,
  'lodash': lodash,
});
```

#### `setupCompositionImports`

Register imports in the **manager** (host Storybook) for the editor panel to use when viewing composed stories.

```ts
import { setupCompositionImports } from 'storybook-addon-code-editor/manager';

setupCompositionImports({
  'my-library': MyLibrary,
  'lodash': lodash,
});
```

### Notes

- Both the composed and host Storybooks must have the same imports registered for full functionality.
- The `code` is automatically included in story parameters, so it's available in composition without additional setup.
- Preview updates work in real-time when both Storybooks are properly configured.

<br />

## Contributing

### Install dependencies

```sh
npm install
```

### Run example

```sh
npm run start-example
```

When making changes to the library, the server needs to be manually restarted.

### Run tests

```sh
npm run test
```

### Format code

```sh
npm run format
```

### Build library

```sh
npm run build
```

### Commits

Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) to allow automatic versioned releases.

- `fix:` represents bug fixes, and correlates to a SemVer patch.
- `feat:` represents a new feature, and correlates to a SemVer minor.
- `feat!:`, or `fix!:`, `refactor!:`, etc., represent a breaking change (indicated by the !) and will result in a SemVer major.

### Publishing

The automated [release-please](https://github.com/googleapis/release-please) PR to the main branch can be merged to deploy a release.
