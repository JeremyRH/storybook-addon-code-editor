# storybook-addon-code-editor

A Storybook add-on for live editing stories. Supports React and TypeScript.

[Demo](https://jeremyrh.github.io/storybook-addon-code-editor)

[Example code using this add-on](./example)

## Get started

Install as a dev dependency.

```sh
npm install --save-dev storybook-addon-code-editor
```

Add `storybook-addon-code-editor` in your `.storybook/main.ts` file and ensure the `staticDirs`, `addons`, and `framework` fields contain the following:

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
    ...getCodeEditorStaticDirs(),

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

<Playground code="export default () => <h1>Hello</h1>;" />
```

<details>
<summary>Example with a wrapping component and modified editor options</summary>

```mdx
import { Playground } from 'storybook-addon-code-editor';

<Playground
  editorOptions={{ minimap: { enabled: false } }}
  wrappingComponent={(props) => (
    <div style={{ background: '#EEE', padding: '10px' }}>{props.children}</div>
  )}
  code="export default () => <h1>Hello</h1>;"
/>
```

</details>

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
  height?: string;
  id?: string | number | symbol;
  modifyEditor?: (monaco: Monaco, editor: Monaco.editor.IStandaloneCodeEditor) => any;
}
```

`React` is automatically imported if `code` does not import it.
React TypeScript definitions will be automatically loaded if `@types/react` is available.

### `createLiveEditStory`

Use the `createLiveEditStory` function in traditional stories:

```ts
// MyComponent.stories.ts
import type { Meta, StoryObj } from '@storybook/react';
import { createLiveEditStory } from 'storybook-addon-code-editor';
import * as MyLibrary from './index';
import storyCode from './MyStory.source.tsx?raw';

const meta = {
  // Story defaults
} satisfies Meta<typeof MyLibrary.MyComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MyStory = createLiveEditStory<Story>({
  availableImports: { 'my-library': MyLibrary },
  code: storyCode,
});
```

`createLiveEditStory` options:

```ts
interface LiveEditStoryOptions {
  availableImports?: {
    [importSpecifier: string]: {
      [namedImport: string]: any;
    };
  };
  code: string;
  modifyEditor?: (monaco: Monaco, editor: Monaco.editor.IStandaloneCodeEditor) => any;
  // Any other Storybook story options, e.g. `args`, `parameters`, etc..
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
  // onMonacoLoad is called when monaco is first loaded and before an editor instance is created.
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

## Contributing

### Install dependencies

```sh
npm install
```

### Run example

```sh
npm run start:example
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
