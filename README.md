# storybook-addon-code-editor

A Storybook add-on for live editing stories. Supports JavaScript and TypeScript.

[Demo](https://jeremyrh.github.io/storybook-addon-code-editor)

[Usage example](./example)

## Get started

Install as a dev dependency.

```sh
npm install --save-dev storybook-addon-code-editor
```

Add `storybook-addon-code-editor` in your `.storybook/main.js` file:

```js
module.exports = {
  addons: [
    'storybook-addon-code-editor',
    ...
```

### `Playground`

Use the `Playground` component in [MDX format](https://storybook.js.org/docs/react/api/mdx).

```jsx
// MyComponent.stories.mdx
import { Playground } from 'storybook-addon-code-editor';

<Playground code="export default () => <h1>H1</h1>;"} />
```

More advanced example:

```jsx
// MyComponent.stories.mdx
import { Playground } from 'storybook-addon-code-editor';
import * as MyLib from './index';
import storyCode from './MyStory.source.tsx?raw';
import ExampleLibraryTypes from '../dist/types.d.ts?raw';

<Playground
  availableImports={{ 'my-lib': MyLib }}
  code={storyCode}
  height="560px"
  modifyEditor={(monaco, editor) => {
    // editor docs: https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneCodeEditor.html
    // monaco docs: https://microsoft.github.io/monaco-editor/api/modules/monaco.html
    editor.getModel().updateOptions({ tabSize: 2 });
    monaco.editor.setTheme('vs-dark');
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      // REACT_TYPES is a variable defined with Webpack's DefinePlugin.
      // See src/preset.ts for more info.
      REACT_TYPES,
      'file:///node_modules/react/index.d.ts'
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      ExampleLibraryTypes,
      'file:///node_modules/example-library/index.d.ts'
    );
  }}
  // setupEditor is called when the editor is rendered for the first time, not when navigating from story to story.
  // Useful for integrating with monaco addons.
  setupEditor={(monaco, createEditor) => {
    return createEditor({ tabSize: 4 });
  }}
/>
```

`Playground` props:

```ts
interface PlaygroundProps {
  code?: string;
  availableImports?: {
    [importSpecifier: string]: {
      [namedImport: string]: any;
    };
  };
  modifyEditor?: (monaco: Monaco, editor: Monaco.editor.IStandaloneCodeEditor) => any;
  setupEditor?: (monaco: Monaco, createEditor: ((options) => Monaco.editor.IStandaloneCodeEditor | void)) => any;
  height?: string;
}
```

`React` is an available import by default and automatically imported if the code does not import it.

### `createLiveEditStory`

Use the `createLiveEditStory` function in traditional stories:

```js
// MyComponent.stories.js
import { createLiveEditStory } from 'storybook-addon-code-editor';
import * as MyLib from './index';
import storyCode from './MyStory.source.tsx?raw';

export const MyStory = createLiveEditStory({
  availableImports: { 'my-lib': MyLib },
  code: storyCode,
});
```

`createLiveEditStory` options:

```ts
interface Options {
  code: string;
  availableImports?: {
    [importSpecifier: string]: {
      [namedImport: string]: any;
    };
  };
  modifyEditor?: (monaco: Monaco, editor: Monaco.editor.IStandaloneCodeEditor) => any;
}
```

## Contributing

### Install dependencies

```sh
npm i
npm run install-example-deps
```

### See example

```sh
npm run start
```

### Build library

```sh
npm run build
```

### Build docs

```sh
npm run docs
```

### Run tests

```sh
npm run test
```

### Format code

```sh
npm run format
```

### Commits

Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) to allow automatic versioned releases.

- `fix:` represents bug fixes, and correlates to a SemVer patch.
- `feat:` represents a new feature, and correlates to a SemVer minor.
- `feat!:`, or `fix!:`, `refactor!:`, etc., represent a breaking change (indicated by the !) and will result in a SemVer major.

### Publishing

The automated [release-please](https://github.com/googleapis/release-please) PR to the main branch can be merged to deploy a release.
