# storybook-addon-code-editor

A Storybook add-on for live editing stories. Supports React and TypeScript.

[Demo](https://jeremyrh.github.io/storybook-addon-code-editor)

[Usage example](./example)

## Get started

Install as a dev dependency.

```sh
npm install --save-dev storybook-addon-code-editor
```

Add `storybook-addon-code-editor` in your `.storybook/main.js` file and add the `staticDirs`:

```js
// .storybook/main.js
const {
  getCodeEditorStaticDirs
} = require('storybook-addon-code-editor/getStaticDirs');

module.exports = {
  addons: [
    'storybook-addon-code-editor',
    ...
  ],
  staticDirs: [
    ...getCodeEditorStaticDirs(),
    ...
```

<details>
<summary>About `staticDirs`</summary>

`staticDirs` sets a list of directories of static files to be loaded by Storybook.
The editor ([monaco-editor](https://github.com/microsoft/monaco-editor)) requires these extra static files to be available at runtime.

Additional static files can be added using the `getExtraStaticDir` helper from `storybook-addon-code-editor/getStaticDirs`:

```js
// .storybook/main.js
const {
  getCodeEditorStaticDirs,
  getExtraStaticDir,
} = require('storybook-addon-code-editor/getStaticDirs');

module.exports = {
  staticDirs: [
    ...getCodeEditorStaticDirs(),
    getExtraStaticDir('monaco-editor/esm'), // hosted at: monaco-editor/esm
    ...
```

</details>

<br />

**Important:**

The default Webpack 4 builder does not work with `storybook-addon-code-editor`.
Please use one of the following:
- [`@storybook/builder-webpack5`](https://github.com/storybookjs/storybook/blob/65dd683883a884e6e31a2e84b0054b0e260078a0/lib/builder-webpack5/README.md)
- [`@storybook/builder-vite`](https://github.com/storybookjs/builder-vite)

<br />

## API

### `Playground`

Use the `Playground` component in [MDX format](https://storybook.js.org/docs/react/api/mdx).

```jsx
// MyComponent.stories.mdx
import { Playground } from 'storybook-addon-code-editor';

<Playground code="export default () => <h1>Hello</h1>;"} />
```

<details>
<summary>More advanced example</summary>

```jsx
// MyComponent.stories.mdx
import { Playground } from 'storybook-addon-code-editor';
import * as MyLibrary from './index';
import storyCode from './MyStory.source.tsx?raw';
import MyLibraryTypes from '../dist/types.d.ts?raw';

<Playground
  availableImports={{ 'my-library': MyLibrary }}
  code={storyCode}
  height="560px"
  modifyEditor={(monaco, editor) => {
    // editor docs: https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneCodeEditor.html
    // monaco docs: https://microsoft.github.io/monaco-editor/api/modules/monaco.html
    editor.getModel().updateOptions({ tabSize: 2 });
    monaco.editor.setTheme('vs-dark');
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      MyLibraryTypes,
      'file:///node_modules/my-library/index.d.ts'
    );
  }}
/>;
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
  modifyEditor?: (monaco: Monaco, editor: Monaco.editor.IStandaloneCodeEditor) => any;
}
```

`React` is automatically imported if `code` does not import it.
React TypeScript definitions will be automatically loaded if `@types/react` is available.

### `createLiveEditStory`

Use the `createLiveEditStory` function in traditional stories:

```js
// MyComponent.stories.js
import { createLiveEditStory } from 'storybook-addon-code-editor';
import * as MyLibrary from './index';
import storyCode from './MyStory.source.tsx?raw';

export const MyStory = createLiveEditStory({
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
}
```

### `setupMonaco`

`setupMonaco` allows customization of [`monaco-editor`](https://github.com/microsoft/monaco-editor).

Use this in your `.storybook/preview.js` to add type definitions or integrations.

Check out [examples of `monaco-editor`](https://github.com/microsoft/monaco-editor/tree/ae158a25246af016a0c56e2b47df83bd4b1c2426/samples) with different configurations.

```js
// .storybook/preview.js
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
npm run install-example-deps
npm run start
```

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
