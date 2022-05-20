# storybook-addon-code-editor

A Storybook add-on for live editing stories. Supports JavaScript and TypeScript.

[Demo](https://jeremyrh.github.io/storybook-addon-code-editor)

## Install

Install as a dev dependency.

```sh
npm install --save-dev storybook-addon-code-editor
```

## Use

Add `storybook-addon-code-editor` in your `.storybook/main.js` file:

```js
module.exports = {
  addons: [
    'storybook-addon-code-editor',
    ...
```

### `Playground`

Use the `Playground` component in [MDX format](https://storybook.js.org/docs/react/api/mdx).

```md
// MyComponent.stories.mdx
import { Playground } from 'storybook-addon-code-editor';

<Playground initialCode="export default () => <h1>H1</h1>;"} />
```

More advanced example:

```md
// MyComponent.stories.mdx
import { Playground } from 'storybook-addon-code-editor';

import * as MyLib from './index';

import storyCode from '!!raw-loader!./MyStory.source.tsx'; // Webpack
import storyCode from './MyStory.source.tsx?raw';          // Vite

<Playground
  availableImports={{ 'my-lib': MyLib }}
  initialCode={storyCode}
  height="500px"
/>
```

`Playground` props:

```ts
interface PlaygroundProps {
  availableImports?: {
    [importSpecifier: string]: {
      [namedImport: string]: any;
    };
  };
  initialCode?: string;
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

import storyCode from '!!raw-loader!./MyStory.source.tsx'; // Webpack
import storyCode from './MyStory.source.tsx?raw';          // Vite

export const MyStory = createLiveEditStory({
  availableImports: { 'my-lib': MyLib },
  initialCode: storyCode,
});
```

`createLiveEditStory` options:

```ts
interface Options {
  availableImports?: {
    [importSpecifier: string]: {
      [namedImport: string]: any;
    };
  };
  initialCode?: string;
}
```

## Contributing

### Install dependencies
```sh
npm i
```

### Run Build
```sh
npm run build
```

### Run Tests
```sh
npm run test
```

### Run Formatter
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
